import { writeFileSync } from "fs";
import { MongoClient } from "mongodb";
import semver, { sort } from "semver";
import path, { join } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createSunburst(
  commit,
  data,
  previous_version,
  color_dict,
  breakings
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

  var version = commit.content.info.version;

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
  var breakingChanges = breakings.find((d) => d.sha == commit.sha);
  if (breakingChanges.length > 0) {
    total_changes += breakingChanges.length;
    breaking.value = breakingChanges.length;

    // breaking.name = "Breaking Changes";

    try {
      breakingChanges.forEach((diff) => {
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

  if (commit.nonBreakingChanges) {
    // number of non breaking changes
    var non_breaking_changes = Object.values(commit.nonBreakingChanges).reduce(
      (a, b) => a + b,
      0
    );

    non_breaking.value = non_breaking_changes;

    // filter the non breaking changes
    var non_breaking_changes_data = Object.entries(
      commit.nonBreakingChanges
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

async function main(path) {
  var commits = fs.readFileSync(join(path, ".commits.json"));
  commits = JSON.parse(commits);

  var breakings = fs.readFileSync(join(path, ".breakings.json"));
  breakings = JSON.parse(breakings);

  var years = commits.map((commit) => {
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
      previous_version = commits[i - 1].content.info.version;
    }
    i = i + 1;
    await createSunburst(commit, data, previous_version, color_dict);
    if (i < commits.length) {
      return await nextCommit(commits[i]);
    } else {
      console.log(data);
      return data;
    }
  };

  await nextCommit(commits[i]);
}
