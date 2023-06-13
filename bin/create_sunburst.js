import fs from "fs";
import ejs from "ejs";
import semver, { sort } from "semver";
import path, { join } from "path";
import echarts from "echarts";
import { createCanvas, loadImage } from "canvas";
import { fileURLToPath } from "url";
import SwaggerParser from "@apidevtools/swagger-parser";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// var echarts = require('node-echarts-canvas');
import node_echarts from "node-echarts-canvas";
import render from "echarts-svg";

async function createSunburst(
  commit,
  data,
  previous_version,
  color_dict,
  breakings,
  non_breakings,
  content
) {
  // month name

  var month = commit.commit_date.toLocaleString("default", { month: "short" });
  var year = commit.commit_date.getFullYear();
  var day = commit.commit_date.getDate();

  var commit_year = {
    name: year,
    children: [],
    // value: 1,
    itemStyle: {
      color: color_dict[year],
    },
  };

  var year_data = data.find((d) => d.name == year);
  if (!year_data) {
    data.push(commit_year);
  } else {
    // increment the value of the year
    // year_data.value++;
    commit_year = year_data;
  }

  // if the month doesn't exist in the children of the year, add it
  var commit_month = {
    name: month,
    children: [],
    year: year,
    itemStyle: {
      color: color_dict[year],
    },
    // value: 1,
  };

  var month_data = commit_year.children.find((d) => d.name == month);
  if (!month_data) {
    commit_year.children.push(commit_month);
  } else {
    // increment the value of the month
    // month_data.value++;
    commit_month = month_data;
  }

  // if the day doesn't exist in the children of the month, add it
  var commit_day = {
    name: day,

    children: [],
    month: month,
    year: year,
    itemStyle: {
      color: color_dict[year],
    },
    // value: 1,
  };

  var day_data = commit_month.children.find((d) => d.name == day);
  if (!day_data) {
    commit_month.children.push(commit_day);
  } else {
    // increment the value of the day
    day_data.value++;
    commit_day = day_data;
  }

  // time of the day
  var hour = commit.commit_date.getHours();
  var minute = commit.commit_date.getMinutes();
  var second = commit.commit_date.getSeconds();

  var commit_time = {
    name: hour + ":" + minute + ":" + second,
    children: [],
    day: day,
    month: month,
    year: year,
    itemStyle: {
      color: color_dict[year],
    },
    // value: 1,
  };

  var time_data = commit_day.children.find((d) => d.name == commit_time.name);
  if (!time_data) {
    commit_day.children.push(commit_time);
  } else {
    // increment the value of the time
    // time_data.value++;
    commit_time = time_data;
  }

  console.log(commit);

  console.log(content);
  var version = content.info.version;

  var commit_version = {
    name: version,
    children: [],
    // value: 1,
    // item style
    itemStyle: {
      // color: "", // green
      //   borderColor: "#000",
      //   borderWidth: 1,
      //   borderType: "solid",
      //   shadowBlur: 0,
    },
  };

  if (semver.valid(version) && semver.valid(previous_version)) {
    console.log(previous_version, version);
    if (previous_version) {
      // if minore version
      if (semver.diff(previous_version, version) == "minor") {
        // change color to lightblue
        commit_version.itemStyle.color = "#00BFFF";
      }
      // if major version
      if (semver.diff(previous_version, version) == "major") {
        // change color to light red
        commit_version.itemStyle.color = "#E4A4A4";
      }
      // if patch version
      if (semver.diff(previous_version, version) == "patch") {
        // change color to light green
        commit_version.itemStyle.color = "#90EE90";
      }

      if (semver.gt(previous_version, version)) {
        // B30000
        commit_version.itemStyle.color = "#B30000";
      }

      // if the versions are equal
      if (!semver.diff(previous_version, version)) {
        // change color to white
        commit_version.itemStyle.color = "#fff";
      }
    }
  }

  commit_time.children.push(commit_version);

  var breaking = {
    name: "breaking",
    itemStyle: {
      color: "#B30000",
    },
    collapsed: true,
    children: [],
  };

  var total_changes = 0;
  var breakingChanges = breakings.find((d) => d.hash == commit.hash);
  if (breakingChanges?.breaking.length > 0) {
    total_changes += breakingChanges.breaking.length;
    breaking.value = breakingChanges.breaking.length;

    // breaking.name = "Breaking Changes";

    try {
      breakingChanges.breaking.forEach((diff) => {
        var breaking_change = {
          name: diff.id
            .replaceAll(/-/g, " ")
            .replaceAll("api", "")
            .replaceAll("deprecation", "depr")
            .replaceAll("request", "req")
            .replaceAll("response", "res")
            .replaceAll("responses", "res")
            .replaceAll("parameter", "param")
            .replaceAll("optional", "opt"),
          original: diff.id,
          value: 1,
          itemStyle: {
            color: "#B30000",
          },
          collapsed: true,
          breaking: true,
        };
        // if not already added
        var breaking_change_data = breaking.children.find(
          (d) => d.original == diff.id
        );
        if (!breaking_change_data) {
          breaking.children.push(breaking_change);
        } else {
          breaking_change_data.value++;
        }
      });

      commit_version.children.push(breaking);
    } catch (err) {
      console.log(err);
    }
  }

  var non_breaking = {
    name: "non-breaking",
    itemStyle: {
      color: "#90EE90",
    },

    children: [],
    // value: 1,
  };

  var non_breaking_changes_arr = non_breakings.find(
    (d) => d.hash == commit.hash
  );
  if (non_breaking_changes_arr) {
    // number of non breaking changes
    var non_breaking_changes = Object.values(
      non_breaking_changes_arr.nonBreakingChanges
    ).reduce((a, b) => a + b, 0);

    console.log(non_breaking_changes);
    non_breaking.value = non_breaking_changes;

    // filter the non breaking changes
    var non_breaking_changes_data = Object.entries(
      non_breaking_changes_arr.nonBreakingChanges
    ).filter(([key, value]) => value > 0);

    non_breaking_changes_data.forEach((diff) => {
      var non_breaking_change = {
        name: diff[0]
          .replaceAll(/-/g, " ")
          .replaceAll("api", "")
          .replaceAll("deprecation", "depr")
          .replaceAll("request", "req")
          .replaceAll("response", "res")
          .replaceAll("responses", "res")
          .replaceAll("parameter", "param")
          .replaceAll("optional", "opt"),
        original: diff[0],

        value: diff[1],
        itemStyle: {
          color: "#90EE90",
        },
        breaking: false,
      };
      non_breaking.children.push(non_breaking_change);
    });

    if (non_breaking_changes_data.length > 0)
      commit_version.children.push(non_breaking);

    total_changes += non_breaking_changes;
  }

  if (total_changes > 0) {
    commit_version.value = total_changes;
    // commit_version.name += " (" + total_changes + ")";
  }
  return data;
}

