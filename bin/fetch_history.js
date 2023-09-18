#!/usr/bin/env node
/**
 * This script is used to fetch the history of a given git repository.
 * For a given repository, if an openapi file is found in the root file of the repo then its history is fetched.
 */

import { execSync } from "child_process";
import fs from "fs";
import cliProgress from "cli-progress";
import { join } from "path";
import SwaggerParser from "@apidevtools/swagger-parser";
import simpleGit from "simple-git";
import cliselect from "cli-select";
import chalk from "chalk";
import colors from "ansi-colors";
import semver from "semver";
import { runExpresso } from "./oasgen/oasgen.js";

export const fetchOASFiles = async (repoPath, all) => {
  const files = fs.readdirSync(repoPath);
  const openapiFiles = files.filter((file) => {
    const fileExtension = file.split(".").pop();
    return (
      fileExtension === "json" ||
      fileExtension === "yaml" ||
      fileExtension === "yml"
    );
  });

  const yamlJson = openapiFiles.map(async (file) => {
    try {
      let oas = await SwaggerParser.parse(join(repoPath, file));
      return { oaspath: join(file), oas: oas };
    } catch (err) {
      console.log(
        "|- " + chalk.red("Error") + " in parsing " + chalk.underline(file) //+
        // " : " +
        // err.message
     
      );
      return false;
    }
  });

  let validOAS = await Promise.all(yamlJson);
  validOAS = validOAS.filter((oas) => oas !== false);

  console.log(
    "|- " +
      validOAS.length +
      " parsable OAS files found in the root directory of the repo"
  );

  // use cli-select to select the oas file to use
  // if no OAS file is found in the root directory of the repo throw an exception
  if (validOAS.length === 0) {
    // code 100
    let err = new Error("No OAS file found in the root directory of the repo");
    err.code = "NoOASFileFound";
    err.name = "NoOASFileFound";
    // throw err;
    // console.log(err);
    console.log(`Generate a OAS files from repository history? (y/n)`);
    let selected = await cliselect({
      values: ["Yes", "No"],
      valueRenderer: (value, selected) => {
        if (selected) {
          return chalk.underline(value);
        }
        return value;
      },
    });

    if (selected.value == "Yes") {
      let history_metadata = await fetchOlderVersions(
        repoPath,
        ".previous_versions"
      );
      return history_metadata;
    } else {
      console.log("No OAS file found in the root directory of the repo");
      process.exit(0);
    }
  }

  if (!all) {
    let selected = await cliselect({
      values: validOAS.map((oas) => oas.oaspath),
      valueRenderer: (value, selected) => {
        if (selected) {
          return chalk.underline(value);
        }
        return value;
      },
    });
    validOAS = validOAS.filter((f) => f.oaspath == selected.value);
  }

  return validOAS;
};

