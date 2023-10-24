#!/usr/bin/env node --no-warnings

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
import { fetch_history, fetchOASFiles } from "../fetch_history.js";
import { compute_diff } from "../oasdiff.js";
import { generateChangesViz } from "../create_sunburst.js";
import { renderTree } from "../create_changes_tree.js";
import { computeSizeMetrics } from "../metrics.js";
import { renderMetrics } from "../create_metrics_charts.js";
import { computeOverallGrowthMetrics } from "../overall_metrics.js";
import { renderReport } from "../render_report.js";
import { renderAllCharts } from "../render_all_viz.js";
import chalk from "chalk";
// local imports 
import { generateOAS } from "../oasgen/oasgen.js";
import vissoft from "../../vissoft/vissoft.js";
import test_apicture from "../../bin/test/test.js";
import packageJson from "../../package.json" assert { type: "json" };
import fs from "fs";

const program = new Command();

/**
 * No subcommands
 * When no subcommands are specified, the default action is to generate all visualizations in HTML format.
 */
program
  .description("Generate Evolution visualizations")
  .option(
    "-r, --repo <repo>",
    "Path to the repository. Defaults to current working directory."
  )
  .option("-o, --output <path>", "Path to the output directory")
  .option("-freq, --frequency <frequency>", "Minimum frequency of changes")
  .option("-fs, --fast", "Fast mode")
  .option("-f, --format <format>", "Output format")
  .option("-a, --all", "Generate OAS for all OAS files found in the repo")
  .option(
    "-fn, --filename <filename>",
    "Output file name [Without file extension]"
  )
  .option("-c, --clean", "Clean up all the history files after generation")
  .option("-v, --version", "Output the current version of APIcture")

  .action(async () => {
    message();
    if (program.opts().version) {
      console.log("Current version is", chalk.bold(packageJson.version));
      return;
    }

    const options = program.opts();
    const repoPath = options.repo || process.cwd();
    const output_dir = options.output;
    const format = options.format;
    const filename = options.filename;
    const fast = options.fast || false;
    const clean = options.clean || false;

    try {
      const oasFiles = await fetchOASFiles(repoPath, options.all);
      const nextFile = async (i) => {
        let history_metadata = await fetch_history(
          repoPath,
          oasFiles[i].oas_path
        );
        await compute_diff(repoPath, oasFiles[i].oas_path, fast);
        /**
         *
         * @param {*} path
         * @param {*} format
         * @param {*} oas_path
         * @param {*} output
         * @param {*} all
         * @param {*} history
         * @returns
         **/
        var versions_echarts = await generateChangesViz(
          repoPath,
          format,
          oasFiles[i].oas_path,
          output_dir,
          options.all,
          history_metadata,
          filename
        );


        /**
         * 
         * @param {*} path
         * @param {*} frequency
         * @param {*} format
         * @param {*} aggregate
         * @param {*} oas_path
         * @param {*} output
         * @param {*} all
         * @param {*} history
         * @returns
         **/
        var changes_echarts = await renderTree(
          repoPath,
          options.frequency,
          format,
          false,
          oasFiles[i].oas_path,
          options.output,
          false,
          history_metadata,
          filename
        );

        var metrics = await computeSizeMetrics(repoPath, oasFiles[i].oas_path);
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
          oasFiles[i].oas_path
        );

        if (format == "html" || !format) {
          var to_render = {
            changes_echarts,
            versions_echarts,
            path: repoPath,
            output: output_dir,
            filename: filename ? filename : oasFiles[i].oas_path.split(".")[0],
            oas_path: oasFiles[i].oas_path.split(".")[0],
            history_metadata,
            metrics: chartOptions,
            options: vizOptions,
            usedOptions,
          };
          renderAllCharts(to_render);
        }

        const over_all = await computeOverallGrowthMetrics(
          repoPath,
          oasFiles[i].oas_path
        );
        renderReport(over_all , format, output_dir, filename);

        if (clean) {
          await fs.promises.rm(`${repoPath}/.previous_versions`, {
            recursive: true,
          });
          console.log(
            chalk.bold(
              `|-- Cleaned 🧹 🧹 `
            )
          );
        }

        i++;
        if (i < oasFiles.length) {
          await nextFile(i);
        } else {
          return true;
        }
      };
      if (Array.isArray(oasFiles)) await nextFile(0);
      else {
        await compute_diff(repoPath, oasFiles.oas_file, fast);
      }
      return true;
    } catch (err) {
      // console.log(err);
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
    const output_dir = options.output;
    const format = options.format;
    const filename = options.filename;
    const fast = options.fast;

    // console.log(options);

    try {
      var oasFiles = [];
      if (!options.fast) {
        oasFiles = await fetchOASFiles(repoPath, options.all);
        var nextFile = async (i) => {
          var history_metadata = await fetch_history(
            repoPath,
            oasFiles[i].oas_path
          );
          await compute_diff(repoPath, oasFiles[i].oas_path, fast);
          /**
           *
           * @param {*} path
           * @param {*} format
           * @param {*} oas_path
           * @param {*} output
           * @param {*} all
           * @param {*} history
           * @returns
           */
          var versions_echarts = await generateChangesViz(
            repoPath,
            format,
            oasFiles[i].oas_path,
            output_dir,
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
  .option("-c, --clean", "Clean up all the history files after generation")

  .action(async () => {
    message();
    const options = program.opts();
    const repoPath = options.repo || process.cwd();
    var aggregate = options.details ? false : true;
    var output_dir = options.output;
    var format = options.format;
    var fast = options.fast;
    var filename = options.filename;

    try {
      var oasFiles = [];
      if (!options.fast) {
        oasFiles = await fetchOASFiles(repoPath, options.all);

        var nextFile = async (i) => {
          var history_metadata = await fetch_history(
            repoPath,
            oasFiles[i].oas_path
          );

          await compute_diff(repoPath, oasFiles[i].oas_path, fast);
          var changes_echarts = await renderTree(
            repoPath,
            options.frequency,
            format,
            false,
            oasFiles[i].oas_path,
            output_dir,
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

    if (options.clean) {
      fs.promises.rm(`${repoPath}/.previous_versions`, { recursive: true });
      console.log(
        chalk.bold(
          `|-- Cleaned 🧹 🧹 `
        )
      );
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
  .option("-a, --all", "Generate OAS for all OAS files found in the repo")
  .option(
    "-fn, --filename <filename>",
    "Output file name [Without file extension]"
  )
  .option("-fs, --fast", "Fast mode")
  .option("-e, --endpoints", "Show endpoints")
  .option("-m, --methods", "Show methods")
  .option("-p, --parameters", "Show parameters")
  .option("-d, --datamodel", "Show datamodel")
  .option("-bc, --breakingChanges", "Show breaking changes")
  .option("-bm, --breakingMethods", "Show breaking methods")
  .option("-c, --clean", "Clean up all the history files after generation")
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
    vizOptions.all = options.all ? true : false;


    const fast = options.fast || false;
    const format = options.format || "html";
    const filename = options.filename;
    const clean = options.clean || false;
    const repoPath = options.repo || process.cwd();
    try {
      const oasFiles = await fetchOASFiles(repoPath, options.all);
      // await fetch_history(repoPath);
      // await compute_diff(repoPath);
      // var metrics = await computeSizeMetrics(repoPath);
      // var usedOptions =
      //   Object.keys(vizOptions).filter((key) => vizOptions[key] === true)
      //     .length > 0;
      // renderMetrics(metrics, repoPath, vizOptions, options.format, usedOptions);

      const nextFile = async (i) => {
        let history_metadata = await fetch_history(
          repoPath,
          oasFiles[i].oas_path
        );

        await compute_diff(repoPath, oasFiles[i].oas_path, fast);


        var metrics = await computeSizeMetrics(repoPath, oasFiles[i].oas_path);
        var vizOptions = {};
        vizOptions.endpoints = options.endpoints ? true : false;
        vizOptions.methods = options.methods ? true : false;
        vizOptions.parameters = options.parameters ? true : false;
        vizOptions.datamodel = options.datamodel ? true : false;
        vizOptions.breakingChanges = options.breakingChanges ? true : false;
        vizOptions.breakingMethods = options.breakingMethods ? true : false;
        var usedOptions = false;

        if (format == "html" || !format) {
          renderMetrics(metrics, repoPath, vizOptions, format, usedOptions, oasFiles[i].oas_path);
        }

        if (clean) {
          await fs.promises.rm(`${repoPath}/.previous_versions`, {
            recursive: true,
          });
          console.log(
            chalk.bold(
              `|-- Cleaned 🧹 🧹 `
            )
          );
        }

        i++;
        if (i < oasFiles.length) {
          await nextFile(i);
        } else {
          return true;
        }
      };
      if (Array.isArray(oasFiles)) await nextFile(0);
      else {
        await compute_diff(repoPath, oasFiles.oas_file, fast);
      }
      return true;
    } catch (err) {
      console.log(err);
    }

    if (options.clean) {
      fs.promises.rm(`${repoPath}/.previous_versions`, { recursive: true });
      console.log(
        chalk.bold(
          `|-- Cleaned 🧹 🧹 `
        )
      );
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
  .option("-c, --clean", "Clean up all the history files after generation")

  .action(async () => {
    message();

    const options = program.opts();
    const repoPath = options.repo || process.cwd();
    const output_dir = options.output;
    const format = options.format;
    const filename = options.filename;
    const fast = options.fast || false;
    const clean = options.clean || false;

    const oasFiles = await fetchOASFiles(repoPath, options.all);
    const nextFile = async (i) => {
      await compute_diff(repoPath, oasFiles[i].oas_path, fast);
      const over_all = await computeOverallGrowthMetrics(
        repoPath,
        oasFiles[i].oas_path
      );
      renderReport(over_all, format);

      if (clean) {
        await fs.promises.rm(`${repoPath}/.previous_versions`, {
          recursive: true,
        });
        console.log(
          chalk.bold(
            `|-- Cleaned 🧹 🧹 `
          )
        );
      }

      i++;
      if (i < oasFiles.length) {
        await nextFile(i);
      } else {
        return true;
      }
    };
    if (Array.isArray(oasFiles)) await nextFile(0);
    else {
      await compute_diff(repoPath, oasFiles.oas_file, fast);
    }

    if (options.clean) {
      fs.promises.rm(`${repoPath}/.previous_versions`, { recursive: true });
      console.log(
        chalk.bold(
          `|-- Cleaned 🧹 🧹 `
        )
      );
    }

  });






/**
 * Generate the vissorft gallery
 */
program
  .command("vissoft")
  .description("Generate the gallery appended to vissoft 2023 paper.")
  .action(async () => {
    message();
    console.log("The gallery visualizations generation starts by downloading the \nrepositories from GitHub, then generating the visualizations.\n This process may take a while.");
    console.log("> If no URLs JSON file is provided or an invalid JSON is provided,\nthe default git_urls.json file included in the projects is used.");
    console.log("> If no destination folder is provided, the current is used.");
    console.log("")
    await vissoft();
  });





/**
 * Generate the viz for test projects 
 */
program
  .command("test")
  .description("Generate the gallery appended to test projects.")
  .action(async () => {
    message();
    console.log("The gallery visualizations generation starts by downloading the \nrepositories from GitHub, then generating the visualizations.\n This process may take a while.");
    console.log("> If no URLs JSON file is provided or an invalid JSON is provided,\nthe default git_urls.json file included in the projects is used.");
    console.log("> If no destination folder is provided, the current is used.");
    console.log("")
    await test_apicture();
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
