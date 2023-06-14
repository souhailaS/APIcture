export function computeFieldFrequency(jsonArray) {
  jsonArray = jsonArray
    .map((diff) => {
      return diff.diff;
    })
    .filter((diff) => diff);

  jsonArray.forEach((diff) => {
    mergeModification(diff.paths);
  });

  const frequencyMap = {};

  function processObject(obj, parentKey = "") {
    for (const key in obj) {
      if (key !== "from" && key !== "to" && key !== "tags") {
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
    for (let i = 0; i < parts.length; i++) {
      path += parts[i];
      let child = current.children.find((c) => c.name === parts[i]);
      if (!child) {
        child = {
          name: parts[i],
          value: 0,
          children: [],
        };
        if(current.name !== "added" && current.name !== "deleted") {
        current.children.push(child);}
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

function mergeModification(element) {
  if (element) {
    if (element.modified) {
      // console.log("modifications");
      var modifcations = Object.values(element.modified);
      // console.log(modifcations);
      // merge all modifications
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
