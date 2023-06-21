import { colormap } from "./colormap.js";
import { computeFieldFrequency } from "./change_schema.js";
import chalk from "chalk";
import { join } from "path";
import fs from "fs";
import echarts from "echarts";
import ejs from "ejs";
import open from "open";

let MAP_MAX = 30000;
let MAP_STEPS = 50;

let modified_colors = colormap({
  colormap: [
    { index: 0, rgb: [73, 73, 205] },
    { index: 1, rgb: [73, 73, 255] },
  ],
  nshades: MAP_STEPS + 1,
  format: "hex",
  alpha: 1,
});

let added_colors = colormap({
  colormap: [
    { index: 0, rgb: [73, 205, 73] },
    { index: 1, rgb: [73, 255, 73] },
  ],
  nshades: MAP_STEPS + 1,
  format: "hex",
  alpha: 1,
});

let deleted_colors = colormap({
  colormap: [
    { index: 0, rgb: [205, 73, 73] },
    { index: 1, rgb: [255, 73, 73] },
  ],
  nshades: MAP_STEPS + 1,
  format: "hex",
  alpha: 1,
});

let grays = colormap({
  colormap: [
    { index: 0, rgb: [0, 0, 0] },
    { index: 1, rgb: [200, 200, 200] },
  ],
  nshades: MAP_STEPS + 1,
  format: "hex",
  alpha: 1,
});

export function filterByFrequency(data, f) {
  var newData = Object.assign({}, data);
  newData.children = newData.children.filter((d) => d["value"] > f);
  newData.children = newData.children.map((d) => {
    d["value"] = d["value"];
    delete d["value"];
    if (d.children) {
      d.children = filterByFrequency(d, f);
    } else delete d.children;
    return d;
  });
  return newData;
}

function pick_color(map, value, data) {
  MAP_MAX = getMaxValue(data);
  let index = Math.round(MAP_STEPS * (value / MAP_MAX));
  if (index >= map.length) {
    index = map.length - 1;
  }
  return map[index];
}

export function getMaxValue(data) {
  let max = 0;

  function traverse(data) {
    if (data.children && Array.isArray(data.children)) {
      data.children.forEach(traverse);
    }

    if (data.value > max) max = data.value;
  }

  traverse({ children: data });

  return max;
}

function convert(o, f, data) {
  // labels
  o.label = {};

  o.label = {
    minAngle: 11,
  };

  if (o.name.length > 6) {
    o.label = {
      minAngle: 12,
      fontSize: 10,
    };
  }

  if (o.name.length > 9) {
    o.label = {
      minAngle: 12,
      fontSize: 9,
    };
  }

  if (o.name.length > 15) {
    o.label = {
      minAngle: 12,
      // fontSize: 9,
      show: false,
    };
  }

  // formattr for the name that have more than 10 characters
  //replace the action with the color
  if (o.name == "modified" || o.name == "mediaTypeModified") {
    o.itemStyle = {
      color: "#4949CD", //
      // color: pick_color(modified_colors, o["value"]), //'#4949CD'
      //  lower opacity for the modified
      opacity: 0.5,
      // border style
      borderColor: "#fff",
      borderWidth: 4,
    };

    o.name = "modified";
    o.label = {
      show: false,
    };
  } else if (o.name == "added" || o.name == "mediaTypeAdded") {
    o.itemStyle = {
      // color: "#49CD49", //
      color: pick_color(added_colors, o["value"]), //
      opacity: 0.5,
      borderColor: "#fff",
      borderWidth: 4,
    };
    o.name = "added";
    o.label = {
      show: false,
    };
  } else if (o.name == "deleted" || o.name == "mediaTypeDeleted") {
    o.itemStyle = {
      // color: "#CD4949",
      color: pick_color(deleted_colors, o["value"]), //
      opacity: 0.5,
      borderColor: "#fff",
      borderWidth: 4,
    };
    o.name = "deleted";
    o.label = {
      show: false,
    };
  } else {
    
    if (!o.itemStyle)
      o.itemStyle = {
        color: "#000", // pick_color(grays, o["value"], data),
      };
    if (
      ["get", "post", "put", "delete", "patch", "head", "options"].includes(
        o.name.toLowerCase()
      )
    ) {
      o.itemStyle = {
        color: color(o.name.toLowerCase()),
      };
    }
  }

  //////////////

  if (o.name == "servers") {
    if (o.children) {
      o.children.map((c) => {
        c.children = [];
      });
    }
    o.itemStyle = {
      color: "#C8C8C8",
    };
  }

  if (o.name == "version") {
    o.itemStyle = {
      color: "#C8C8C8",
    };
  }

  if (o.name == "summary") {
    o.itemStyle = {
      color: "#C8C8C8",
    };
  }

  if (o.name == "tags") {
    o.itemStyle = {
      color: "#C8C8C8",
    };
  }

  if (o.name == "contact") {
    o.itemStyle = {
      color: "#C8C8C8",
    };
  }

  if (o.name == "responses") {
    o.formatter = function (params) {
      return "resp";
    };
  }

  if (o.children != undefined) {
    if (o.children.length == 0 || o["value"] < f) {
      delete o.children;
    } else {
      o.children.map((c) => convert(c, f, data));
    }
  }

  if (o.children == undefined) {
    if (o["value"] == undefined) {
      o["value"] = 0;
    }
  } else {
    o["value"] = o.children.reduce((a, c) => a + c["value"] || 0, 0);
  }

  if (o.name == "securityRequirements") {
    o.name = "securityReq";
  }

  if (o.name == "OPTIONS") {
    o.name = "OPT";
  }

  if (o.name == "description") {
    o.name = "desc";
    o.itemStyle = {
      // grey color
      color: "#C8C8C8",
    };
  }

  if (o.name == "info") {
    o.itemStyle = {
      color: "#C8C8C8",
    };
  }

  if (o.name == "parameters") {
    o.name = "params";
  }

  return o;
}

