export function computeFieldFrequency(jsonArray, path, aggregate) {
  jsonArray = jsonArray
    .map((diff) => {
      return diff.diff;
    })
    .filter((diff) => diff);

  if (aggregate) {
    jsonArray.forEach((diff) => {
      mergeModification(diff.paths);
    });
  }

  jsonArray = jsonArray.map((diff) => {
    return { paths: diff.paths, info: diff.info, endpoints: diff.endpoints, tags:diff.tags };
  });

  const frequencyMap = {};

  function processObject(obj, parentKey = "") {
    if (Array.isArray(obj) && typeof obj[0] === "string") {
      if (!aggregate) {
        obj.forEach((element) => {
          const field = parentKey ? `${parentKey}.${element}` : element;
          if (!frequencyMap[field]) {
            frequencyMap[field] = {
              name: element,
              value: 0,
              children: [],
            };
          }
          frequencyMap[field].value++;
        });
      }
    } else if (Array.isArray(obj) && typeof obj[0] === "object" && !aggregate) {
      if (
        Object.keys(obj[0]).includes("method") &&
        Object.keys(obj[0]).includes("path")
      )
        for (let i = 0; i < obj.length; i++) {
          const field = `paths.${parentKey.split(".").slice(-1)[0]}.${
            obj[i].path
          }.${obj[i].method}`;
          if (!frequencyMap[field]) {
            frequencyMap[field] = {
              name: obj[i].method,
              value: 0,
              children: [],
            };

            frequencyMap[field].value++;
          }
        }
    } else {
      for (const key in obj) {
        if (key !== "from" && key !== "to" ) {
          const field = parentKey ? `${parentKey}.${key}` : key;

          if (!frequencyMap[field]) {
            frequencyMap[field] = {
              name: key,
              value: 0,
              children: [],
            };
          }
          frequencyMap[field].value++;

          if (typeof obj[key] === "object" && obj[key] !== null) {
            processObject(obj[key], field);
          }
        }
      }
    }
  }

  jsonArray.forEach((jsonObj) => {
    processObject(jsonObj);
  });

  const root = {
    name: "root",
    value: jsonArray.length,
    children: [],
  };

  for (const field in frequencyMap) {
    const parts = field.split(".");
    let current = root;
    let path = "";
    // if (parts.length > 0)
      for (let i = 0; i < parts.length; i++) {
        path += parts[i];
        let child = current.children.find((c) => c.name === parts[i]);
        if (!child) {
          child = {
            name: parts[i],
            value: 0,
            children: [],
          };

          if (field.includes("schema")) {
            child.itemStyle = {
              color: "#A0522D",
            };
          }
          if (
            field.includes("info.") ||
            field.includes("tags.")||
            parts[i] == "description" ||
            parts[i] == "info" ||
            parts[i] == "summary" ||
            parts[i].toLocaleLowerCase() == "operationid" ||
            parts[i] == "tags"
          ) {
            child.itemStyle = {
              color: "#C8C8C8",
            };
          }

          // if (current.name !== "added" && current.name !== "deleted") {
          current.children.push(child);
        }
        current = child;
        if (i < parts.length - 1) {
          path += ".";
        }
      }
    current.value = frequencyMap[field].value;
  }

  return root;
}

function mergeModification(element, breaking) {
  if (element) {
    if (element.modified) {
      var modifcations = Object.values(element.modified);

      var mergedModifications = {};

      modifcations.forEach((modification) => {
        modification
          ? Object.keys(modification).forEach((key) => {
              // apply recursively to sub elements
              if (typeof modification[key] === "object") {
                // merge object under the same key
                if (mergedModifications[key]) {
                  mergeModification({
                    modified: [mergedModifications[key], modification[key]],
                  });
                }
                // add object under the same key
                else {
                  mergedModifications[key] = modification[key];
                }
              }
            })
          : null;
      });

      element.modified = mergedModifications;
    } else if (element.added) {
      var added = Object.values(element.added);

      var mergedAdded = {};

      added.forEach((add) => {
        Object.keys(add).forEach((key) => {
          // apply recursively to sub elements
          if (typeof add[key] === "object") {
            // merge object under the same key
            if (mergedAdded[key]) {
              mergeModification({
                added: [mergedAdded[key], add[key]],
              });
            }
            // add object under the same key
            else {
              mergedAdded[key] = add[key];
            }
          }
        });
      });

      element.added = mergedAdded;

      // deleted
    } else if (element.deleted) {
      var deleted = Object.values(element.deleted);
      // console.log(deleted);
      // merge all modifications
      var mergedDeleted = {};

      deleted.forEach((del) => {
        Object.keys(del).forEach((key) => {
          // apply recursively to sub elements
          if (typeof del[key] === "object") {
            // merge object under the same key
            if (mergedDeleted[key]) {
              mergeModification({
                deleted: [mergedDeleted[key], del[key]],
              });
            }
            // add object under the same key
            else {
              mergedDeleted[key] = del[key];
            }
          }
        });
      });

      element.deleted = mergedDeleted;
    }
  } else return;
}
