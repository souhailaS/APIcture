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

/**
 * Generate the versions clock view.
 */
program
  .command("clock")
  .description("Generate API Changes vs API Versioning Sunburst Visualization")
  .option(
    "-r, --repo <path>",
    "Path to the repository. Defaults to current working directory."
  )
  .option("-o, --output <path>", "Path to the output directory")
  .option("-f, --format <format>", "Output format")
  .option("-fs, --fast", "Fast mode")
  .option("-a, --all", "Generate OAS for all OAS files found in the repo")

  .action(async (options) => {
    message();

    const repoPath = options.repo || process.cwd();
    const outputDir = options.output || process.cwd();
    const format = options.format;
    const filename = options.filename || "evolution-visualization";
    try {
      var oasFiles = [];
      if (!options.fast) {
        oasFiles = await fetchOASFiles(repoPath, options.all);

        var nextFile = async (i) => {
          var history_metadata = await fetchHistory(
            repoPath,
            oasFiles[i].oaspath
          );
          await computeDiff(repoPath, oasFiles[i].oaspath);
          await generateChangesViz(
            repoPath,
            format,
            oasFiles[i].oaspath,
            options.output,
            history_metadata
          );
          console.log(
            `|- Rendering sunburst chart in [${format.toUpperCase()}] format for ${
              oasFiles[i].oaspath
            }`
          );
          i++;
          if (i < oasFiles.length) {
            nextFile(i);
          } else {
            return true;
          }
        };
        await nextFile(0);
      }

      //
    } catch (err) {
      console.log(err);
    }
  });

program
  .command("changes")
  .description("Generate changes visualization")
  .option(
    "-r, --repo <path>",
    "Path to the repository. Defaults to current working directory."
  )
  .option("-o, --output <path>", "Path to the output directory")
  .option("-f, --format <format>", "Output format")
  .option("-freq, --frequency <frequency>", "Minimum frequency of changes")
  .option("-d, --details", "Show details")
  .option("-a, --all", "Generate OAS for all OAS files found in the repo")

  .action(async (options) => {
    message();
    const repoPath = options.repo || process.cwd();
    var aggregate = options.details ? false : true;
    var format = options.format || "html";

    try {
      var oasFiles = [];
      if (!options.fast) {
        oasFiles = await fetchOASFiles(repoPath, options.all);

        var nextFile = async (i) => {
          var history_metadata = await fetchHistory(
            repoPath,
            oasFiles[i].oaspath
          );

          await computeDiff(repoPath, oasFiles[i].oaspath);
          await renderTree(
            repoPath,
            options.frequency,
            format,
            aggregate,
            oasFiles[i].oaspath
          );
          console.log(
            `|- Rendering sunburst chart in [] format for ${oasFiles[i].oaspath}`
          );
          i++;
          if (i < oasFiles.length) {
            nextFile(i);
          } else {
            return true;
          }
        };
        await nextFile(0);
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
    "-r, --repo <path>",
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

  .action(async (options) => {
    message();
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

program
  .command("report")
  .description(
    "Generate human redable or machine readable API Evolution report "
  )
  .option(
    "-r, --repo <path>",
    "Path to the repository. Defaults to current working directory."
  )
  .option("-o, --output <path>", "Path to the output directory")
  .option("-f, --format <format>", "Output format")
  .option("-fs", "--fast", "Fast mode")
  .action(async (options) => {
    message();
    const repoPath = options.repo || process.cwd();
    if (!options.fast) {
      await fetchHistory(repoPath);
      await computeDiff(repoPath);
    }

    var metrics = await computeSizeMetrics(repoPath);
    const overrAll = await computeOverallGrowthMetrics(repoPath, metrics);
    renderReport(overrAll);
  });

function message() {
  // console.log();
  // console.log(
  //   chalk.bold.yellow(
  //     "  _______  _______  _______  _______  _______  _______  "
  //   )
  // );
  console.log();
  console.log(
    " [" +
      chalk.bold.yellow("A") +
      chalk.bold.blue("P") +
      chalk.bold.green("I") +
      chalk.bold.magenta("c") +
      chalk.bold.red("t") +
      chalk.bold.cyan("u") +
      chalk.bold.yellow("r") +
      chalk.bold.magenta("e") +
      " :  A CLI tool to visually depict API evolution]"
  );
  // console.log(
  //   chalk.bold.yellow(
  //     "  _______  _______  _______  _______  _______  _______  "
  //   )
  // );
  console.log();
}

/**
 * If no parameter is passed generate both the version clock and changes visualizations
 */
program
  .description("Generate Evolution visualizations")
  .option(
    "-r, --repo <path>",
    "Path to the repository. Defaults to current working directory."
  )
  .option("-o, --output <path>", "Path to the output directory")
  .option("-freq, --frequency <frequency>", "Minimum frequency of changes")
  .option("-fs, --fast", "Fast mode")
  .option("-f, --format <format>", "Output format")
  .option("-a, --all", "Generate OAS for all OAS files found in the repo")
  .option("-d, --details", "Show details")
  // file name for the output file
  .option("-fn, --filename <filename>", "Output file name [Without file extension]")

  .action(async (options) => {
    message();

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



        // var changesEcharts = await renderTree(
        //   repoPath,
        //   options.frequency,
        //   "echarts",
        //   false,
        //   oasFiles[i].oaspath,
        //   options.output,
        //   false,
        //   history_metadata
        // );

        // var to_render = {
        //   changesEcharts,
        //   versionsEchart,
        //   output: outputDir,
        //   filename: oasFiles[i].oaspath.split(".")[0],
        //   history_metadata,
        // };

        // renderAllCharts(to_render);

        // var metrics = await computeSizeMetrics(
        //   join(
        //     repoPath,
        //     ".previous_versions",
        //     oasFiles[i].oaspath.split(".")[0]
        //   )
        // );
        // const overrAll = await computeOverallGrowthMetrics(
        //   join(
        //     repoPath,
        //     ".previous_versions",
        //     oasFiles[i].oaspath.split(".")[0]
        //   ),
        //   metrics
        // );
        // renderReport(overrAll);

        console.log(
          `|- Rendering all charts in [html] format for ${oasFiles[i].oaspath}`
        );

        i++;
        if (i < oasFiles.length) {
          nextFile(i);
        } else {
          return true;
        }
      };
      await nextFile(0);

      //
    } catch (err) {
      console.log(err);
    }
  });

program.parse(process.argv);
