/**
 * This script clones the repositories from the GitHub
 */

import chalk from "chalk";
import fs from "fs";
import { promisify } from "util";
import { exec } from "child_process";
import readline from "readline";

import git_urls from "./git_urls.json" assert { type: "json" };


export default async function clone() {
  // console log that the script is running and will start by cloning the repos
  console.log(
    chalk.bold.green(
      "|-- Running script to clone the example repositories from the GitHub"
    )
  );

  const execPromise = promisify(exec);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  async function getUserInput(prompt) {
    return new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        resolve(answer);
      });
    });
  }

  var repoUrlsPath = await getUserInput(
    "Enter the path to the JSON file containing the array of Git URLs: "
  );
  //"./local/git_urls.json"; // Path to the JSON file containing the array of Git URLs
  var repoUrls = [];

  try {
    const rawData = await fs.promises.readFile(repoUrlsPath);
    repoUrls = JSON.parse(rawData);
  } catch (error) {
    if (repoUrlsPath == "") {
      console.error(
        "No path to the JSON file containing the array of Git URLs was provided. Defaulting to the git_urls.json file."
      );
    } else {
      console.error(
        "Error reading the JSON file. Defaulting to the git_urls.json file."
      );
    }
    repoUrls = git_urls;
    // rl.close();
  }

  var cloneFolder = await getUserInput("Enter the destination folder path: ");

  if (cloneFolder == "") {
    cloneFolder = "./test_repos";
  }

  console.log(
    chalk.bold(
      `|-- The script will clone the repositories  into ${cloneFolder}`
    )
  );

  console.log(
    chalk.bold(
      `|-- The Progress of the cloning will be displayed in the console.\n`
    )
  );

  async function askToDeleteAndClone() {
    var answer = await getUserInput(
      `The clone folder "${cloneFolder}" already exists. Do you want to delete it and reclone the projects? (y/n): `
    );

    if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
      try {
        await fs.promises.rm(cloneFolder, { recursive: true });
        console.log(`\nDeleted existing ${cloneFolder} folder.`);
        await cloneRepositories();
      } catch (error) {
        console.error("Error deleting the folder:", error);
        rl.close();
      }
    } else {
      // check if the folder has repos
      if (fs.readdirSync(cloneFolder).length > 0) {
        console.log(
          chalk.bold(
            `|-- The folder ${cloneFolder} already contains clone repositories ${
              fs.readdirSync(cloneFolder).length
            }. The script will not clone the repositories again.`
          )
        );
        rl.close();
      } else {
        console.log(
          chalk.bold(
            `|-- The folder ${cloneFolder} is empty. The script will clone the repositories`
          )
        );
        await cloneRepositories(repoUrls);
      }
    }
  }

  // if clone folder doesn't exist create it
  if (!fs.existsSync(cloneFolder)) {
    // console.log(`\nCreating ${cloneFolder} folder.`);
    fs.mkdirSync(cloneFolder);
    await cloneRepositories(repoUrls);
  } else {
    await askToDeleteAndClone();
  }

  async function cloneRepositories(repoUrls) {
    try {
      // Read the JSON file containing the repo URLs

      const totalRepos = repoUrls.length;
      let clonedCount = 0;

      // Clone repositories one by one
      for (const repoUrl of repoUrls) {
        const repoName = repoUrl.split("/").pop().replace(".git", ""); // Extract repo name from URL

        const clonePath = `${cloneFolder}/${repoName}`;
        // console.log(`Cloning ${repoUrl} into ${clonePath}`);

        try {
          const { stdout, stderr } = await execPromise(
            `git clone ${repoUrl} ${clonePath}`
          );

          if (stdout) {
            // console.log(stdout);
          }

          if (stderr) {
            // console.error(stderr);
          }
        } catch (error) {
          //console.error(error);
        }

        // console.log(`Repository ${repoName} cloned successfully.\n`);
        clonedCount++;
        const percentage = ((clonedCount / totalRepos) * 100).toFixed(2);
        console.log(
          `Repository ${repoUrl} cloned successfully into ${clonePath}` +
            chalk.bold.green(` Progress: ${percentage}%\n`)
        );
      }

      console.log("All repositories cloned successfully.");
    } catch (error) {
      console.error("An error occurred:", error);
    }

    rl.close();
  }

  return cloneFolder;
}
