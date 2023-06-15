#!/usr/bin/env node
import util from "util";
import child_process from "child_process";
const exec = util.promisify(child_process.exec);
import fs from "fs";
import path, { join } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import chalk from "chalk";
import cliProgress from "cli-progress";
import colors from "ansi-colors";

import yaml_to_json from "js-yaml";

export async function computeDiff(path) {
  path = join(path, ".previous_versions");
  var api_commits = fs.readFileSync(join(path, ".api_commits.json"));

  // sort the commits by date

  fs.writeFileSync(join(path, ".diffs.json"), JSON.stringify([]));
  fs.writeFileSync(join(path, ".breaking.json"), JSON.stringify([]));
  fs.writeFileSync(join(path, ".non-breaking.json"), JSON.stringify([]));

  api_commits = JSON.parse(api_commits);
  var api_commits = api_commits.sort((a, b) => {
    // ascending order
    return new Date(a.commit_date) - new Date(b.commit_date);
  });
  console.log(
    chalk.blue(`|- Found ${api_commits.length} commits changing OAS file`)
  );
  console.log(
    // chalk.blue(
    //   `|-- From ${api_commits[0].commit_date} to ${
    //     api_commits[api_commits.length - 1].commit_date
    //   }`
    // )
    // fomart the dats as xxth Month, Year
    chalk.blue(
      `|-- From [${new Date(api_commits[0].commit_date).getDate()}th ${new Date(
        api_commits[0].commit_date
      ).toLocaleString("default", {
        month: "long",
      })}, ${new Date(
        api_commits[0].commit_date
      ).getFullYear()}] to [${new Date(
        api_commits[api_commits.length - 1].commit_date
      ).getDate()}th ${new Date(
        api_commits[api_commits.length - 1].commit_date
      ).toLocaleString("default", {
        month: "long",
      })}, ${new Date(
        api_commits[api_commits.length - 1].commit_date
      ).getFullYear()}]`
    )
  );

  // show progress bar
  // add text near the bar
  var bar = new cliProgress.SingleBar(
    {
      format:
        "|- Computing diffs - " +
        colors.cyan("{bar}") +
        "| {percentage}% || {value}/{total} Chunks || Speed: {speed}",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
    },

    cliProgress.Presets.rect
  );

  bar.start(api_commits.length - 1, 0, {
    speed: "N/A",
  });

  var next_pair = async (i) => {
    bar.update(i);
    if (api_commits[i]) {
      try {
        var cmd = `oasdiff -base  ${join(
          path,
          api_commits[i - 1].hash + "." + api_commits[i - 1].fileExtension
        )} -revision ${join(
          path,
          api_commits[i].hash + "." + api_commits[i].fileExtension
        )} -exclude-examples`;

        var { stdout, stderr } = await exec(cmd);
        // convert yaml to json

        stdout = yaml_to_json.load(stdout);

        var diffs = fs.readFileSync(join(path, ".diffs.json"));
        diffs = JSON.parse(diffs);
        diffs.push({
          hash: api_commits[i].hash,
          diff: stdout,
          commit_date: api_commits[i].commit_date,
        });

        fs.writeFileSync(join(path, ".diffs.json"), JSON.stringify(diffs));

        // diff 1 -check-non-breaking
        if (stdout) {
          var nonBreakingChanges = await extractNonBreakingChanges(stdout);
          var nonBreakingChangesArray = fs.readFileSync(
            join(path, ".non-breaking.json")
          );
          nonBreakingChangesArray = JSON.parse(nonBreakingChangesArray);
          nonBreakingChangesArray.push({
            hash: api_commits[i].hash,
            nonBreakingChanges: nonBreakingChanges,
            commit_date: api_commits[i].commit_date,
          });
          fs.writeFileSync(
            join(path, ".non-breaking.json"),
            JSON.stringify(nonBreakingChangesArray)
          );
        }

        // diff 2 -check-breaking
        var cmd_2 = `oasdiff -check-breaking -base  ${join(
          path,
          api_commits[i - 1].hash + "." + api_commits[i - 1].fileExtension
        )} -revision ${join(
          path,
          api_commits[i].hash + "." + api_commits[i].fileExtension
        )} -exclude-examples  -format json`;

        var { stdout, stderr } = await exec(cmd_2);

        var diff_2 = stdout;
        var breaking = fs.readFileSync(join(path, ".breaking.json"));
        breaking = JSON.parse(breaking);
        breaking.push({
          hash: api_commits[i].hash,
          breaking: JSON.parse(diff_2),
          commit_date: api_commits[i].commit_date,
        });
        fs.writeFileSync(
          join(path, ".breaking.json"),
          JSON.stringify(breaking)
        );
      } catch (error) {
        // if (error.reason != "duplicated mapping key") console.log(error);
      }

      if (i < api_commits.length-1) {
        i++;
        return await next_pair(i);
      } else {
        console.log(chalk.blue("|- Done"));
        bar.stop();
        return;
      }
    } else {
      console.log(chalk.blue("|- Done"));

      return;
    }
  };

   await next_pair(1);
  //  bar.stop();
   return 
}

