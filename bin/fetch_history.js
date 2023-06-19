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

export const fetchHistory = async (repoPath) => {
  const files = fs.readdirSync(repoPath);
  const openapiFiles = files.filter((file) => {
    const fileExtension = file.split(".").pop();
    return fileExtension === "json" || fileExtension === "yaml";
  });

  const yamlJson = openapiFiles.map(async (file) => {
    try {
      var oas = await SwaggerParser.validate(join(repoPath, file));
      return { oaspath: join(file), oas: oas };
    } catch (err) {
      return false;
    }
  });

  console.log("|- Fetching history of the repository");

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

  var selected = await cliselect({
    values: validOAS.map((oas) => oas.oaspath),
    valueRenderer: (value, selected) => {
      if (selected) {
        return chalk.underline(value);
      }
      return value;
    },
  });

  validOAS = validOAS.filter( (f) => f.oaspath == selected.value);
  var previousVersions = await getPreviousVersionsOfFile(
    repoPath,
    validOAS[0].oaspath
  );

  var data = previousVersions.map((version) => {
    return {
      // version.date, store the date in date format
      commit_date: new Date(version.date),
      hash: version.hash,
      fileExtension: version.fileExtension,
    };
  });

  previousVersions.sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  fs.mkdirSync(join(repoPath, ".previous_versions"), { recursive: true });
  fs.writeFileSync(
    join(repoPath, ".previous_versions", ".api_commits.json"),
    JSON.stringify(data)
  );

  previousVersions.forEach((version) => {
    fs.writeFileSync(
      join(
        repoPath,
        ".previous_versions",
        `${version.hash}.${version.fileExtension}`
      ),
      version.content
    );
  });
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
  // console.log(commits);
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
  return previousVersions;
}
