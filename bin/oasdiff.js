#!/usr/bin/env node

/**
 *
 * This script computes the diffs between the OAS files in the repository.
 * It also extracts the breaking and non breaking changes.
 *
 */
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


export async function compute_diff(path, oaspath, isFast) {
  let diffs_file = fs.existsSync(
    join(path, ".previous_versions", oaspath.split(".")[0], ".diffs.json")
  )

  if (
    !isFast ||
    (isFast &&
      !diffs_file)
  ) {
    path = join(path, ".previous_versions", oaspath.split(".")[0]);
    let api_commits = fs.readFileSync(join(path, ".api_commits.json"));
    api_commits = JSON.parse(api_commits);

    // initialize diffs file
    fs.writeFileSync(
      join(path, ".diffs.json"),
      JSON.stringify([
        {
          hash: api_commits[0].hash,
          diff: {},
          commit_date: api_commits[0].commit_date,
        },
      ])
    );
    fs.writeFileSync(join(path, ".breaking.json"), JSON.stringify([]));
    fs.writeFileSync(join(path, ".non-breaking.json"), JSON.stringify([]));
    ////
    // CLI logs
    let bar = new cliProgress.SingleBar(
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
    if (true) { // TODO: add a flag to disable logs
      console.log(
        chalk.blue(`|- Found ${api_commits.length} commits changing OAS file`)
      );
      console.log(
        chalk.blue(
          `|-- From [${new Date(
            api_commits[0].commit_date
          ).getDate()}th ${new Date(api_commits[0].commit_date).toLocaleString(
            "default",
            {
              month: "long",
            }
          )}, ${new Date(
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

      bar.start(api_commits.length - 1, 0, {
        speed: "N/A",
      });
    }

    const next_pair = async (i) => {
      if (false) { // TODO: add a flag to disable/enable diffs logs
        console.log(
          chalk.blue(
            `|-- Computing diff between ${api_commits[i - 1].hash} and ${api_commits[i].hash
            }`
          )
        );
      }
      bar.update(i);

      if (api_commits[i]) {
        const cmd = `cd ${__dirname}/oasdiff && go run main.go diff  ${join(
          path,
          api_commits[i - 1].hash + "." + api_commits[i - 1].fileExtension
        )}  ${join(
          path,
          api_commits[i].hash + "." + api_commits[i].fileExtension
        )} -f json`;



        try {
          const { stdout } = await exec(cmd);
          if (fs.existsSync(join(path, ".diffs.json")))
            var diffs = JSON.parse(fs.readFileSync(join(path, ".diffs.json")));
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
          const cmd_2 = `cd ${__dirname}/oasdiff && go run main.go breaking  ${join(
            path,
            api_commits[i - 1].hash + "." + api_commits[i - 1].fileExtension
          )}  ${join(
            path,
            api_commits[i].hash + "." + api_commits[i].fileExtension
          )} -f json`;

          const stdout_breaking = await exec(cmd_2);
          var breaking = fs.readFileSync(join(path, ".breaking.json"));
          breaking = JSON.parse(breaking);
          breaking.push({
            hash: api_commits[i].hash,
            breaking: JSON.parse(stdout_breaking.stdout),
            commit_date: api_commits[i].commit_date,
          });
          fs.writeFileSync(
            join(path, ".breaking.json"),
            JSON.stringify(breaking)
          );
        } catch (error) {
          console.log(error);
          // if (error.reason != "duplicated mapping key") console.log(error);
        }

        if (i < api_commits.length - 1) {
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
  }
  else {
    console.log(("|- Fast mode. Diff files already exist."));
  }
  return;
}

async function extractNonBreakingChanges(diff) {
  var nonBreakingChanges = {};

  if (diff.info) {
    if (diff.info.title) {
      if (diff.info.title.from == "" && diff.info.title.to != "") {
        if (nonBreakingChanges["api title added"]) {
          nonBreakingChanges["api title added"]++;
        }
      } else if (nonBreakingChanges["api title modified"]) {
        nonBreakingChanges["api title modified"]++;
      } else {
        nonBreakingChanges["api title modified"] = 1;
      }
    }
    // API DESCRIPTION CHANGE FEATURES
    if (diff.info.description) {
      if (diff.info.description.from == "" && diff.info.description.to != "") {
        if (nonBreakingChanges["api description added"]) {
          nonBreakingChanges["api description added"]++;
        } else nonBreakingChanges["api description added"] = 1;
      } else if (nonBreakingChanges["api description modified"]) {
        nonBreakingChanges["api description modified"]++;
      } else nonBreakingChanges["api description modified"] = 1;
    }
    // API VERSION CHANGE FEATURES
    if (diff.info.version) {
      if (diff.info.version.from == "" && diff.info.version.to != "") {
        if (nonBreakingChanges["api version added"]) {
          nonBreakingChanges["api version added"]++;
        } else {
          nonBreakingChanges["api version added"] = 1;
        }
      }
      if (diff.info.version.from != "" && diff.info.version.to != "") {
        if (nonBreakingChanges["api version modified"]) {
          nonBreakingChanges["api version modified"]++;
        } else {
          nonBreakingChanges["api version modified"] = 1;
        }
      }

      if (diff.info.version.from != "" && diff.info.version.to == "") {
        if (nonBreakingChanges["api version deleted"]) {
          nonBreakingChanges["api version deleted"]++;
        } else {
          nonBreakingChanges["api version deleted"] = 1;
        }
      }
    }
    // API CONTACT CHANGE FEATURES
    if (diff.info.contact) {
      if (diff.info.contact) {
        // api contact info modified
        if (nonBreakingChanges["api contact modified"]) {
          nonBreakingChanges["api contact modified"]++;
        } else {
          nonBreakingChanges["api contact modified"] = 1;
        }
      }
    }
    // API LICENSE CHANGE FEATURES
    if (diff.info.license) {
      if (diff.info.license.delete)
        if (nonBreakingChanges["api license deleted"]) {
          nonBreakingChanges["api license deleted"]++;
        } else {
          nonBreakingChanges["api license deleted"] = 1;
        }
      else if (diff.info.license.added)
        if (nonBreakingChanges["api license added"]) {
          nonBreakingChanges["api license added"]++;
        } else {
          nonBreakingChanges["api license added"] = 1;
        }
      else if (diff.info.license.modified)
        if (nonBreakingChanges["api license modified"]) {
          nonBreakingChanges["api license modified"]++;
        } else {
          nonBreakingChanges["api license modified"] = 1;
        }
    }

    // SERVER CHANGE FEATURES
    if (diff.info.servers) {
      if (diff.info.servers.delete)
        if (nonBreakingChanges["server deleted"]) {
          nonBreakingChanges["server deleted"]++;
        } else {
          nonBreakingChanges["server deleted"] = 1;
        }
      else if (diff.info.servers.added)
        if (nonBreakingChanges["server added"]) {
          nonBreakingChanges["server added"]++;
        } else {
          nonBreakingChanges["server added"] = 1;
        }
      else if (diff.info.servers.modified)
        if (nonBreakingChanges["server modified"]) {
          nonBreakingChanges["server modified"]++;
        } else {
          nonBreakingChanges["server modified"] = 1;
        }
    }
  }

  // PATH CHANGE FEATURES
  if (diff.paths) {
    if (diff.paths.added)
      if (nonBreakingChanges["path added"]) {
        nonBreakingChanges["path added"] += diff.paths.added.length;
      } else {
        nonBreakingChanges["path added"] = diff.paths.added.length;
      }
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

          if (method[keys].operationId) {
            var change = `operationId of ${keys} modified`;
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
                            if (p.properties?.added) {
                              var change = `property added to schema of resp`;
                              //`property added to schema of response ${key}/${keys}`;
                              if (!nonBreakingChanges[change]) {
                                nonBreakingChanges[change] = 1;
                              } else {
                                nonBreakingChanges[change]++;
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

          if (method[keys].tags) {
            if (method[keys].tags.added || method[keys].tags.deleted) {
              var change = `tags of ${keys} modified`;
              if (!nonBreakingChanges[change]) {
                nonBreakingChanges[change] = 1;
              } else {
                nonBreakingChanges[change]++;
              }
            }
          }

          if (method[keys].requestBody?.content?.mediaTypeModified) {
            var content = method[keys].requestBody.content.mediaTypeModified;
            if (content) {
              var schemas = Object.values(content)
                .map((c) => {
                  return c.schema;
                })
                .flat()
                .filter((c) => c);

              schemas.forEach((c) => {
                if (c.description) {
                  var change = `desc schema of request modified`;
                  //`desc schema of response ${key}/${keys} modified`;
                  if (!nonBreakingChanges[change]) {
                    nonBreakingChanges[change] = 1;
                  } else {
                    nonBreakingChanges[change]++;
                  }
                }
                if (c.title) {
                  // `title schema of response ${key}/${keys} modified`
                  var change = `title schema of request modified`;
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
                      `unrequired schema property of request`;
                    if (!nonBreakingChanges[change]) {
                      nonBreakingChanges[change] = deleted.length;
                    } else {
                      nonBreakingChanges[change] += deleted.length;
                    }
                  }
                }

                // these are breaking changes

                // if (c.type) {
                //   var change = `type of schema modified`;
                //   //`type schema of response ${key}/${keys} modified`;
                //   if (!nonBreakingChanges[change]) {
                //     nonBreakingChanges[change] = 1;
                //   } else {
                //     nonBreakingChanges[change]++;
                //   }
                // }

                // if (c.format) {
                //   var change = `format of schema modified`;
                //   // `format schema of response ${key}/${keys} modified`;
                //   if (!nonBreakingChanges[change]) {
                //     nonBreakingChanges[change] = 1;
                //   } else {
                //     nonBreakingChanges[change]++;
                //   }
                // }

                if (c.properties) {
                  if (c.properties.added) {
                    var change = `property added to schema of request`;
                    //`property added to schema of response ${key}/${keys}`;
                    if (!nonBreakingChanges[change]) {
                      nonBreakingChanges[change] = 1;
                    } else {
                      nonBreakingChanges[change]++;
                    }
                  }
                }
              });
            }
          }

          if (method[keys].parameters?.modified) {
            var parameters = Object.values(method[keys].parameters.modified);
            parameters.forEach((p) => {
              if (p.description) {
                var change = `desc of parameter modified`;
                //`desc of parameter ${key}/${keys} modified`;
                if (!nonBreakingChanges[change]) {
                  nonBreakingChanges[change] = 1;
                } else {
                  nonBreakingChanges[change]++;
                }
              }
              if (p.body) {
                if (p.body.schema) {
                  var schema = p.body.schema;
                  if (schema?.additionalPropertiesAllowed) {
                    if (
                      schema?.additionalPropertiesAllowed?.from == null ||
                      schema?.additionalPropertiesAllowed?.to == false
                    ) {
                      var change = `additional properties from null to false`;
                      //`additional properties not allowed for parameter ${key}/${keys}`;
                      if (!nonBreakingChanges[change]) {
                        nonBreakingChanges[change] = 1;
                      } else {
                        nonBreakingChanges[change]++;
                      }
                    }
                    if (
                      schema?.additionalPropertiesAllowed?.from == false ||
                      schema?.additionalPropertiesAllowed?.to == true
                    ) {
                      var change = `additional properties from false to true`;
                      //`additional properties allowed for parameter ${key}/${keys}`;
                      if (!nonBreakingChanges[change]) {
                        nonBreakingChanges[change] = 1;
                      } else {
                        nonBreakingChanges[change]++;
                      }
                    }
                  } else if (schema?.additionalProperties) {
                  }
                }
              } else if (Object.keys(p).length > 0) {
                var change = `body of parameter modified`;
                //`body of parameter ${key}/${keys} modified`;
                if (!nonBreakingChanges[change]) {
                  nonBreakingChanges[change] = 1;
                } else {
                  nonBreakingChanges[change]++;
                }
              }
            });
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

  if (diff.tags) {
    if (diff.tags.added || diff.tags.deleted) {
      var change = `API tags modified`;
      if (!nonBreakingChanges[change]) {
        nonBreakingChanges[change] = 1;
      } else {
        nonBreakingChanges[change]++;
      }
    }
  }

  return nonBreakingChanges;
}
