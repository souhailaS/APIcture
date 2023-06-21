import fs from "fs";
import path from "path";
import { join } from "path";
import { exec } from "child_process";
import { fetchHistory, fetchOASFiles } from "./bin/fetch_history.js";
import { computeDiff } from "./bin/oasdiff.js";
import { generateChangesViz } from "./bin/create_sunburst.js";
import { renderTree } from "./bin/create_changes_tree.js";

import { computeSizeMetrics } from "./bin/metrics.js";
import { renderMetrics } from "./bin/create_metrics_charts.js";
import { computeOverallGrowthMetrics } from "./bin/overall_metrics.js";
import { renderReport } from "./bin/render_report.js";
import { renderAllCharts } from "./bin/render_all_viz.js";

const TESTS_DIR = join("test_repos");
const basePath = "https://souhailas.github.io/VISSOFT2023/";
const outputDir = "/Users/souhailaserbout/git/VISSOFT2023/OUTPUTS";

var repos = fs.readdirSync(TESTS_DIR);
// console.log(repos);
var nextRepo = async (i) => {
  var markdown = "";
  // get the git remote url from the .git
  var repo = repos[i];
  if (repo != ".DS_Store") {
    var repoPath = join(TESTS_DIR, repo);
    var oasFiles = [];
    oasFiles = await fetchOASFiles(repoPath, true);
    var nextFile = async (i) => {
      var history_metadata = await fetchHistory(repoPath, oasFiles[i].oaspath);

      if (history_metadata.total_commits > 10) {
        await computeDiff(repoPath, oasFiles[i].oaspath);

        var versionsEchart = await generateChangesViz(
          repoPath,
          "echarts",
          oasFiles[i].oaspath,
          outputDir,
          history_metadata
        );

        var changesEcharts = await renderTree(
          repoPath,
          options.frequency,
          "echarts",
          false,
          oasFiles[i].oaspath,
          outputDir,
          history_metadata
        );

        var to_render = {
          changesEcharts,
          versionsEchart,
          output:join( outputDir, `viz-${oasFiles[i].oaspath.split(".")[0]}-api.html`),
          filename: oasFiles[i].oaspath.split(".")[0],
        };

        console.log(to_render);

        renderAllCharts(to_render);

        // render hitory metadata in markdown and add link to generated viz
        markdown += `# ${history_metadata.api_titles
          .map((t) => t.title + " [" + t.commit_date + "]")
          .join(" -> ")}\n`;
        markdown += `**Source** ${history_metadata.git_url}\n`;

        markdown += `**OAS File** ${oasFiles[i].oaspath}\n`;
        markdown += `**Total Commits** ${history_metadata.total_commits}\n`;
        markdown += `**Total First Commit** ${history_metadata.first_commit}\n`;
        markdown += `**Total Last Commit** ${history_metadata.last_commit}\n`;
        markdown += `**Total API Age (days)** ${history_metadata.age}\n`;
        markdown += `**Total Unique Versions** ${history_metadata.unique_versions.length}\n`;

        // add link to generated viz
        markdown += `**[View Changes](${basePath}/OUTPUTS/viz-${
          oasFiles[i].oaspath.split(".")[0]
        }-api.html)`;

        // embbed small viz in markdown
        markdown += `<iframe src="${basePath}/OUTPUTS/viz-${
          oasFiles[i].oaspath.split(".")[0]
        }-api.html" width="100%" height="500px"></iframe>`;
      } else {
        console.log(
          `|- Skipping ${oasFiles[i].oaspath} as it has less than 10 commits`
        );
      }
      i++;
      if (i < oasFiles.length) {
        nextFile(i);
      } else {
        // write markdown to file
        fs.writeFileSync(join(outputDir, "report.md"), markdown);
        return true;
      }
    };
    await nextFile(0);
  } else {
    i++;
    if (i < repos.length) {
      nextRepo(i);
    }
  }
};

await nextRepo(0);
