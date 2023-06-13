#!/usr/bin/env node
import util from "util";
import child_process from "child_process";
const exec = util.promisify(child_process.exec);
import fs from "fs";
import path, { join } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function computeDiff(path) {
  var api_commits = fs.readFileSync(join(path, ".api_commits.json"));
  fs.writeFileSync(join(path, ".diffs.json"), JSON.stringify([]));
  fs.writeFileSync(join(path, ".breaking.json"), JSON.stringify([]));
  api_commits = JSON.parse(api_commits);
  var api_commits = api_commits.sort((a, b) => {
    a.commit_date - b.commit_date;
  });

  console.log(api_commits);
  var next_pair = async (i) => {
    if (api_commits[i + 1]) {
      console.log(
        `|- Commit: ${api_commits[i].hash} - ${api_commits[i + 1].hash}`
      );

      try {
        var cmd = `oasdiff -base  ${join(
          path,
          api_commits[i].hash +"."+ api_commits[i].fileExtension
        )} -revision ${join(
          path,
          api_commits[i + 1].hash +"."+ api_commits[i + 1].fileExtension
        )} -exclude-examples`;

        var { stdout, stderr } = await exec(cmd);
        var diffs = fs.readFileSync(join(path, ".diffs.json"));
        diffs = JSON.parse(diffs);
        diffs.push({
          hash: api_commits[i].hash,
          diff: stdout,
          commit_date: api_commits[i].commit_date,
        });

        fs.writeFileSync(join(path, ".diffs.json"), JSON.stringify(diffs));

        // diff 2 -check-breaking
        var cmd_2 = `oasdiff -check-breaking -base  ${join(
          path,
          api_commits[i].hash + "."+api_commits[i].fileExtension
        )} -revision ${join(
          path,
          api_commits[i + 1].hash +"."+ api_commits[i + 1].fileExtension
        )} -exclude-examples  -format json`;

        var { stdout, stderr } = await exec(cmd_2);

        var diff_2 = stdout;
        var breaking = fs.readFileSync(join(path, ".breaking.json"));
        breaking = JSON.parse(breaking);
        breaking.push({
          hash: api_commits[i].hash,
          breaking: diff_2,
          commit_date: api_commits[i].commit_date,
        });
      } catch (error) {
        console.log(error);
      }

      if (i < api_commits.length) {
        return await next_pair(i + 1);
      } else {
        return;
      }
    }
  };

  return await next_pair(0);
}

computeDiff("test_repos/schema/previous_versions");
