/**
 * connect to mongodb dataset-04-23
.api_specs collection and get the repo name and owner of apis with more than 365 days and more than 30 commits 
 */

import { MongoClient } from "mongodb";
import { join } from "path";
import { promises as fs } from "fs";
import { exec } from "child_process";

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

fs.mkdir(join("test_repos_2"), { recursive: true });
const main = async () => {
  try {
    await client.connect();
    const db = client.db("dataset-04-23");
    const collection = db.collection("api_specs");
    const apis = await collection
      .find({
        $and: [{ commits: { $gte: 30 } }, { age: { $gte: 365 } }],
      })
      .toArray();
    console.log(apis.length);
    const repos = apis.map((api) => {
      return {
        repo: api.repo_name,
        owner: api.owner,
        commits: api.commits,
      };
    });

    // compose git url

    var git_uris = [];
    repos.forEach((repo) => {
      git_uris.push({
        uri: `https://github.com/${repo.owner}/${repo.repo}.git`,
        repo: repo.repo,
        owner: repo.owner,
        commits: repo.commits,
      });
    });

    console.log(repos);

    fs.writeFile(join("repos_from_db.json"), JSON.stringify(repos), "utf8");

    //clone all repos  in test_repos_2
    const cloneRepos = async () => {
      for (let i = 0; i < git_uris.length; i++) {
        const repoURl = git_uris[i];
        const repoName = repos[i].repo;
        const owner = repos[i].owner;
        const repoPath = join("test_repos_2", owner, repoName);
        // create repo folder
        await fs.mkdir(repoPath, { recursive: true });
        // clone repo
        const cmd = `git clone ${repoURl.uri} ${join(repoPath)}`;
        console.log(cmd);
        await exec(cmd, (err, stdout, stderr) => {
          if (err) {
            console.log(err.stack);
          }
            console.log(stdout);
        });
      }
    };
    await cloneRepos();
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
};

main();