export function createTree(data, f) {
  MAP_MAX = getMaxValue(data);
  if (f) data = filterByFrequency(data, f);
  // console.log(data.children);

  data = data.children.filter(
    (e) =>
      e["name"] != "e" &&
      e["name"] != "openAPI" &&
      e["name"] != "tags" &&
      e["name"] != "externalDocs" &&
      e["name"] != "endpoints" &&
      e["name"] != "components"
  );

  // console.log(data);

  data = data.map((e) => convert(e, f, data));

  let option = {
    // make chart responsive

    grid: {
      width: "110%",
    },
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
      formatter: function (params) {
        // show name and value
        return params.data.name + ": " + params.data.value;
      },
    },

    calculable: false,
    series: {
      // root color
      color: "#fff",
      roam: true,
      center: ["50%", "50%"],
      radius: ["5%", "85%"],
      type: "sunburst",
      data: data,

      label: {
        overflow: "truncate",
        ellipsis: true,
        rotate: "tangential",
      },
      labelLayout: {
        hideOverlap: true,
      },
    },
  };

  return option;
}

export async function renderTree(path, f, format, aggr, oaspath,output) {
  path = join(path, ".previous_versions", oaspath.split(".")[0] );
  var diffs = fs.readFileSync(join(path, ".diffs.json"), "utf8");
  diffs = JSON.parse(diffs);
  var changes_frequency = computeFieldFrequency(diffs, path, aggr);
  fs.writeFileSync(
    join(path, ".changes_frequency.json"),
    JSON.stringify(changes_frequency)
  );

  var chartOptions = createTree(changes_frequency, f);

  if (format == "html" || !format || format == "echarts") {
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
      join(path, ".changes-visualization.ejs"),
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
                  window.addEventListener('resize', function() {
                    chart.resize();
                  });
                 
         </script>
      </body>
      </html>`
    );
    // if (format == "html") {
    var template = fs.readFileSync(
      join(path, ".changes-visualization.ejs"),
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
      join(path, "..", "apivol-outputs", "changes-visualization.html"),
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
        join(path, "..", "apivol-outputs", "changes-visualization.html")
      )
    );
    // open(join(path, "..", "apivol-outputs", "changes-visualization.html"));
    return chartOptions;
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
      join(path, "..", "apivol-outputs", "changes-visualization.png"),
      buffer
    );

    console.log(
      chalk.greenBright.underline.bold(
        "|- Output Visualization saved as: " +
          join(path, "..", "apivol-outputs", "changes-visualization.png")
      )
    );

    // open(join(path, "..", "apivol-outputs", "changes-visualization.png"));
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
      join(path, "..", "apivol-outputs", "changes-visualization.svg"),
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
          join(path, "..", "apivol-outputs", "changes-visualization.svg")
      )
    );
    // exit process
    process.exit(0);
    // open(join(path, "..", "apivol-outputs", "changes-visualization.svg"));
  }
}

function formatBreakingChanges(path) {
  var breaking = fs.readFileSync(join(path, ".breaking.json"));
  breaking = JSON.parse(breaking)
    .map((diff) => {
      return {
        breaking: diff.breaking,
        commit_date: new Date(diff.commit_date),
      };
    })
    .flat(1);

  // in the case where many changes are starting by "api-path-removed" and they have the same path , we merge them and count how many changes are in the same path and aggregate the 'operation' field in an array
  var mergedBreaking = [];
  var merged = false;
  breaking.forEach((element) => {
    merged = false;
    mergedBreaking.forEach((mergedElement) => {
      if (
        element.path === mergedElement.path &&
        element.code === mergedElement.code
      ) {
        mergedElement.count++;
        if (!mergedElement.operation.includes(element.operation))
          mergedElement.operation.push(element.operation);
        merged = true;
      }
    });
    if (!merged) {
      element.count = 1;
      element.operation = [element.operation];
      mergedBreaking.push(element);
    }
  });

  return mergedBreaking;
}

function color(method) {
  switch (method) {
    case "get":
      return "#0AA40D";
    case "post":
      return "#F3C142";
    case "put":
      return "#6dc0e3";
    case "delete":
      return "#FF0000";
    case "patch":
      return "#d6c9d4";
    case "options":
      return "#d6c9d4";
    case "head":
      return "#d6c9d4";
    case "trace":
      return "#d6c9d4";
    case "connect":
      return "#0000ff";
    case "any":
      return "#fff";
  }
  return "#000000";
}
