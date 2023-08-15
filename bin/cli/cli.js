#!/usr/bin/env node
/**
 * This script uses commander to create the CLI tool for generating Evolution visualizations.
 * The CLI tool can be used to generate visualizations for a given repository.
 *  - The repository can be specified using the --repo flag.
 * if no repository is specified, the current working directory is used.
 * - The output directory can be specified using the --output flag.
 * if no output directory is specified, the current working directory is used. A folder named "apict-outputs" is created in the output directory.
 * - The output format can be specified using the --format flag.
 * if no output format is specified, the default format is html.
 * - The output file name can be specified using the --filename flag.
 * if no output file name is specified, the default file name is "evolution-visualization".
 * - the subcommand "changes" can be used to generate the changes visualization.
 *
 *
 */

import { Command } from "commander";
const program = new Command();
import { execSync } from "child_process";
import { fetchHistory, fetchOASFiles } from "../fetch_history.js";
import { computeDiff } from "../oasdiff.js";
import { generateChangesViz } from "../create_sunburst.js";
import { renderTree } from "../create_changes_tree.js";

import { computeSizeMetrics } from "../metrics.js";
import { renderMetrics } from "../create_metrics_charts.js";
import { computeOverallGrowthMetrics } from "../overall_metrics.js";
import { renderReport } from "../render_report.js";
import { renderAllCharts } from "../render_all_viz.js";
import chalk from "chalk";
import { join } from "path";
import { generateOAS } from "../oasgen/oasgen.js";
import vissoft from "../../vissoft/vissoft.js";
// import packageJson from "../../package.json";
// import packageJson from "../../package.json" assert { type: "json" };

/**
 * If no parameter is passed generate both the version clock and changes visualizations
 */
program
  .description("Generate Evolution visualizations")
  .option(
    "-r, --repo <repo>",
    "Path to the repository. Defaults to current working directory."
  )
  
  .option("-o, --output <path>", "Path to the output directory")
  // .option("-freq, --frequency <frequency>", "Minimum frequency of changes")
  .option("-fs, --fast", "Fast mode")
  .option("-f, --format <format>", "Output format")
  .option("-a, --all", "Generate OAS for all OAS files found in the repo")
  // .option("-d, --details", "Show details")
  // file name for the output file
  .option(
    "-fn, --filename <filename>",
    "Output file name [Without file extension]"
  )
  // add version option
  .option("-v, --version", "Output the current version")

  .action(async () => {
    message();
   
    // output the current version
    if (program.opts().version) {
  
      // console.log(packageJson.version);

      return;
    }

    const options = program.opts();
    const repoPath = options.repo || process.cwd();
    const outputDir = options.output;
    const format = options.format;
    const filename = options.filename;
    const fast = options.fast || false;

    try {
      var oasFiles = [];

      oasFiles = await fetchOASFiles(repoPath, options.all);

      var nextFile = async (i) => {
        var history_metadata = await fetchHistory(
          repoPath,
          oasFiles[i].oaspath
        );

        await computeDiff(repoPath, oasFiles[i].oaspath, fast);

        /**
         *
         * @param {*} path
         * @param {*} format
         * @param {*} oaspath
         * @param {*} output
         * @param {*} all
         * @param {*} history
         * @returns
         */
        var versionsEchart = await generateChangesViz(
          repoPath,
          format,
          oasFiles[i].oaspath,
          outputDir,
          options.all,
          history_metadata,
          filename
        );

        var changesEcharts = await renderTree(
          repoPath,
          options.frequency,
          format,
          false,
          oasFiles[i].oaspath,
          options.output,
          false,
          history_metadata,
          filename
        );

        var metrics = await computeSizeMetrics(repoPath, oasFiles[i].oaspath);
        var vizOptions = {};
        vizOptions.endpoints = options.endpoints ? true : false;
        vizOptions.methods = options.methods ? true : false;
        vizOptions.parameters = options.parameters ? true : false;
        vizOptions.datamodel = options.datamodel ? true : false;
        vizOptions.breakingChanges = options.breakingChanges ? true : false;
        vizOptions.breakingMethods = options.breakingMethods ? true : false;
        var usedOptions = false;
        var chartOptions = renderMetrics(
          metrics,
          repoPath,
          vizOptions,
          options.format,
          usedOptions,
          oasFiles[i].oaspath
        );

        if (format == "html" || !format) {
          var to_render = {
            changesEcharts,
            versionsEchart,
            path: repoPath,
            output: outputDir,
            filename: filename ? filename : oasFiles[i].oaspath.split(".")[0],
            oaspath: oasFiles[i].oaspath.split(".")[0],
            history_metadata,
            metrics: chartOptions,
            options: vizOptions,
            usedOptions,
          };
          renderAllCharts(to_render);
        }

        const overrAll = await computeOverallGrowthMetrics(
          repoPath,
          oasFiles[i].oaspath
        );
        renderReport(overrAll);

        i++;
        if (i < oasFiles.length) {
          await nextFile(i);
        } else {
          return true;
        }
      };
      if (Array.isArray(oasFiles)) await nextFile(0);
      else {
        // console.log(oasFiles);
        await computeDiff(repoPath, oasFiles.oas_file, fast);
      }
      return true;

      //
    } catch (err) {
      console.log(err);
    }
  });

/**
 * Generate the versions clock view.
 */
