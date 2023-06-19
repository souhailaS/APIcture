import fs from "fs";
import ejs from "ejs";
import semver, { sort } from "semver";
import path, { join } from "path";
import echarts, { use } from "echarts";
import { createCanvas, loadImage } from "canvas";
import { fileURLToPath } from "url";
import SwaggerParser from "@apidevtools/swagger-parser";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import chalk from "chalk";
import open from "open";

async function createSunburst(
  commit,
  data,
  previous_version,
  color_dict,
  breakings,
  non_breakings,
  content,
  useSemver,
  versionColors
) {
  // month name

  console.log("commit: ", commit.commit_date);
  var month = commit.commit_date.toLocaleString("default", { month: "short" });
  var year = commit.commit_date.getFullYear();
  var day = commit.commit_date.getDate();

  var commit_year = {
    name: year,
    children: [],
    commit_date: commit.commit_date,
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
    commit_date: commit.commit_date,
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

    commit_date: commit.commit_date,
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
  var version = content.info.version;
  var commit_time = {
    name: hour + ":" + minute + ":" + second,
    children: [],
    day: day,
    commit_date: commit.commit_date,
    month: month,
    year: year,
    itemStyle: {
      // color: color_dict[year],
      color: versionColors.filter((d) => d.version == version)[0].color,
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

  var commit_version = {
    name: version,
    children: [],
    commit_date: commit.commit_date,
    // value: 1,
    // item style
    itemStyle: {
      color: "#fff",
      // color: versionColors.filter((d) => d.version == version)[0].color,
    },
  };

  var backwardsRing = {
    name: version,
    commit_date: commit.commit_date,
    itemStyle: {
      label: {
        show: false,
      },
    },
    itemStyle: {
      color: "#fff",
    },
    children: [],
  };
  commit_time.children.push(backwardsRing);

  if (semver.valid(version) && semver.valid(previous_version)) {
    if (previous_version) {
      var ver_diff = semver.diff(previous_version, version);

      // console.log(previous_version, "-->", version, ver_diff);
      // if minore version
      if (ver_diff == "minor") {
        commit_version.itemStyle.color = "hsl(56, 91%, 68%)";
      }
      if (ver_diff == "preminor") {
        commit_version.itemStyle.color = `hsl(56, 74%, 84%)`;
      }
      // if major version
      if (ver_diff == "major") {
        // change color to light red
        commit_version.itemStyle.color = `hsl(3, 79%, 40%)`;
      }
      if (ver_diff == "premajor") {
        commit_version.itemStyle.color = `hsl(3, 55%, 69%)`;
      }
      // if patch version
      if (ver_diff == "patch") {
        // change color to  yellow
        commit_version.itemStyle.color = `hsl(102, 84%, 75%)`;
      }

      if (ver_diff == "prepatch") {
        commit_version.itemStyle.color = `hsl(102, 51%, 90%)`;
      }

      if (semver.gt(previous_version, version)) {
        console.log("gt", previous_version, " > ", version);
        backwardsRing.itemStyle.color = versionColors.filter(
          (d) => d.version == version
        )[0].color;
      }

      // if the versions are equal
      // if (!ver_diff) {
      // change color to white

      // }
    }
  }

  backwardsRing.children.push(commit_version);

  var breaking = {
    name: "breaking",
    itemStyle: {
      color: "#B30000",
    },
    commit_date: commit.commit_date,
    collapsed: true,
    children: [],
  };

  var total_changes = 0;
  var breakingChanges = breakings.find((d) => d.hash == commit.hash);
  if (breakingChanges?.breaking.length > 0) {
    // console.log(breakingChanges.breaking);
    total_changes += breakingChanges.breaking.length;
    breaking.value = breakingChanges.breaking.length;

    // breaking.name = "Breaking Changes";

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
  }

  var non_breaking = {
    name: "non-breaking",
    itemStyle: {
      color: "#90EE90",
    },
    commit_date: commit.commit_date,

    children: [],
    // value: 1,
  };

  var non_breaking_changes_arr = non_breakings.find(
    (d) => d.hash == commit.hash
  );
  if (non_breaking_changes_arr) {
    // number of non breaking changes
    // console.log(non_breaking_changes_arr);
    var non_breaking_changes = Object.values(
      non_breaking_changes_arr.nonBreakingChanges
    ).reduce((a, b) => a + b, 0);
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

    if (non_breaking_changes_data.length > 0) {
      commit_version.children.push(non_breaking);
    }

    total_changes += non_breaking_changes;
  }

  // if (total_changes > 0) {
  commit_version.value = total_changes;
  // commit_version.name += " (" + total_changes + ")";
  // console.log(commit_version.name, total_changes);
  // }
  return;
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

export async function generateChangesViz(path, format) {
  path = join(path, ".previous_versions");
  var data = [];
  var commits = fs.readFileSync(join(path, ".api_commits.json"));
  commits = JSON.parse(commits);

  // sort the commits by date
  commits.sort((a, b) => {
    return new Date(a.commit_date) - new Date(b.commit_date);
  });

  var breakings = fs.readFileSync(join(path, ".breaking.json"));
  breakings = JSON.parse(breakings);

  var nonBreaking = fs.readFileSync(join(path, ".non-breaking.json"));
  nonBreaking = JSON.parse(nonBreaking);

  var years = commits.map((commit) => {
    // parse the date
    commit.commit_date = new Date(commit.commit_date);
    return commit.commit_date.getFullYear();
  });

  // sort the years
  years.sort((a, b) => {
    return a - b;
  });

  var versions = commits.map(async (commit) => {
    return (
      await SwaggerParser.parse(
        join(path, commit.hash + "." + commit.fileExtension)
      )
    ).info.version;
  });

  versions = await Promise.all(versions);

  // check is anny of the vrsions use semver
  var isSemver =
    versions.filter((version) => {
      return semver.valid(version);
    }).length > 0;

  var versionColors = generateUniqueColors([...new Set(versions)]);

  // get the unique years
  years = [...new Set(years)];

  var colors = generateGrayGradient(years.length);
  // assign a color to each year
  var color_dict = {};
  years.forEach((year, index) => {
    color_dict[year] = colors[index];
  });

  var i = 0;

  var nextCommit = async function (commit) {
    var previous_version = null;
    try {
      if (i > 0) {
        var previous_content = await SwaggerParser.parse(
          join(path, commits[i - 1].hash + "." + commit.fileExtension)
        );
        previous_version = previous_content.info.version;
      }

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
        content,
        // isSemver,
        false,
        versionColors
      );
    } catch (e) {
      // console.log(e)
    }
    i = i + 1;
    if (i < commits.length) {
      return await nextCommit(commits[i]);
    } else {
      let chartOptions = {
        tooltip: {
          trigger: "item",
          triggerOn: "mousemove",
          formatter: function (params) {
            return params.data.name + "  (value: " + params.data.value + ")";
          },
        },
        series: {
          center: ["50%", "50%"],
          radius: ["5%", "85%"],
          type: "sunburst",
          data: data,
          sort: undefined,
        },
      };

      // console.log(JSON.stringify(data, null, 2));
      fs.writeFileSync(join(path, ".test-options.json"), JSON.stringify(chartOptions, null, 2));
      // levelsConfig(isSemver, chartOptions);
      levelsConfig(false, chartOptions);
      fs.writeFileSync(
        join(path, ".sunburst-source.json"),
        JSON.stringify(chartOptions, null, 2)
      );

      renderSunburst(chartOptions, format, path);
      return chartOptions;
    }
  };

  await nextCommit(commits[i]);
}
function renderSunburst(chartOptions, format, path) {
  if (format == "html" || !format) {
    chartOptions.series.sort = null;
    chartOptions.toolbox = {
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
      },
    };

    fs.writeFileSync(
      join(path, ".sunburst.ejs"),
      `<!DOCTYPE html>
      <html>
      <head>
        <title>API Channges vs. API versioning</title>
        <style>
          /* Add any custom CSS styles here */
        </style>
      </head>
      <body>
        <div id="chartContainer" style="height: 100vh"></div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/4.1.0/echarts.min.js"></script>
        <script>
                  // Initialize ECharts chart with the container element
                  var chartContainer = document.getElementById('chartContainer');
                  var chart = echarts.init(chartContainer);
                  var chartOptions = <%-JSON.stringify(JSON.parse(JSON.stringify(chartOptions))) %>;
                  chart.setOption(chartOptions);

                  chart.setOption(chartOptions);
                  window.addEventListener('resize', function() {
                    chart.resize();
                  });
         </script>
      </body>
      </html>`
    );
    // if (format == "html") {
    var template = fs.readFileSync(
      join(path, ".sunburst.ejs"),
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
      format: format,
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
    // console log link to the output html file
    console.log(
      chalk.greenBright.underline.bold(
        "|- Output Visualization saved as: ",
        join(path, "..", "apivol-outputs", "sunburst.html")
      )
    );
    open(join(path, "..", "apivol-outputs", "sunburst.html"));
  }

  // PNG output
  if (format == "png") {
    const canvas = createCanvas(800, 800);
    // ECharts can use the Canvas instance created by node-canvas as a container directly
    const chart = echarts.init(canvas);
    chart.setOption(chartOptions);
    // render then  as png with good quality with high pixel density and white background
    const buffer = canvas.toBuffer("image/png", {
      compressionLevel: 9,
      filters: canvas.PNG_FILTER_NONE,
      resolution: 900,
      background: "#ffffff",
    });

    if (!fs.existsSync(join(path, "..", "apivol-outputs"))) {
      fs.mkdirSync(join(path, "..", "apivol-outputs"), { recursive: true });
    }
    fs.writeFileSync(
      join(path, "..", "apivol-outputs", "sunburst.png"),
      buffer
    );

    console.log(
      chalk.greenBright.underline.bold(
        "|- Output Visualization saved as: " +
          join(path, "..", "apivol-outputs", "sunburst.png")
      )
    );

    // open(join(path, "..", "apivol-outputs", "sunburst.png"));
  }

  // SVG output
  if (format == "svg") {
    const chart = echarts.init(null, null, {
      renderer: "svg", // must use SVG rendering mode
      ssr: true, // enable SSR
      width: 500, // need to specify height and width
      height: 500,
    });

    chart.setOption(chartOptions);
    const svgStr = chart.renderToSVGString();
    fs.writeFileSync(
      join(path, "..", "apivol-outputs", "sunburst.svg"),
      svgStr,
      "utf8",
      (err) => {
        if (err) {
          console.error("Error saving output:", err);
        } else {
          console.log("Output saved as", { outputPath });
        }
      }
    );
    console.log(
      chalk.greenBright.underline.bold(
        "|- Output Visualization saved as: " +
          join(path, "..", "apivol-outputs", "sunburst.svg")
      )
    );
    // exit process
    process.exit(0);
    // open(join(path, "..", "apivol-outputs", "sunburst.svg"));
  }

  return;
}

function levelsConfig(semver, options) {
  if (semver) {
    options.series.levels = [
      // CENTER
      {},
      // YEAR LEVEL
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
      // MONTH LEVEL
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
      // DAY LEVEL
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
      // TIMESTAMP LEVEL
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
      // semver ring
      {
        r0: "34%",
        r: "36%",
        label: {
          show: false,
          rotate: "tangential",
        },
      },
      // VERSION LEVEL
      {
        // reduce rings width
        r0: "36%",
        r: "44%",
        label: {
          color: "#000000",
          fontSize: 9,
        },
        itemStyle: {
          // shadow blur
          shadowBlur: 1,
          // shadow color grey
          shadowColor: "rgba(0, 0, 0, 0.5)",
        },
      },
      // CHANGES LEVEL
      {
        r0: "44%",
        r: "46%",
        itemStyle: {
          borderWidth: 1,
        },
        label: {
          show: false,
          rotate: "tangential",
        },
      },
      // BREAKING / NON BREAKING LEVEL
      {
        r0: "46%",
        r: "47%",
        label: {
          position: "outside",
          padding: 0,
          silent: false,
          fontSize: 11,
          color: "#000000",
          // fontWeight: "bold",
        },
        itemStyle: {
          borderWidth: 2,
        },
      },
    ];
  } else {
    options.series.levels = [
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
          minAngle: 10,
        },
      },
      {
        r0: "35%",
        r: "36%",
        label: {
          show: false,
        },
      },
      {
        // reduce rings width
        r0: "37%",
        r: "50%",
        label: {
          color: "#000000",
          fontSize: 9,
          minAngle: 12,
        },
        itemStyle: {
          // shadow blur
          shadowBlur: 1,
          // shadow color grey
          shadowColor: "rgba(0, 0, 0, 0.5)",
        },
      },
      {
        r0: "50%",
        r: "52%",
        itemStyle: {
          borderWidth: 1,
        },
        label: {
          show: false,
          rotate: "tangential",
          minAngle: 12,
        },
      },

      {
        r0: "52%",
        r: "53%",
        label: {
          position: "outside",
          padding: 0,
          silent: false,
          fontSize: 11,
          color: "#000000",
          minAngle: 12,
          // fontWeight: "bold",
        },
        itemStyle: {
          borderWidth: 2,
        },
      },
    ];
  }
}

function generateUniqueColors(versions) {
  console.log(`|- API Versions: ${versions.length}`);
  const hueStep = 360 / versions.length;
  let hue = 0;
  return versions.map((version) => {
    const color = `hsl(${hue}, 50%, 50%)`;
    hue += hueStep;
    return { version, color };
  });
}
