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
import { fetchHistory } from "../fetch_history.js";
import { computeDiff } from "../oasdiff.js";
import { generateChangesViz } from "../create_sunburst.js";
import { renderTree } from "../create_changes_tree.js";
import { computeSizeMetrics } from "../metrics.js";
import { renderMetrics } from "../create_metrics_charts.js";
import { computeOverallGrowthMetrics } from "../overall_metrics.js";
import { renderReport } from "../render_report.js";

import chalk from "chalk";

// program.name("apict").description("CLI").version("0.0.1");

program
  .command("versioning")
  .description("Generate API Changes vs API Versioning Sunburst Visualization")
  .option(
    "-r, --repo <path>",
    "Path to the repository. Defaults to current working directory."
  )
  .option("-o, --output <path>", "Path to the output directory")
  .option("-f, --format <format>", "Output format")
  .action(async (options) => {
    message();
    const repoPath = options.repo || process.cwd();
    const outputDir = options.output || process.cwd();
    const format = options.format || "html";
    const filename = options.filename || "evolution-visualization";
    try {
      // await fetchHistory(repoPath);
      console.log();
      await computeDiff(repoPath);
      console.log(
        `|- Rendering sunburst chart in [${format.toUpperCase()}] format`
      );
      await generateChangesViz(repoPath, format);
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
  
  .action(async (options) => {
    message();
    const repoPath = options.repo || process.cwd();
    try {
      await fetchHistory(repoPath);
      await computeDiff(repoPath);
      var aggregate = options.details ? false : true;
      await renderTree(repoPath,  options.frequency, options.format,aggregate);
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
  .action(async (options) => {
    message();
    const repoPath = options.repo || process.cwd();
    await fetchHistory(repoPath);
    await computeDiff(repoPath);
    var metrics = await computeSizeMetrics(repoPath);
    const overrAll = await computeOverallGrowthMetrics(repoPath, metrics);
    renderReport(overrAll);
  });

function message() {
  console.log();
  console.log(
    chalk.bold.yellow(
      "  _______  _______  _______  _______  _______  _______  "
    )
  );
  console.log();
  console.log(
    " " +
      chalk.bold.yellow("A") +
      chalk.bold.blue("P") +
      chalk.bold.green("I") +
      chalk.bold.magenta("c") +
      chalk.bold.red("t") +
      chalk.bold.cyan("u") +
      chalk.bold.yellow("r") +
      " :  A CLI tool to visually depict API evolution"
  );
  console.log(
    chalk.bold.yellow(
      "  _______  _______  _______  _______  _______  _______  "
    )
  );
  console.log();
}

program.parse(process.argv);