export const fetchHistory = async (repoPath, oaspath) => {
  let gitRemote = "";
  let remoteUrl = "";
  try {
    gitRemote = fs.readFileSync(join(repoPath, ".git", "config"), "utf8");
    gitRemote = gitRemote.split("\n");
    
    for (let j = 0; j < gitRemote.length; j++) {
      if (gitRemote[j].includes("url")) {
        remoteUrl = gitRemote[j].split("=")[1].trim();
      }
    }
  } catch (err) {
    console.log("No remote url found");
  }

  let history_metadata = {};

  let previousVersions = await getPreviousVersionsOfFile(repoPath, oaspath);

  let data = previousVersions.map((version) => {
    return {
      commit_date: new Date(version.date),
      hash: version.hash,
      fileExtension: version.fileExtension,
    };
  });

  previousVersions.sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  fs.mkdirSync(join(repoPath, ".previous_versions"), { recursive: true });
  fs.mkdirSync(join(repoPath, ".previous_versions", oaspath.split(".")[0]), {
    recursive: true,
  });

  fs.writeFileSync(
    join(
      repoPath,
      ".previous_versions",
      oaspath.split(".")[0],
      ".api_commits.json"
    ),
    JSON.stringify(data)
  );
  let invalidFiles = [];
  let apiTitles = [];
  let apiVersions = [];
  let uniqueVersion = [];

  let nextVersion = async (i) => {
    let version = previousVersions[i];

    // console.log(version)

    fs.writeFileSync(
      join(
        repoPath,
        ".previous_versions",
        oaspath.split(".")[0],
        `${version.hash}.${version.fileExtension}`
      ),
      version.content
    );
    try {
      const oas = await SwaggerParser.validate(
        join(
          repoPath,
          ".previous_versions",
          oaspath.split(".")[0],
          `${version.hash}.${version.fileExtension}`
        )
      );

      let title = {
        title: oas.info?.title,
        commit_date: version.date,
        hash: version.hash,
        version: oas.info?.version,
      };
      // if the last commit has the same title as this commit then do not add it to the list
      if (apiTitles.length == 0) apiTitles.push(title);
      else if (apiTitles[apiTitles.length - 1].title !== title.title)
        apiTitles.push(title);
      let api_version = {
        hash: version.hash,
        commit_date: version.date,
        version: oas.info?.version,
      };

      apiVersions.push(api_version);

      // if the last commit has the same version as this commit then do not add it to the list
      if (uniqueVersion.length == 0) uniqueVersion.push(api_version);
      else if (
        uniqueVersion[uniqueVersion.length - 1].version !== api_version.version
      )
        uniqueVersion.push(api_version);
    } catch (err) {
      // console.log(err.message);
      invalidFiles.push({ hash: version.hash, commit_date: version.date });
    }

    i++;
    if (i < previousVersions.length) {
      await nextVersion(i);
    } else {
      history_metadata["invalid_files"] = invalidFiles;
      history_metadata["first_commit"] = previousVersions[0].date;
      history_metadata["last_commit"] =
        previousVersions[previousVersions.length - 1].date;
      history_metadata["total_commits"] = previousVersions.length;
      history_metadata["api_titles"] = apiTitles;
      history_metadata["unique_versions"] = uniqueVersion;

      history_metadata["age"] = Math.round(
        (new Date(previousVersions[previousVersions.length - 1].date) -
          new Date(previousVersions[0].date)) /
          (1000 * 60 * 60 * 24)
      );
      history_metadata["git_url"] = remoteUrl;
      history_metadata["oas_file"] = oaspath;

      return history_metadata;
    }
  };
  if (previousVersions.length > 0) await nextVersion(0);
  else {
    console.log("No previous versions found");
    return;
  }

  // console.log(history_metadata)
  const api_commits = JSON.parse(
    fs.readFileSync(
      join(
        repoPath,
        ".previous_versions",
        oaspath.split(".")[0],
        ".api_commits.json"
      )
    )
  );
  const new_api_commits = api_commits.filter(
    (commit) =>
      !history_metadata.invalid_files.map((c) => c.hash).includes(commit.hash)
  );

  fs.writeFileSync(
    join(
      repoPath,
      ".previous_versions",
      oaspath.split(".")[0],
      ".api_commits.json"
    ),
    JSON.stringify(new_api_commits)
  );

  return history_metadata;
};

// get all the versions of the oas file
async function getPreviousVersionsOfFile(repositoryPath, filePath) {
  const git = simpleGit(repositoryPath);

  console.log("|- Fetching history of the file: " + filePath);
  const logOptions = [
    "--name-only",
    "--pretty=format:%H",
    "--follow",
    "--",
    filePath,
  ];

  const log = await git.log(logOptions);
  // console.log(log);
  const commits = log.all[0].hash.split("\n");

  let hashes = commits.filter((commit, index) => {
    return index % 3 === 0;
  });

  const previousVersions = [];
  for (const commit of hashes) {
    try {
      const fileContent = await git.catFile(["-p", `${commit}:${filePath}`]);
      // get file extension
      const fileExtension = filePath.split(".").pop();
      // get commit date
      const commitDate = await git.show(["-s", "--format=%ci", commit]);
      previousVersions.push({
        hash: commit,
        content: fileContent,
        date: commitDate,
        fileExtension: fileExtension,
      });
    } catch (err) {
      // console.log(err)
    }
  }
  // sort the previous versions by date
  previousVersions.sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  return previousVersions;
}

