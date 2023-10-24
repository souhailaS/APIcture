import fs from "fs";
import path from "path";
import { join } from "path";
import { exec } from "child_process";
import { fetch_history, fetchOASFiles } from "../bin/fetch_history.js";
import { compute_diff } from "../bin/oasdiff.js";
import { generateChangesViz } from "../bin/create_sunburst.js";
import { renderTree } from "../bin/create_changes_tree.js";

import { computeSizeMetrics } from "../bin/metrics.js";
import { renderMetrics } from "../bin/create_metrics_charts.js";
import { computeOverallGrowthMetrics } from "../bin/overall_metrics.js";
import { renderReport } from "../bin/render_report.js";
import { renderAllCharts } from "../bin/render_all_viz.js";
import chalk from "chalk";
import readline from "readline";

export default async function generateGallery(path) {
  const urls = "git_urls.json";
  var TESTS_DIR_default = path;
  var basePath_default = "https://souhailas.github.io/VISSOFT2023";
  var outputDir_default = ".";

  var TESTS_DIR = "";
  var basePath = "";
  var outputDir = "";

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

  async function askUserForValues() {
    // TESTS_DIR = path //await getUserInput("Enter the TESTS_DIR value: ");
    // basePath = await getUserInput("Enter the basePath value: ");
    outputDir = await getUserInput("Enter the outputDir value: ");

    if (!TESTS_DIR) {
      TESTS_DIR = TESTS_DIR_default;
    }
    if (!basePath) {
      basePath = basePath_default;
    }
    if (!outputDir) {
      outputDir = outputDir_default;
    }
    await run();
    rl.close();
  }

  await askUserForValues();

  async function run() {
    console.log(
      chalk.bold.green(
        "|-- Running script to generate the gallery of visualizations"
      )
    );
    var repos = fs.readdirSync(TESTS_DIR);
    // repos = ["openai-openapi"]
    // repos = fs.readFileSync(join("repos_from_db.json"), "utf8");
    // repos= JSON.parse(repos);
    // sort by commits
    // repos.sort((a, b) => a.commits - b.commits);
    // repos = repos.filter((repo) => !repo.owner.includes("vtex") && !repo.repo.includes("vtex") );
    // repos = repos.map((repo) => join(repo.owner, repo.repo));

    var counter = 0;

    // if .processed.json does not exist create it
    if (!fs.existsSync(join(".processed.json"))) {
      fs.writeFileSync(join(".processed.json"), JSON.stringify([]));
    }

    var processed = fs.readFileSync(join(".processed.json"), "utf8");
    processed = JSON.parse(processed);

    // if there are processed projects ask if the user wants to process from the scratch of continue
    if (processed.length > 0) {
      var answer = await getUserInput(
        `The script has already processed ${processed.length} projects. Do you want to restart from the scratch? (y/n): `
      );

      if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
        processed = [];
        fs.writeFileSync(join(".processed.json"), JSON.stringify(processed));

        // delete index.html
        if (fs.existsSync(join(outputDir, "VISSOFT", "index.html"))) {
          fs.unlinkSync(join(outputDir, "VISSOFT", "index.html"));
        }
      }
      // if the user choose no, show how many projects are left to process
      else {
        var remaining = repos.length - processed.length;
        if (remaining > 0)
          console.log(
            chalk.bold(
              `|-- The script will continue processing the remaining ${remaining} projects.`
            )
          );
        else {
          console.log(
            chalk.bold(`|-- The script has already processed all the projects.`)
          );
          return true;
        }
      }
    }

    // sort repos randomly
    // repos.sort();
    // console.log(repos);
    var markdown = ""; //fs.readFileSync(join(outputDir, "report.md"), "utf8");
    var nextRepo = async (j) => {
      // get the git remote url from the .git
      var repo = repos[j];

      var repoPath = join(TESTS_DIR, repo);
      // console.log(repoPath);

      if (!fs.existsSync(join(".processed.json"))) {
        fs.writeFileSync(join(".processed.json"), JSON.stringify([]));
      }

      var processed = fs.readFileSync(join(".processed.json"), "utf8");
      processed = JSON.parse(processed);

      if (repo != ".DS_Store" && !processed.includes(repoPath)) {
        console.log(chalk.cyan.bold(`----\n`));
        console.log(`Processing ${repoPath}`);
        fs.writeFileSync(join(".processed.json"), JSON.stringify(processed));
        var oasFiles = [];
        oasFiles = await fetchOASFiles(repoPath, true);
        var nextFile = async (i) => {
          var history_metadata = await fetch_history(
            repoPath,
            oasFiles[i].oaspath
          );
          // if none pf the titles  inc;ude vtex

          if (
            !oasFiles[i].oaspath.toLowerCase().includes("vtex") &&
            history_metadata.api_titles.filter((title) =>
              title.title.toLowerCase().includes("nightscout api")
            ).length == 0
          ) {
            var git_urls = [];
            if (fs.existsSync(join(urls))) {
              git_urls = fs.readFileSync(join(urls), "utf8");
              git_urls = JSON.parse(git_urls);
            }
            if (!git_urls.includes(history_metadata.git_url))
              git_urls.push(history_metadata.git_url);
            fs.writeFileSync(join(urls), JSON.stringify(git_urls));

            if (
              history_metadata.total_commits > 30 &&
              history_metadata.age > 365
            ) {
              if (
                !fs.existsSync(
                  join(
                    repoPath,
                    ".previous_versions",
                    oasFiles[i].oaspath,
                    ".diff.json"
                  )
                )
              ) {
                await computeDiff(repoPath, oasFiles[i].oaspath);
              }

              // console.log(history_metadata);

              // path,
              // format,
              // oaspath,
              // output,
              // all,
              // history,
              // filename
              var versionsEchart = await generateChangesViz(
                repoPath,
                "echarts",
                oasFiles[i].oaspath,
                join(
                  outputDir,
                  "VISSOFT",
                  `viz-${oasFiles[i].oaspath.split(".")[0]}-${
                    history_metadata.api_titles[0].title
                  }-api.html`
                ),
                true,
                history_metadata
              );

              // path,
              // f,
              // format,
              // aggr,
              // oaspath,
              // output,
              // all,
              // history,
              // filename

              var changesEcharts = await renderTree(
                repoPath,
                // options.frequency,
                null,
                "echarts",
                false,
                oasFiles[i].oaspath,
                join(
                  outputDir,
                  "VISSOFT",
                  `viz-${oasFiles[i].oaspath.split(".")[0]}-${
                    history_metadata.api_titles[0].title
                  }-api.html`
                ),
                null,
                history_metadata
              );

              // var metrics = await computeSizeMetrics(repoPath, oasFiles[i].oaspath);
              // const overrAll = await computeOverallGrowthMetrics(repoPath,oasFiles[i].oaspath, metrics);
              // console.log(overrAll);
              // fs.writeFileSync(
              //   'test.json',
              //   JSON.stringify(overrAll)
              // );
              // renderReport(overrAll);

              var to_render = {
                changesEcharts,
                versionsEchart,
                output: join(
                  outputDir,
                  "VISSOFT",
                  `viz-${oasFiles[i].oaspath.split(".")[0]}-${
                    history_metadata.api_titles[0].title
                  }-api.html`
                ),
                filename: oasFiles[i].oaspath.split(".")[0],
                history_metadata,
              };

              renderAllCharts(to_render, history_metadata);

              counter++;

              // create index.html inside VISSOFT
              if (!fs.existsSync(join(outputDir, "VISSOFT"))) {
                fs.mkdirSync(join(outputDir, "VISSOFT"), { recursive: true });
              }
              if (!fs.existsSync(join(outputDir, "VISSOFT", "index.html"))) {
                fs.writeFileSync(
                  join(outputDir, "VISSOFT", "index.html"),
                  `<!DOCTYPE html>
<html lang="en">
<head>
   <!-- Latest compiled and minified CSS -->
   <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
   <!-- jQuery library -->
   <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js"></script>
   <!-- Latest compiled JavaScript -->
   <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
   <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
   <style>
        body {
      /* set font */
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      height: 100vh; 
    }
    </style>
    <meta charset="UTF-8">
    <title>Gallery</title>
    </head>
    <body class="container">

      <h1>Interactively exploring API structural changes and versioning consistency</h1>
      In this page we present a comprehensive collection of visualization examples, including those featured in the paper, as well as additional examples that we find intriguing but were not included in the paper. For each visualization example, we provide relevant metadata related to the evolution of the subject, such as number of versions and commits. Additionally, we specify the source OpenAPI Specification (OAS) used to generate the visualizations ensuring reproducibility. Each example is accompanied by its corresponding visualization, allowing readers to explore and analyze the visual representations of API evolution. 
      <hr />
      <h2>Gallery</h2>
      <hr />

                 <!-- <add api> -->
    </body> 

</html>`
                );
              }

              var html = `
        <h3>${history_metadata.api_titles[0].title}</h3>
        <div style="display: flex;flex-direction:row;">
        <div style="width:40vw">
        </p> 
        <p><strong>Source:</strong> <a href="${history_metadata.git_url}">${history_metadata.git_url}</a></p>
        
        <p><strong>OAS File:</strong> ${oasFiles[i].oaspath}</p>
        <p><strong>API Titles:</strong>`;
              if (history_metadata.api_titles.length > 1) {
                html += `<table class="table">
          <tr>
            <th>Title</th>
            <th>Commit Date</th>
            <th>Version</th>
          </tr>
          ${history_metadata.api_titles
            .map(
              (title) => `
            <tr>
              <td><code>${title.title}</code></td>
              <td>${title.commit_date}</td>
              <td>${title.version}</td>
            </tr>
          `
            )
            .join("")}
        </table>`;
              }

              html += `
        
        <table class="table">
          <tr>
            <th>Metadata</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Total Commits</td>
            <td>${history_metadata.total_commits}</td>
          </tr>
          <tr>
            <td>First Commit</td>
            <td>${history_metadata.first_commit}</td>
          </tr>
          <tr>
            <td>Last Commit</td>
            <td>${history_metadata.last_commit}</td>
          </tr>
          <tr>
            <td>API Age (days)</td>
            <td>${history_metadata.age}</td>
          </tr>
          <tr>
            <td>Unique Versions</td>
            <td>${history_metadata.unique_versions.length}</td>
          </tr>
        </table>
        
        <p><a href="${basePath}/VISSOFT/viz-${encodeURIComponent(
                oasFiles[i].oaspath.split(".")[0]
              )}-${encodeURIComponent(
                history_metadata.api_titles[0].title
              )}-api.html">View Visualizations</a></p>
        </div>`;
              // html+= `
              // <div><iframe src="${basePath}/VISSOFT/viz-${encodeURIComponent(oasFiles[i].oaspath.split(".")[0])}-${encodeURIComponent(history_metadata.api_titles[0].title)}-api.html#visualizations" width="100%" height="500px"></iframe></div>

              // `

              // us jquery instead of the iframe to render the viz
              html += `
        <div style="width:60vw">
        <div id="visualizations" style="display: flex;flex-direction:row;">
        <img src="${basePath}/VISSOFT/viz-${encodeURIComponent(
                oasFiles[i].oaspath.split(".")[0]
              )}-${encodeURIComponent(
                history_metadata.api_titles[0].title
              )}-changes.svg" width="350px" height="350px">
        <img src="${basePath}/VISSOFT/viz-${encodeURIComponent(
                oasFiles[i].oaspath.split(".")[0]
              )}-${encodeURIComponent(
                history_metadata.api_titles[0].title
              )}-versions.svg" width="350px" height="350px">
        </div>
        </div>
        </div>
        <hr />
        <!-- <add api> -->
        `;
              var page = fs.readFileSync(
                join(outputDir, "VISSOFT", "index.html"),
                "utf8"
              );
              page = page.replace("<!-- <add api> -->", html);
              fs.writeFileSync(join(outputDir, "VISSOFT", "index.html"), page);
            } else {
              console.log(
                `|- Skipping ${oasFiles[i].oaspath} as it has less than 10 commits`
              );
            }
          }
          i++;
          if (i < oasFiles.length) {
            // fs.writeFileSync(join(outputDir, "README.md"), markdown);
            await nextFile(i);
          } else {
            // write markdown to file
            // fs.writeFileSync(join(outputDir, "README.md"), markdown);
            console.log("DONE");
            // next repo

            j++;
            processed.push(repoPath);
            fs.writeFileSync(
              join(".processed.json"),
              JSON.stringify(processed)
            );
            if (j < repos.length) {
              await nextRepo(j);
            }
            return true;
          }
        };
        if (oasFiles.length > 0) await nextFile(0);
        else {
          j++;
          processed.push(repoPath);
          fs.writeFileSync(
            join(".processed.json"),
            JSON.stringify(processed)
          );
          if (j < repos.length) {
           
            await nextRepo(j);
          }
        }
       
      } else {
        j++;
        processed.push(repoPath);
        fs.writeFileSync(
          join(".processed.json"),
          JSON.stringify(processed)
        );
        if (j < repos.length) {
          nextRepo(j);
        }
      }
    };

    await nextRepo(0);
  }
}
