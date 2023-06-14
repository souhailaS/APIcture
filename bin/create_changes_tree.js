import {colormap} from "./colormap.js";
import { computeFieldFrequency } from "./change_schema.js";
import chalk from "chalk";
import { join } from "path";
import fs from "fs";

let MAP_MAX = 30000;
let MAP_STEPS = 200;

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

function pick_color(map, value) {
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

function convert(o, f) {
  // formattr for the name that have more than 10 characters
  if (o.name.length > 10) {
    o.label = {
      formatter: function (params) {
        return params.name.slice(0, 10) + "...";
      },
    };
  }
  if (o.name == "servers") {
    if (o.children) {
      o.children.map((c) => {
        c.children = [];
      });
    }
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
      o.children.map((c) => convert(c, f));
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
  }

  if (o.name == "parameters") {
    o.name = "params";
  }

  o.label = {
    minAngle: 15,
  };

  //replace the action with the color
  if (o.name == "modified" || o.name == "mediaTypeModified") {
    o.itemStyle = {
      color: pick_color(modified_colors, o["value"]), //'#4949CD'
    };
    o.name = "modified";
    o.label = {
      show: false,
    };
  } else if (o.name == "added" || o.name == "mediaTypeAdded") {
    o.itemStyle = {
      color: pick_color(added_colors, o["value"]), //'#49CD49'
    };
    o.name = "added";
    o.label = {
      show: false,
    };
  } else if (o.name == "deleted" || o.name == "mediaTypeDeleted") {
    o.itemStyle = {
      color: pick_color(deleted_colors, o["value"]), //'#CD4949'
    };
    o.name = "deleted";
    o.label = {
      show: false,
    };
  } else {
    o.itemStyle = {
      color: pick_color(grays, o["value"]),
    };
  }

  return o;
}

export function createTree(data, f) {
  // MAP_MAX = getMaxValue(d);
  // console.log(MAP_MAX);
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

  data = data.map((e) => convert(e, f));


  let option = {
    grid: {
      width: "100%",
    },
    toolbox: {
      orient: "horizontal",
      show: true,
      itemSize: 17,
      itemGap: 15,
      feature: {
        saveAsImage: {
          show: true,
          title: "Save as PNG",
          pixelRatio: 2.5,
        },
        restore: {
          show: true,
          title: "Restore",
        },
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
        rotate: "tangential",
      },
      labelLayout: {
        hideOverlap: true,
      },
    },
  };

  return option;
}

export async function renderTree(path, f) {
  path = join(path, ".previous_versions");
  var diffs = fs.readFileSync(join(path, ".diffs.json"), "utf8");
  diffs = JSON.parse(diffs);
  var changes_frequency = computeFieldFrequency(diffs);
  // console.log(changes_frequency);
  var tree = createTree(changes_frequency, f);
  console.log(tree);
}
