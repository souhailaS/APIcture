import fs from "fs";
import { exec } from "child_process";
import { join } from "path";



if (!fs.existsSync(join("bin/test", "repos"))) {
  console.log("creating repos folder");
  fs.mkdirSync(join("bin/test", "repos"), { recursive: true });

}

// if (
//   !fs.existsSync(
//     join("bin/test",  "repos_url_express_cloned.json")
//   )
// ) {
//   console.log("creating repos_url_express_cloned.json");

fs.writeFileSync(
  join("bin/test", "repos_url_express_cloned.json"),
  JSON.stringify([]),
  "utf8"
);
// }

console.log(join("bin/test", "repos_url_express.json"));
var repos_url_express = JSON.parse(
  fs.readFileSync(join("bin/test/repos_url_express.json"), "utf8")
);

var repos_url_express_cloned = JSON.parse(
  fs.readFileSync(join("bin/test", "repos_url_express_cloned.json"), "utf8")
);

var next = async (i, r) => {
  console.log("----------------------");
  console.log("Cloning " + i + " of " + repos_url_express.length);

  var repo_url = repos_url_express[i].url;
  repo_url = repo_url
    .replace("https://raw.githubusercontent.com/", "https://www.github.com/")
    .replace("/master/package.json", "");

  var owner = repo_url.split("/")[3];

  var c = `cd bin/test/repos && mkdir ${owner} && cd ${owner} && git clone ${repo_url}`;
  console.log(c);

  if (!repos_url_express_cloned.includes(repo_url) || r) {
    exec(c, (err, stdout, stderr) => {
      if (err) {
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

          if (!fs.existsSync(join("bin/test", "repos", owner))) {
            setTimeout(() => {
              console.log("waiting 10 seconds for the repo to be cloned");
            }, 10000);
            if (!fs.existsSync(join("bin/test", "repos", owner))) {
              setTimeout(() => {
                console.log("waiting 40 seconds for the repo to be cloned");
              }, 4000);
            }
          }

          if (fs.existsSync(join("bin/test", "repos", owner))) {
            exec(
              `cd ${"bin/test"}/output/repos/${owner}/${
                repo_url.split("/")[repo_url.split("/").length - 1]
              } && git rev-list --count HEAD`,
              (err, stdout, stderr) => {
                if (err) {
                  console.log("Error getting number of commits");
                  console.log(
                    `cd ${"bin/test"}/output/repos/${owner}/${
                      repo_url.split("/")[repo_url.split("/").length - 1]
                    } && git rev-list --count HEAD`
                  );
                  //console.log(err);
                  if (i < repos_url_express.length - 1) {
                    next(i + 1, r);
                  }
                }

                console.log(`Number of commits on the repo: ${stdout}`);

                var projets_data = {
                  project: repo_url.replace("https://www.github.com/", ""),
                  project_url: repo_url,
                  clone_date: new Date().toISOString(),
                  //spec_commits : repos_url_express[i].commits,
                  spec_url: repos_url_express[i].spec_path,
                  repo_commits: stdout.replace("\n", ""),
                };
                repos_url_express_cloned.push(projets_data);

                fs.writeFileSync(
                  join(
                    "bin/test",
                   
                    "/repos_url_express_cloned.json"
                  ),
                  JSON.stringify(repos_url_express_cloned),
                  "utf8"
                );

               
                
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
