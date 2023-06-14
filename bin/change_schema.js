export function computeFieldFrequency(jsonArray) {
  jsonArray = jsonArray
    .map((diff) => {
      return diff.diff;
    })
    .filter((diff) => diff);

  const frequencyMap = {};

  function processObject(obj, parentKey = "") {
    for (const key in obj) {
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


