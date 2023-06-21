#!/usr/bin/env node
/**
 * This script is used to fetch the history of a given git repository.
 * For a given repository, if an openapi file is found in the root file of the repo then its history is fetched.
 */

import { execSync } from "child_process";
import fs from "fs";
import { join } from "path";
import SwaggerParser from "@apidevtools/swagger-parser";
import simpleGit from "simple-git";
import cliselect from "cli-select";
import chalk from "chalk";

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
      // if(all)
      // repoPath = join(repoPath,file.split(".")[0], file)

      var oas = await SwaggerParser.validate(join(repoPath, file));
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

  var validOAS = await Promise.all(yamlJson);
  validOAS = validOAS.filter((oas) => oas !== false);

  console.log(
    "|- " +
      validOAS.length +
      " OAS files found in the root directory of the repo"
  );

  // use cli-select to select the oas file to use
  // if no OAS file is found in the root directory of the repo throw an exception
  if (validOAS.length === 0) {
    // code 100
    var err = new Error("No OAS file found in the root directory of the repo");
    err.code = "NoOASFileFound";
    err.name = "NoOASFileFound";
    throw err;
  }

  if (!all) {
    var selected = await cliselect({
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
  var gitRemote = fs.readFileSync(join(repoPath, ".git", "config"), "utf8");
  gitRemote = gitRemote.split("\n");
  var remoteUrl = "";
  for (var j = 0; j < gitRemote.length; j++) {
    if (gitRemote[j].includes("url")) {
      remoteUrl = gitRemote[j].split("=")[1].trim();
    }
  }

  var history_metadata = {};

  var previousVersions = await getPreviousVersionsOfFile(repoPath, oaspath);
  var data = previousVersions.map((version) => {
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
  var invalidFiles = [];
  var apiTitles = [];
  var uniqueVersion = [];

  var nextVersion = async (i) => {
    var version = previousVersions[i];

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
     

      var title = {
        title: oas.info?.title,
        commit_date: version.date,
        hash: version.hash,
      };
      // if the last commit has the same title as this commit then do not add it to the list
      if (apiTitles.length == 0) apiTitles.push(title);
      else if (apiTitles[apiTitles.length - 1].title !== title.title)
        apiTitles.push(title);
      var api_version = {
        hash: version.hash,
        commit_date: version.date,
        version: oas.info?.version,
      };
      // if the last commit has the same version as this commit then do not add it to the list
      if (uniqueVersion.length == 0) uniqueVersion.push(api_version);
      else if (
        uniqueVersion[uniqueVersion.length - 1].version !== api_version.version
      )
        uniqueVersion.push(api_version);
    } catch (err) {
      console.log(err.message);
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
        (new Date() - new Date(previousVersions[0].date)) /
          (1000 * 60 * 60 * 24)
      );
      history_metadata["git_url"] = remoteUrl;

      return history_metadata;
    }
  };

  await nextVersion(0);

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

  var hashes = commits.filter((commit, index) => {
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
