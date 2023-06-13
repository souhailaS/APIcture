/**
 * This script is used to fetch the history of a given git repository.
 * For a given repository, if an openapi file is found in the root file of the repo then its history is fetched.
 */

import { execSync } from "child_process";
import fs from "fs";
import { join } from "path";
import SwaggerParser from "@apidevtools/swagger-parser";
import simpleGit from "simple-git";

const REPO_PATH = process.argv[2];

const files = fs.readdirSync(REPO_PATH);
const openapiFiles = files.filter((file) => {
  const fileExtension = file.split(".").pop();
  return fileExtension === "json" || fileExtension === "yaml";
});

const yamlJson = openapiFiles.map(async (file) => {
  try {
    var oas = await SwaggerParser.validate(join(REPO_PATH, file));
    return { oaspath: join(file), oas: oas };
  } catch (err) {
    return false;
  }
});

var validOAS = await Promise.all(yamlJson);
validOAS = validOAS.filter((oas) => oas !== false);

// get all the versions of the oas file
async function getPreviousVersionsOfFile(repositoryPath, filePath) {
  const git = simpleGit(repositoryPath);

  const logOptions = [
    "--follow",
    "--name-only",
    "--pretty=format:%H",
    "--",
    filePath,
  ];
  const log = await git.log(logOptions);
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
  return previousVersions;
}

var previousVersions = await getPreviousVersionsOfFile(
  REPO_PATH,
  validOAS[0].oaspath
);

var data = previousVersions.map((version) => {
  return {
    // version.date, store the date in date format
    commit_date:   new Date(version.date),
    hash: version.hash,
    fileExtension: version.fileExtension,
  };
});

previousVersions.sort((a, b) => {
  return new Date(a.date) - new Date(b.date);
});

fs.mkdirSync(join(REPO_PATH, ".previous_versions"), { recursive: true });
fs.writeFileSync(
  join(REPO_PATH, ".previous_versions", ".api_commits.json"),
  JSON.stringify(data)
);

previousVersions.forEach((version) => {
  fs.writeFileSync(
    join(
      REPO_PATH,
      ".previous_versions",
      `${version.hash}.${version.fileExtension}`
    ),
    version.content
  );
});
