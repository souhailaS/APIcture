

import join from "path";
import fs from "fs";
import { exec } from "child_process";
 

const __dirname = join(import.meta.url, "..");



if (!fs.existsSync(path.join(__dirname,"bin","test", "repos"))) {
  fs.mkdirSync(path.join(__dirname,"bin","test", "repos"));
}
process.chdir(path.join(__dirname,"bin","test", "repos"));

if (
  !fs.existsSync(path.join(__dirname,"bin","test", "repos_url_express_cloned.json"))
) {
  fs.writeFileSync(
    path.join(__dirname,"bin","test", "repos_url_express_cloned.json"),
    JSON.stringify([]),
    "utf8"
  );
}

var repos_url_express = JSON.parse(
  fs.readFileSync(path.join(__dirname,"bin","test", "repos_url_express.json"), "utf8")
);

var repos_url_express_cloned = JSON.parse(
  fs.readFileSync(
    path.join(__dirname,"bin","test","repos_url_express_cloned.json"),
    "utf8"
  )
);

var next = async (i, r) => {
  console.log("----------------------");
  console.log("Cloning " + i + " of " + repos_url_express.length);

  repo_url = repos_url_express[i].url;
  repo_url = repo_url
    .replace("https://raw.githubusercontent.com/", "https://www.github.com/")
    .replace("/master/package.json", "");

  var owner = repo_url.split("/")[3];

  var c = `mkdir ${owner} && cd ${owner} && git clone ${repo_url}`;
  console.log(c);

  if (!repos_url_express_cloned.includes(repo_url) || r) {
    exec(c, (err, stdout, stderr) => {
      if (err) {
        // TODO: add the repo with the url and all the metadata
        // if (err.code == 128) {
        //   console.log("Repository already cloned");
        //   if (!repos_url_express_cloned.includes(repo_url)) {
        //     repos_url_express_cloned.push(repo_url);
        //     console.log("Added to cloned list");
        //     fs.writeFileSync(
        //       path.join(__dirname, "output/repos_url_express_cloned.json"),
        //       JSON.stringify(repos_url_express_cloned),
        //       "utf8"
        //     );
        //   }
        // }
        // console.log(err);
        if (i < repos_url_express.length - 1) {
          next(i + 1, r);
        }
      } else {
        console.log(`cloned ${repo_url}`);
        if (!repos_url_express_cloned.includes(repo_url)) {
          // get number of commits on the repo

          // wait 5 seconds to get the number of commits
          setTimeout(() => {
            console.log("waiting 5 (s) for the repo to be cloned");
          }, 5000);

          if (!fs.existsSync(path.join(__dirname, "repos", owner))) {
            setTimeout(() => {
              console.log("waiting 10 seconds for the repo to be cloned");
            }, 10000);
            if (!fs.existsSync(path.join(__dirname, "repos", owner))) {
            setTimeout(() => {
              console.log("waiting 40 seconds for the repo to be cloned");
            }
            , 4000);}
          }

          if (fs.existsSync(path.join(__dirname,"bin","test", "repos", owner))) {
            exec(
              `cd ${__dirname}/output/repos/${owner}/${
                repo_url.split("/")[repo_url.split("/").length - 1]
              } && git rev-list --count HEAD`,
              (err, stdout, stderr) => {
                if (err) {
                  console.log("Error getting number of commits");
                  console.log(
                    `cd ${__dirname}/output/repos/${owner}/${
                      repo_url.split("/")[repo_url.split("/").length - 1]
                    } && git rev-list --count HEAD`
                  );
                  //console.log(err);
                }

                console.log(`Number of commits on the repo: ${stdout}`);

                var projets_data = {
                  project: repo_url.replace("https://www.github.com/", ""),
                  project_url: repo_url,
                  clone_date: new Date().toISOString(),
                  //spec_commits : repos_url_express[i].commits,
                  spec_url: repos_url_express[i].spec_path,
                  repo_commits: stdout.replace("\n", "")
                };
                repos_url_express_cloned.push(projets_data);

                fs.writeFileSync(
                  path.join(__dirname, "output/repos_url_express_cloned.json"),
                  JSON.stringify(repos_url_express_cloned),
                  "utf8"
                );

                // check if project can run with npm without errors after npm install
                process.chdir(path.join(__dirname, "output/repos", owner));

                exec("npm install", (err, stdout, stderr) => {
                  if (err) {
                    console.log("Error installing dependencies");
                  }
                  process.chdir(path.join(__dirname, "output/repos"));
                });

                if (i < repos_url_express.length - 1) {
                  next(i + 1, r);
                }
              }
            );
          } else {
            console.log("Back to it later ...");
            if (i < repos_url_express.length - 1) {
              next(i + 1, r);
            }
          }
        } else {
          console.log("Repository already cloned");
        }
      }
    });
  } else {
    console.log("Repository already cloned");
    if (i < repos_url_express.length - 1) {
      next(i + 1, r);
    }
  }
};

next(0, true);
