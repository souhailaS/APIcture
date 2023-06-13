/**
 * This script uses commander to create the CLI tool for generating Evolution visualizations.
 * The CLI tool can be used to generate visualizations for a given repository.
 *  - The repository can be specified using the --repo flag.
 * if no repository is specified, the current working directory is used.
 * - The output directory can be specified using the --output flag.
 * if no output directory is specified, the current working directory is used. A folder named "apivol-outputs" is created in the output directory.
 * - The output format can be specified using the --format flag.
 * if no output format is specified, the default format is html.
 * - The output file name can be specified using the --filename flag.
 * if no output file name is specified, the default file name is "evolution-visualization".
 * - the subcommand "changes" can be used to generate the changes visualization.
 *
 *
 */

import { Command } from "commander";
import { execSync } from "child_process";
import { fetchHistory } from "../fetch_history.js";
import { computeDiff} from "../oasdiff.js";
import { generateChangesViz } from "../create_sunburst.js";
const program = new Command();

program.name("apivol").description("CLI").version("0.0.1");

program
  .command("changes")
  .description("Generate changes visualization")
  .option("-r, --repo <path>", "Path to the repository")
  .action(async (options) => {
    const repoPath = options.repo || process.cwd();
    try {
    await fetchHistory(repoPath);
    await computeDiff(repoPath);
    await generateChangesViz(repoPath);

    } catch (err) {
        console.log(err);
    }
    
  });

program.parse(process.argv);