async function extractNonBreakingChanges(diff) {
  var nonBreakingChanges = {
    "api title added": 0,
    "api title modified": 0,
    "api description added": 0,
    "api description modified": 0,
    "api version added": 0,
    "api version modified": 0,
    "api contact deleted": 0,
    "api contact added": 0,
    "api contact modified": 0,
    "api license deleted": 0,
    "api license added": 0,
    "api license modified": 0,
    "server deleted": 0,
    "server added": 0,
    "server modified": 0,
    "path added": 0,
    "path parameter added": 0,
    "path parameter deleted": 0,
    "path parameter modified": 0,
  };

  // INFO CHANGE FEATURES
  // API TITLE CHANGE FEATURES
  if (diff.info) {
    if (diff.info.title) {
      if (diff.info.title.from == "" && diff.info.title.to != "") {
        nonBreakingChanges["api title added"]++;
      } else nonBreakingChanges["api title modified"]++;
    }
    // API DESCRIPTION CHANGE FEATURES
    if (diff.info.description) {
      if (diff.info.description.from == "" && diff.info.description.to != "") {
        nonBreakingChanges["api description added"]++;
      } else nonBreakingChanges["api description modified"]++;
    }
    // API VERSION CHANGE FEATURES
    if (diff.info.version) {
      if (diff.info.version.from == "" && diff.info.version.to != "") {
        nonBreakingChanges["api version added"]++;
      } else nonBreakingChanges["api version modified"]++;
    }
    // API CONTACT CHANGE FEATURES
    if (diff.info.contact) {
      if (diff.info.contact.delete) nonBreakingChanges["api contact deleted"]++;
      else if (diff.info.contact.added)
        nonBreakingChanges["api contact added"]++;
      else if (diff.info.contact.modified)
        nonBreakingChanges["api contact modified"]++;
    }
    // API LICENSE CHANGE FEATURES
    if (diff.info.license) {
      if (diff.info.license.delete) nonBreakingChanges["api license deleted"]++;
      else if (diff.info.license.added)
        nonBreakingChanges["api license added"]++;
      else if (diff.info.license.modified)
        nonBreakingChanges["api license modified"]++;
    }

    // SERVER CHANGE FEATURES
    if (diff.info.servers) {
      if (diff.info.servers.delete) nonBreakingChanges["server deleted"]++;
      else if (diff.info.servers.added) nonBreakingChanges["server added"]++;
      else if (diff.info.servers.modified)
        nonBreakingChanges["server modified"]++;
    }
  }

  // PATH CHANGE FEATURES
  if (diff.paths) {
    if (diff.paths.added)
      nonBreakingChanges["path added"] += diff.paths.added.length;
    if (diff.paths.modified) {
      var modifications = Object.values(diff.paths.modified);
      var operations = modifications
        .map((mod) => {
          return mod.operations;
        })
        .flat()
        .filter((p) => p);

      if (operations.length > 0) {
        var methods = operations
          .map((op) => {
            return Object.values(op);
          })
          .flat();

        methods.forEach((method) => {
          // get keys
          var keys = Object.keys(method)[0];
          if (method[keys].description) {
            var change = `desc of ${keys} modified`;
            if (!nonBreakingChanges[change]) {
              nonBreakingChanges[change] = 1;
            } else {
              nonBreakingChanges[change]++;
            }
          }

          if (method[keys].summary) {
            var change = `summary of ${keys} modified`;
            if (!nonBreakingChanges[change]) {
              nonBreakingChanges[change] = 1;
            } else {
              nonBreakingChanges[change]++;
            }
          }

          if (method[keys].deprecated) {
            //if set to true
            if (
              method[keys].deprecated.from == false &&
              method[keys].deprecated.to == true
            ) {
              var change = `${keys} deprecated`;
              if (!nonBreakingChanges[change]) {
                nonBreakingChanges[change] = 1;
              } else {
                nonBreakingChanges[change]++;
              }
            }
          }

          if (method[keys].responses) {
            if (method[keys].responses.added) {
              var change = `resp added to ${keys}`;
              if (!nonBreakingChanges[change]) {
                nonBreakingChanges[change] = 1;
              } else {
                nonBreakingChanges[change]++;
              }
            }
            if (method[keys].responses.modified) {
              var keysResponses = Object.keys(method[keys].responses.modified);
              keysResponses.forEach((key) => {
                if (method[keys].responses.modified[key].description) {
                  var change = `desc of response  of ${keys} modified`;
                  if (!nonBreakingChanges[change]) {
                    nonBreakingChanges[change] = 1;
                  } else {
                    nonBreakingChanges[change]++;
                  }
                }

                if (method[keys].responses.modified[key].content) {
                  var content =
                    method[keys].responses.modified[key].content
                      .mediaTypeModified;
                  if (content) {
                    var schemas = Object.values(content)
                      .map((c) => {
                        return c.schema;
                      })
                      .flat();

                    schemas.forEach((c) => {
                      if (c.description) {
                        var change = `desc schema of response modified`;
                        //`desc schema of response ${key}/${keys} modified`;
                        if (!nonBreakingChanges[change]) {
                          nonBreakingChanges[change] = 1;
                        } else {
                          nonBreakingChanges[change]++;
                        }
                      }
                      if (c.title) {
                        // `title schema of response ${key}/${keys} modified`
                        var change = `title schema of response modified`;
                        if (!nonBreakingChanges[change]) {
                          nonBreakingChanges[change] = 1;
                        } else {
                          nonBreakingChanges[change]++;
                        }
                      }
                      if (c.required) {
                        var requiredAction = Object.values(c.required);
                        if (requiredAction) {
                          var deleted = requiredAction.filter((r) => {
                            return r.deleted;
                          });

                          var change =
                            //`unrequired schema property of response ${key}/${keys} modified`;
                            `unrequired schema property of resp`;
                          if (!nonBreakingChanges[change]) {
                            nonBreakingChanges[change] = deleted.length;
                          } else {
                            nonBreakingChanges[change] += deleted.length;
                          }
                        }
                      }

                      if (c.type) {
                        var change = `type of schema modified`;
                        //`type schema of response ${key}/${keys} modified`;
                        if (!nonBreakingChanges[change]) {
                          nonBreakingChanges[change] = 1;
                        } else {
                          nonBreakingChanges[change]++;
                        }
                      }

                      if (c.format) {
                        var change = `format of schema modified`;
                        // `format schema of response ${key}/${keys} modified`;
                        if (!nonBreakingChanges[change]) {
                          nonBreakingChanges[change] = 1;
                        } else {
                          nonBreakingChanges[change]++;
                        }
                      }

                      if (c.properties) {
                        if (c.properties.added) {
                          var change = `property added to schema of resp`;
                          //`property added to schema of response ${key}/${keys}`;
                          if (!nonBreakingChanges[change]) {
                            nonBreakingChanges[change] = 1;
                          } else {
                            nonBreakingChanges[change]++;
                          }
                        }

                        if (c.properties.modified) {
                          var properties = Object.values(c.properties.modified);
                          properties.forEach((p) => {
                            if (p.description) {
                              var change = `desc schema property of resp`;
                              //`desc schema property  of resp ${key}/${keys} modified`;
                              if (!nonBreakingChanges[change]) {
                                nonBreakingChanges[change] = 1;
                              } else {
                                nonBreakingChanges[change]++;
                              }
                            }
                            if (p.required) {
                              var requiredAction = Object.values(p.required);
                              if (requiredAction) {
                                var deleted = requiredAction.filter((r) => {
                                  return r.deleted;
                                });

                                var change = `unrequired schema property of resp`;
                                // `unrequired schema property of resp ${key}/${keys}`;
                                if (!nonBreakingChanges[change]) {
                                  nonBreakingChanges[change] = deleted.length;
                                } else {
                                  nonBreakingChanges[change] += deleted.length;
                                }
                              }
                            }
                          });
                        }
                      }
                    });
                  }
                }
              });
            }
          }
        });

        //   console.log(methods);
      }

      var parameters = modifications
        .map((mod) => {
          return mod.parameters;
        })
        .flat()
        .filter((p) => p);

      if (parameters.length > 0) {
        // if a query parameter is added
        var added = parameters.filter((p) => {
          return p.added;
        });

        if (added.length > 0) {
          var added_query = added.filter((p) => {
            return p.query;
          });

          if (added_query.length > 0) {
            var change = `query parameter added`;
            if (!nonBreakingChanges[change]) {
              nonBreakingChanges[change] = added_query.length;
            } else {
              nonBreakingChanges[change] += added_query.length;
            }
          }
        }
      }
    }
  }
  return nonBreakingChanges;
}