async function fetchOlderVersions(repoPath, targetFolder) {
  let gitRemote = "";
  let remoteUrl = "";
  try {
    gitRemote = fs.readFileSync(join(repoPath, ".git", "config"), "utf8");
    gitRemote = gitRemote.split("\n");

    for (let j = 0; j < gitRemote.length; j++) {
      if (gitRemote[j].includes("url")) {
        remoteUrl = gitRemote[j].split("=")[1].trim();
      }
    }
  } catch (err) {
    console.log("No remote url found");
  }

  const git = simpleGit(repoPath);

  // Fetch all branches
  await git.fetch("--all");

  const logOptions = ["--pretty=format:%H", "--reverse"];

  let log = await git.log(logOptions);
  const hashes = log.all[0].hash.split("\n");
  // let hashes = commits.filter((commit, index) => {
  //   return index % 3 === 0;
  // });
  //let hashes = commits;
  let previousVersions = [];

  let bar = new cliProgress.SingleBar(
    {
      format:
        "|- Generating OAS - " +
        colors.cyan("{bar}") +
        "| {percentage}% || {value}/{total} Chunks || Speed: {speed}",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
    },

    cliProgress.Presets.rect
  );

  bar.start(hashes.length - 1, 0, {
    speed: "N/A",
  });
  let nextHash = async (i) => {
    bar.update(i, {
      speed: "N/A",
    });
    let commit = hashes[i];
    const targetRepoPath = join(
      repoPath,
      targetFolder,
      "expresso-openapi",
      commit
    );

    if (!fs.existsSync(join(repoPath, targetFolder)))
      fs.mkdirSync(join(repoPath, targetFolder)), { recursive: true };
    if (!fs.existsSync(join(repoPath, targetFolder, "expresso-openapi")))
      fs.mkdirSync(join(repoPath, targetFolder, "expresso-openapi")),
        { recursive: true };
    if (fs.existsSync(targetRepoPath))
      fs.rmSync(targetRepoPath, { recursive: true });

    fs.mkdirSync(targetRepoPath), { recursive: true };

    // delete all the files in the target folder

    // Clone the original repository to the target repository
    await git.clone(repoPath, targetRepoPath);

    // Checkout the specific commit in the target repository
    const targetGit = simpleGit(targetRepoPath);
    await targetGit.checkout(commit);

    // run expresso
    const commitDate = await git.show(["-s", "--format=%ci", commit]);
    await runExpresso(targetRepoPath);

    if (fs.existsSync(join(targetRepoPath, "expresso-openapi.json"))) {
      let generated = JSON.parse(
        fs.readFileSync(join(targetRepoPath, "expresso-openapi.json"), "utf8")
      );
      let diff = true;
      // compare the generated file with the previous version i-1 in case of i > 0
      // in case it is not different set diff = false
      if (i > 0) {
        const previousVersion = previousVersions[i - 1];
        if (previousVersion) {
          if (
            JSON.stringify(previousVersion.content) ===
            JSON.stringify(generated)
          ) {
            diff = false;
          }
        }
      }
      if (diff) {
        fs.copyFileSync(
          join(targetRepoPath, "expresso-openapi.json"),
          join(targetRepoPath, "..", commit + ".json")
        );
        fs.unlinkSync(join(targetRepoPath, "expresso-openapi.json"));
        previousVersions.push({
          hash: commit,
          date: commitDate,
          content: generated,
        });
      }
    }
    fs.rmSync(join(targetRepoPath), { recursive: true });

    if (i < hashes.length - 1) {
      return await nextHash(i + 1);
    } else {
      bar.stop();
      // sort the previous versions by date
      previousVersions.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });

      // write to file .commits.json
      fs.writeFileSync(
        join(repoPath, targetFolder, "expresso-openapi", ".api_commits.json"),
        JSON.stringify(previousVersions)
      );

      let history_metadata = {};
      history_metadata["first_commit"] = previousVersions[0].date;
      history_metadata["last_commit"] =
        previousVersions[previousVersions.length - 1].date;
      history_metadata["total_commits"] = previousVersions.length;
      history_metadata["age"] = Math.round(
        (new Date(previousVersions[previousVersions.length - 1].date) -
          new Date(previousVersions[0].date)) /
          (1000 * 60 * 60 * 24)
      );
      history_metadata["git_url"] = remoteUrl;
      history_metadata["api_titles"] = ["GENERATED OAS"];
      history_metadata["unique_versions"] = ["GENERATED OAS"];
      history_metadata["oas_file"] = "expresso-openapi.json";

      return history_metadata;
    }
  };

  return {
    history_metadata: await nextHash(0),
    oaspath: "expresso-openapi.json",
  };
}