program
  .command("clock")
  .description("Generate API Clock sunburst visualization")
  .option(
    "-r, --repo <repo>",
    "Path to the repository. Defaults to current working directory."
  )
  .option("-o, --output <path>", "Path to the output directory")
  .option("-f, --format <format>", "Output format")
  .option("-fs, --fast", "Fast mode")
  .option("-a, --all", "Generate OAS for all OAS files found in the repo")

  .action(async () => {
    message();
    const options = program.opts();
    const repoPath = options.repo || process.cwd();
    const outputDir = options.output;
    const format = options.format;
    const filename = options.filename;
    const fast = options.fast;

    // console.log(options);

    try {
      var oasFiles = [];
      if (!options.fast) {
        oasFiles = await fetchOASFiles(repoPath, options.all);
        var nextFile = async (i) => {
          var history_metadata = await fetchHistory(
            repoPath,
            oasFiles[i].oaspath
          );
          await computeDiff(repoPath, oasFiles[i].oaspath, fast);
          /**
           *
           * @param {*} path
           * @param {*} format
           * @param {*} oaspath
           * @param {*} output
           * @param {*} all
           * @param {*} history
           * @returns
           */
          var versionsEchart = await generateChangesViz(
            repoPath,
            format,
            oasFiles[i].oaspath,
            outputDir,
            options.all,
            history_metadata,
            filename
          );
          i++;
          if (i < oasFiles.length) {
            nextFile(i);
          } else {
            return true;
          }
        };
        if (Array.isArray(oasFiles)) await nextFile(0);
      }

      //
    } catch (err) {
      console.log(err);
    }
  });

/**
 * Generate changes view.
 */
program
  .command("changes")
  .description("Generate changes visualization")
  .option(
    "-r, --repo <repo>",
    "Path to the repository. Defaults to current working directory."
  )
  .option("-o, --output <path>", "Path to the output directory")
  .option("-f, --format <format>", "Output format")
  .option("-freq, --frequency <frequency>", "Minimum frequency of changes")
  .option("-d, --details", "Show details")
  .option("-a, --all", "Generate OAS for all OAS files found in the repo")

  .action(async () => {
    message();
    const options = program.opts();
    const repoPath = options.repo || process.cwd();
    var aggregate = options.details ? false : true;
    var outputDir = options.output;
    var format = options.format;
    var fast = options.fast;
    var filename = options.filename;

    try {
      var oasFiles = [];
      if (!options.fast) {
        oasFiles = await fetchOASFiles(repoPath, options.all);

        var nextFile = async (i) => {
          var history_metadata = await fetchHistory(
            repoPath,
            oasFiles[i].oaspath
          );

          await computeDiff(repoPath, oasFiles[i].oaspath, fast);
          var changesEcharts = await renderTree(
            repoPath,
            options.frequency,
            format,
            false,
            oasFiles[i].oaspath,
            outputDir,
            false,
            history_metadata,
            filename
          );
          i++;
          if (i < oasFiles.length) {
            nextFile(i);
          } else {
            return true;
          }
        };
        if (Array.isArray(oasFiles)) await nextFile(0);
      }

      //
    } catch (err) {
      console.log(err);
    }
  });

program
  .command("metrics")
  .description("Generate metrics visualization")
  .option(
    "-r, --repo <repo>",
    "Path to the repository. Defaults to current working directory."
  )
  .option("-o, --output <path>", "Path to the output directory")
  .option("-f, --format <format>", "Output format")
  .option("-e, --endpoints", "Show endpoints")
  .option("-m, --methods", "Show methods")
  .option("-p, --parameters", "Show parameters")
  .option("-d, --datamodel", "Show datamodel")
  .option("-bc, --breakingChanges", "Show breaking changes")
  .option("-bm, --breakingMethods", "Show breaking methods")

  .action(async () => {
    message();
    const options = program.opts();
    var vizOptions = {};
    vizOptions.endpoints = options.endpoints ? true : false;
    vizOptions.methods = options.methods ? true : false;
    vizOptions.parameters = options.parameters ? true : false;
    vizOptions.datamodel = options.datamodel ? true : false;
    vizOptions.breakingChanges = options.breakingChanges ? true : false;
    vizOptions.breakingMethods = options.breakingMethods ? true : false;
    const repoPath = options.repo || process.cwd();
    try {
      await fetchHistory(repoPath);
      await computeDiff(repoPath);
      var metrics = await computeSizeMetrics(repoPath);
      var usedOptions =
        Object.keys(vizOptions).filter((key) => vizOptions[key] === true)
          .length > 0;
      renderMetrics(metrics, repoPath, vizOptions, options.format, usedOptions);
    } catch (err) {
      console.log(err);
    }
  });

/**
 * Generate report view.
 */

program
  .command("report")
  .description(
    "Generate human redable or machine readable API Evolution report "
  )
  .option(
    "-r, --repo <repo>",
    "Path to the repository. Defaults to current working directory."
  )
  .option("-o, --output <path>", "Path to the output directory")
  .option("-f, --format <format>", "Output format")
  .option("-fs", "--fast", "Fast mode")
  .action(async () => {
    message();
    const options = program.opts();
    const repoPath = options.repo || process.cwd();
    if (!options.fast) {
      await fetchHistory(repoPath);
      await computeDiff(repoPath);
    }

    var metrics = await computeSizeMetrics(repoPath);
    const overrAll = await computeOverallGrowthMetrics(repoPath, metrics);
    renderReport(overrAll);
  });






/**
 * Generate the vissorft gallery
 */
program
  .command("vissoft")
  .description("Generate the gallery appended to vissoft 2023 paper")
  .action(async () => {
    message();
    await vissoft();
   
  });

program.parse(process.argv);

function message() {
  console.log();
  console.log(
    " [ " +
      chalk.bold.yellow("A") +
      chalk.bold.blue("P") +
      chalk.bold.green("I") +
      chalk.bold.magenta("c") +
      chalk.bold.red("t") +
      chalk.bold.cyan("u") +
      chalk.bold.yellow("r") +
      chalk.bold.magenta("e") +
      " :  A CLI tool to visually depict API evolution ]"
  );
  console.log();
}
