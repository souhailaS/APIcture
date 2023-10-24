import columnify from "columnify";
import chalk from "chalk";
import fs from "fs";

export const renderReport = (report, format, output_dir, filename) => {
  var to_print = ``;
  if (!format) {
    to_print = `${chalk.bgBlueBright.bold(
      `                        API EVOLUTION REPORT                        `
    )}\n`;
    to_print += `\n`;
    to_print += `${chalk.bgCyan.bold(`  Overall Growth Metrics  `)}: `;
    //
    if (report.gms) {
      to_print += `${chalk.bold.green("API grows more than shrinks")}`;
    }
    if (report.smg) {
      to_print += `${chalk.bold.red("API shrinks more than grows")}`;
    }

    to_print += `\n\n`;
    to_print += `----------------------------\n`;
    to_print += `${chalk(
      columnify(
        {
          "\tAPI Growth": report.growth + " Paths",
          "\tAPI Shrinking": report.shrink + " Paths",
          "\tStable commits": report.stable + " Commits",
          "\tShrinking commits": report.shrinkCommits + " Commits",
          "\tGrowth commits": report.growthCommits + " Commits",
        },
        {
          columns: ["Metric", "Value"],
          //   showHeaders: false,
        }
      )
    )}\n`;
    to_print += `----------------------------`;
    to_print += `\n\n`;

    to_print += `${chalk.bgCyan.bold(`  API Changes  `)}: `;
    if (report.changes_types.breaking > report.changes_types.non_breaking) {
      to_print += `${chalk.bold.red(
        "API  has more breaking changes than non breaking changes"
      )}`;
    }
    if (report.changes_types.breaking < report.changes_types.non_breaking) {
      to_print += `${chalk.bold.green(
        "API  has more non breaking changes than breaking changes"
      )}`;
    }
    to_print += `\n\n`;
    to_print += `----------------------------\n`;
    to_print += `${chalk(
      columnify({
        "\tAPI Changes":
          report.changes_types.breaking +
          report.changes_types.non_breaking +
          " Changes",
        "\tBreaking Changes":
          report.changes_types.breaking +
          " (" +
          ((100 * report.changes_types.breaking) /
            (report.changes_types.breaking +
              report.changes_types.non_breaking)).toFixed(2) +
          "%) " +
          " Changes",
        "\tNon Breaking Changes":
          report.changes_types.non_breaking +
          " (" +
          ((100 * report.changes_types.non_breaking) /
            (report.changes_types.breaking +
              report.changes_types.non_breaking)).toFixed(2) +
          "%) " +
          " Changes",
      })
    )}\n`;
    to_print += `----------------------------`;
    to_print += `\n\n`;
    to_print += `${chalk.bgCyan.bold(`  API Versioning  `)}: `;
    to_print += `\n\n`;

    const versioning = analyze_versioning(report);
    to_print += `----------------------------\n`;
    to_print += `${chalk(
      columnify(
        {
          "\tAPI Versions": versioning.versionIdentifiers.length + " Versions",
          "\t Version Changes":
            versioning.versionsChanges.filter((c) => c.type != "none").length +
            " Changes",
        },
        {
          columns: ["Metric", "Value"],
          //   showHeaders: false,
        }
      )
    )}\n`;
    to_print += `----------------------------\n`;
    var version_changes = Object.keys(versioning.versionChangesCount).map(
      (v) => {
        return {
          "Version Change": v,
          Changes: versioning.versionChangesCount[v].count,
          Backwards: versioning.versionChangesCount[v].backwards,
          Breaking: versioning.versionChangesCount[v].breaking,
          "Non Breaking": versioning.versionChangesCount[v].non_breaking,
        };
      },
      {
        columns: ["Version Change", "Changes"],
        // showHeaders: false,
      }
    );
    if (version_changes.length > 0) {
      to_print += `${chalk(columnify(version_changes))}\n`;
      to_print += `----------------------------`;
      to_print += `\n\n`;
    }

    console.log(to_print);
  } else if (format == "json") {
    const dest = output_dir ? filename ? `${output_dir}/${filename}.json` : `${output_dir}/report.json` : 'report.json';
    fs.writeFileSync(dest, JSON.stringify(report, null, 2));

  }
};

function analyze_versioning(report) {
  var versions_changes = report.versions_changes;

  var versionsChanges = versions_changes
    .filter((v) => v.upgrade_type)
    .map((v) => {
      return {
        type: v.upgrade_type,
        backwards: v.backwards,
        breaking: v.breaking.length,
        non_breaking: v.non_breaking.length,
      };
    });

  var versionChangesCount = {};

  versionsChanges.forEach((v) => {
    if (!versionChangesCount[v.type]) {
      versionChangesCount[v.type] = {};
      versionChangesCount[v.type].count = 1;
      versionChangesCount[v.type].backwards = v.backwards ? 1 : 0;
      versionChangesCount[v.type].breaking = v.breaking;
      versionChangesCount[v.type].non_breaking = v.non_breaking;
    } else {
      versionChangesCount[v.type].count += 1;
      v.backwards ? (versionChangesCount[v.type].backwards += 1) : 0;
      versionChangesCount[v.type].breaking += v.breaking;
      versionChangesCount[v.type].non_breaking += v.non_breaking;
    }
  });

  var versionIdentifiers = [
    ...new Set(
      versions_changes
        .map((c) => c.to)
        .concat(versions_changes.map((c) => c.from))
    ),
  ];

  // breaking changes in each version change
  var versioning = {};
  [...new Set(versionsChanges)].forEach((v) => {
    if (!versioning[v]) {
      versioning[v] = [];
    } else {
      var br = versions_changes
        .filter((c) => c.upgrade_type == v)
        .map((c) => c.breaking);
      if (br.length > 0) versioning[v].push(br);
      versioning[v] = versioning[v].flat(1);
    }
  });

  return {
    versionsChanges,
    versionChangesCount,
    versionIdentifiers,
    versioning,
  };
}