function generateGrayGradient(maxNumber) {
  var gradient = [];

  var step = 255 / maxNumber;

  for (var i = 0; i <= maxNumber; i++) {
    var grayValue = Math.floor(i * step);
    var hexValue = grayValue.toString(16).padStart(2, "0");
    var hexColor = "#" + hexValue + hexValue + hexValue;
    gradient.push(hexColor);
  }

  return gradient;
}

async function main(path, format) {
  var data = [];
  var commits = fs.readFileSync(join(path, ".api_commits.json"));
  commits = JSON.parse(commits);

  var breakings = fs.readFileSync(join(path, ".breaking.json"));
  breakings = JSON.parse(breakings);

  var nonBreaking = fs.readFileSync(join(path, ".non-breaking.json"));
  nonBreaking = JSON.parse(nonBreaking);

  var years = commits.map((commit) => {
    // parse the date
    commit.commit_date = new Date(commit.commit_date);
    return commit.commit_date.getFullYear();
  });

  // get the unique years
  years = [...new Set(years)];

  var colors = generateGrayGradient(years.length);
  // assign a color to each year
  var color_dict = {};
  years.forEach((year, index) => {
    color_dict[year] = colors[index];
  });

  console.log(colors);
  console.log(commits.length);
  var i = 0;
  var nextCommit = async function (commit) {
    var previous_version = null;
    console.log(i);

    if (i > 0) {
      var previous_content = await SwaggerParser.parse(
        join(path, commits[i - 1].hash + "." + commit.fileExtension)
      );
      previous_version = previous_content.info.version;
    }
    i = i + 1;
    console.log(commit);
    var content = await SwaggerParser.parse(
      join(path, commit.hash + "." + commit.fileExtension)
    );

    await createSunburst(
      commit,
      data,
      previous_version,
      color_dict,
      breakings,
      nonBreaking,
      content
    );
    if (i < commits.length) {
      return await nextCommit(commits[i]);
    } else {
      let chartOptions = {
        grid: {
          width: "100%",
        },
        // visualMap: {
        //     type: 'continuous',
        //     min: 0,
        //     max: 30000,
        //     inRange: {
        //         color: ['#2F93C8', '#AEC48F', '#FFDB5C', '#F98862']
        //     }
        // },
        toolbox: {
          orient: "horizontal",
          show: true,
          itemSize: 17,
          itemGap: 15,
          feature: {
            saveAsImage: {
              show: true,
              title: "Save as PNG",
              pixelRatio: 3,
            },
            restore: {
              show: true,
              title: "Restore",
            },
            // // save as svg
            // myTool1: {
            //   show: true,
            //   title: "Save as SVG",
            //   icon:
            //     "path://M864 128H160c-17.7 0-32 14.3-32 32v704c0 " +
            //     "17.7 14.3 32 32 32h704c17.7 0 32-14.3 " +
            //     "32-32V160c0-17.7-14.3-32-32-32zM640 " +
            //     "704H384v-96h256v96zM640 512H384v-96h256v96zM640 " +
            //     "320H384v-96h256v96zM736 864H288V160h448v704z " +
            //     "m-192-96h96v-96h-96v96z",
            //   onclick: function () {
            //   }
          },
        },

        tooltip: {
          trigger: "item",
          triggerOn: "mousemove",
          formatter: function (params) {
            // show name and value
            return params.data.name + ": " + params.data.value;
          },
        },
        grid: {
          width: "100%",
        },
        calculable: false,
        series: {
          roam: true,
          center: ["50%", "50%"],
          radius: ["5%", "85%"],
          type: "sunburst",
          data: data,
          label: {
            overflow: "truncate",
            ellipsis: true,
          },
          labelLayout: {
            hideOverlap: true,
          },
        },
      };

      chartOptions.series.sort = undefined;
      chartOptions.series.levels = [
        {},
        {
          r0: "3%",
          r: "11%",
          label: {
            // bold labels
            // fontWeight: 'bold'
            fontSize: 10,
            minAngle: 10,
          },
        },
        {
          r0: "11%",
          r: "18%",
          label: {
            // bold labels
            // fontWeight: 'bold'
            fontSize: 10,
            minAngle: 10,
          },
        },
        {
          // reduce rings width
          r0: "18%",
          r: "25%",
          label: {
            rotate: "tangential",
            fontSize: 10,
            minAngle: 10,
          },
        },
        {
          // reduce rings width
          r0: "25%",
          r: "34%",

          //label font  size
          label: {
            fontSize: 7,
            minAngle: 10,
          },
        },
        {
          // reduce rings width
          r0: "34%",
          r: "42%",
          label: {
            // bold labels
            // fontWeight: 'bold'
            // rotate: "tangential",

            // ifCondition: {
            //   minAngle: 10,

            // },

            fontSize: 9,
          },
        },
        {
          r0: "42%",
          r: "44%",
          itemStyle: {
            borderWidth: 1,
          },
          label: {
            show: false,
            rotate: "tangential",
          },
        },

        {
          r0: "44%",
          r: "45%",
          label: {
            position: "outside",
            padding: 0,
            silent: false,
            fontSize: 11,
            color : "#000000",
            fontWeight: "bold",
          },
          itemStyle: {
            borderWidth: 2,
          },
        },
      ];

      fs.writeFileSync(
        join(path, ".sunburst-source.json"),
        JSON.stringify(chartOptions, null, 2)
      );

      // if (format == "html") {
        var template = fs.readFileSync(
          join("bin/templates/sunburst.ejs"),
          "utf8",
          (err, template) => {
            if (err) {
              console.error("Error reading template:", err);
              return;
            }
          }
        );
        var rendered = ejs.render(template, {
          chartOptions: JSON.parse(JSON.stringify(chartOptions)),
          format: format
        });

        if (!fs.existsSync(join(path, "..", "apivol-outputs"))) {
          fs.mkdirSync(join(path, "..", "apivol-outputs"), { recursive: true });
        }
        fs.writeFileSync(
          join(path, "..", "apivol-outputs", "sunburst.html"),
          rendered,
          "utf8",
          (err) => {
            if (err) {
              console.error("Error saving output:", err);
            } else {
              console.log("Output saved as", { outputPath });
            }
          }
        );
      // }

      // PNG output
      if (format == "png") {
       
      }

      // SVG output
      if (format == "svg") {
      }

      return chartOptions;
    }
  };

  await nextCommit(commits[i]);
}

