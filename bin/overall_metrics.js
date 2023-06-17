import { join } from "path";
import SwaggerParser from "@apidevtools/swagger-parser";
import fs from "fs";
import {
  version_formats,
  versions_formats_classes,
} from "./versions_parser/regex.js";
import { detectChanges } from "./versions_parser/upgrades_detector.js";

export async function computeOverallGrowthMetrics(path) {
  var diffs = [];
  var versions = [];
  path = join(path, ".previous_versions");
  fs.writeFileSync(join(path, ".metrics.json"), "[]");
  var hashes = fs.readFileSync(join(path, ".api_commits.json"));
  var oasPaths = JSON.parse(hashes);
  // sort by commit date
  oasPaths.sort((a, b) => {
    return new Date(a.commit_date) - new Date(b.commit_date);
  });

  var next = async (i) => {
    var currentHash = oasPaths[i].hash;
    try {
      var thisCommit = await SwaggerParser.parse(
        join(path, oasPaths[i].hash + "." + oasPaths[i].fileExtension)
      );

      if (thisCommit) {
        var v = thisCommit.info.version;
        var version_format = "Other";
        version_format = Object.keys(
          version_formats.filter((vf) => {
            if (Object.values(vf)[0].test(v)) {
              return true;
            }
          })[
            version_formats.filter((vf) => {
              if (Object.values(vf)[0].test(v)) {
                return true;
              }
            }).length - 1
          ]
        )[0];

        var version_format_class = Object.keys(
          versions_formats_classes.filter((vf) => {
            if (Object.values(vf)[0].test(version_format)) {
              return true;
            }
          })[
            versions_formats_classes.filter((vf) => {
              if (Object.values(vf)[0].test(version_format)) {
                return true;
              }
            }).length - 1
          ]
        )[0];

        versions.push({
          hash: oasPaths[i].hash,
          commit_date: oasPaths[i].commit_date,
          version: v,
          version_format: version_format,
          version_format_class: version_format_class,
        });

        var thisCommit = thisCommit.paths
          ? Object.keys(thisCommit.paths).reduce((a, b) => {
              return thisCommit.paths[b]
                ? a + Object.keys(thisCommit.paths[b]).length
                : a;
            }, 0)
          : 0;

        // console.log("thisCommit", thisCommit);
        try {
          var nextCommit = await SwaggerParser.parse(
            join(
              path,
              oasPaths[i + 1].hash + "." + oasPaths[i + 1].fileExtension
            )
          );
          var nextCommit = nextCommit.paths
            ? Object.keys(nextCommit.paths).reduce((a, b) => {
                return nextCommit.paths[b]
                  ? a + Object.keys(nextCommit.paths[b]).length
                  : a;
              }, 0)
            : 0;

          // console.log("nextCommit", nextCommit);

          var diff = nextCommit - thisCommit;

          diffs.push(diff);
        } catch (e) {
          console.log(e);
        }
      }
      if (i < oasPaths.length - 2) {
        return await next(i + 1);
      } else {
        //   console.log("diffs", diffs);
        var shrinkCommits = diffs.filter((d) => d < 0).length;
        var growthCommits = diffs.filter((d) => d > 0).length;
        var stableCommits = diffs.filter((d) => d == 0).length;

        var gms = false;
        var smg = false;
        var stable = false;

        var shrink = diffs.filter((d) => d < 0).reduce((a, b) => a + b, 0);
        var growth = diffs.filter((d) => d > 0).reduce((a, b) => a + b, 0);
        var stable = diffs.filter((d) => d == 0).reduce((a, b) => a + b, 0);

        if (growth < shrink) {
          smg = true;
        }

        if (growth > shrink) {
          gms = true;
        }

        if (stableCommits == diffs.length) {
          stable = true;
        }

        // BREAKING CHANGES
        var versions_changes = detectChanges(versions);
        var breakings = fs.readFileSync(join(path, ".breaking.json"));
        breakings = JSON.parse(breakings);
        // console.log(breakings)
        // add the breaking changes to the versions_changes with the same hash
        versions_changes.forEach((vc) => {
          var breaking = breakings.filter((b) => b.hash == vc.to_hash).flat(1);
          vc.breaking = breaking.map((b) => b.breaking).flat(1);
        });

        // NON BREAKING CHANGES
        var non_breakings = fs.readFileSync(join(path, ".non-breaking.json"));
        non_breakings = JSON.parse(non_breakings);

        versions_changes.forEach((vc) => {
          var non_breaking = non_breakings
            .filter((b) => b.hash == vc.to_hash)
            .flat(1);
          vc.non_breaking = non_breaking.map((b) => b.nonBreakingChanges);
        });

        // console.log(versions_changes);

        return {
          changes_types: {
            breaking: breakings.map((b) => b.breaking).flat(1).length,
            non_breaking: non_breakings
              .map((b) => Object.values(b.nonBreakingChanges))
              .flat(1)
              .reduce((a, b) => a + b, 0),
          },
          gms: gms,
          smg: smg,

          growth: growth,
          shrink: shrink,
          stable: stable,
          shrinkCommits: shrinkCommits,
          growthCommits: growthCommits,
          stableCommits: stableCommits,
          versions_changes: versions_changes,
        };
      }
    } catch (e) {
      var err = new Error(`
      Could not parse OAS file of commit ${currentHash}`)
      err.name = "OASParserError";
      console.log(err);
    }
  };

  return await next(0);
}
