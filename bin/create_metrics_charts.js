import fs from "fs";
import { join } from "path";
import ejs from "ejs";

var ejsTemp = `
<!DOCTYPE html>
<html>
  <head>
    <title>ECharts Chart</title>
    <style>
      /* Add any other custom CSS styles here */

        #structure-metrics {
            display: flex;
            flex-direction: row;
            justify-content: center;
        }
        
        #schema-metrics {
            display: flex;
            flex-direction: row;
            justify-content: center;
        }
    </style>
  </head>
  <body>
  <div id="metrics-container">
  <div id="metrcis-views-container">
    <div id="structure-metrics">
      <div
        id="metrics-echart"
        class="metrics-views-item"
        style="width: 33vw; height: 40vh"
      ></div>
      <div id="parameters-echart" style="width: 33vw; height: 40vh"></div>
      <div id="methods-echart" style="width: 33vw; height: 40vh"></div>
    </div>
    <div id="schema-metrics">
      <div id="schema-echart" style="width: 33vw; height: 40vh"></div>
      <div id="radar-echart" style="width: 46vw; height: 40vh"></div>
      <div id="methods-breaking" style="width: 33vw; height: 40vh"></div>
    </div>
  </div>
</div>
    <!-- import echart from online  -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.1.2/echarts.min.js"></script>
    <script>  
            if(<%=options.endpoints%> || <%=!usedOptions%>){
            var myChart = echarts.init(document.getElementById("metrics-echart"));
            var chartOptions1 = <%-JSON.stringify(JSON.parse(JSON.stringify(option))) %>;
            myChart.setOption(chartOptions1);   
            }
            if(<%=options.parameters%> || <%=!usedOptions%>){
            var myChart2 = echarts.init(document.getElementById("parameters-echart"));
            var chartOptions2 = <%-JSON.stringify(JSON.parse(JSON.stringify(option2))) %>;
            myChart2.setOption(chartOptions2);
            }
            if(<%=options.methods%> || <%=!usedOptions%>){
            var myChart3 = echarts.init(document.getElementById("methods-echart"));
            var chartOptions3 = <%-JSON.stringify(JSON.parse(JSON.stringify(option3))) %>;
            myChart3.setOption(chartOptions3);
            }
            if(<%=options.datamodel%> || <%=!usedOptions%>){
            var myChart4 = echarts.init(document.getElementById("schema-echart"));
            var chartOptions4 = <%-JSON.stringify(JSON.parse(JSON.stringify(option4))) %>;
            myChart4.setOption(chartOptions4);
            }
            if(<%=options.breakingChanges%>|| <%=!usedOptions%>){
            var myChart5 = echarts.init(document.getElementById("radar-echart"));
            var chartOptions5 = <%-JSON.stringify(JSON.parse(JSON.stringify(option5))) %>;
            myChart5.setOption(chartOptions5);
            }
            if(<%=options.breakingMethods%> || <%=!usedOptions%>){
            var myChart6 = echarts.init(document.getElementById("methods-breaking"));
            var chartOptions6 = <%-JSON.stringify(JSON.parse(JSON.stringify(option6))) %>;
            myChart6.setOption(chartOptions6);
            }
    </script>
  </body>
</html>
`;

export function renderMetrics(data, path, options, format, usedOptions) {
  // save the html file
  fs.writeFileSync(join(path, ".previous_versions", "metrics.ejs"), ejsTemp);
  // ENDPOINTS METRICS
  //   if (options.endpoints || !options) {
  var option = {
    title: {
      text: "Evolution of API structure size metrics",
      subtext: "paths and operations over time",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["paths", "operations"],
      bottom: 0,
    },
    toolbox: {
      show: true,
      feature: {
        dataZoom: {
          yAxisIndex: "none",
        },
        // dataView: { readOnly: false },
        magicType: { type: ["line", "bar"] },
        //restore: {},
        saveAsImage: {},
      },
    },
    xAxis: {
      type: "category",
      data: [],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "paths",
        type: "line",
        data: [],
      },
      {
        name: "operations",
        type: "line",
        data: [],
      },
    ],
  };

  option.xAxis.data = data.map((d) => d.commit_date);
  option.series[0].data = data.map((d) => d.structureSize.paths);
  option.series[1].data = data.map((d) => d.structureSize.operations);
  //   }
  // PARAMETERS METRICS
  //   if (options.parameters || !options) {
  var option2 = {
    title: {
      text: "Evolution of Size metrics",
      subtext: "Parameters over time",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: [
        "parametered_operations",
        "distinct_parameters",
        "parameters_per_operations",
        "used_parameters",
      ],
      bottom: 0,
    },
    toolbox: {
      show: true,
      feature: {
        dataZoom: {
          yAxisIndex: "none",
        },
        // dataView: { readOnly: false },
        magicType: { type: ["line", "bar"] },
        //restore: {},
        saveAsImage: {},
      },
    },
    xAxis: {
      type: "category",
      data: [],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "parametered_operations",
        type: "line",
        data: [],
      },
      {
        name: "distinct_parameters",
        type: "line",
        data: [],
      },
      {
        name: "parameters_per_operations",
        type: "line",
        data: [],
      },
      {
        name: "used_parameters",
        type: "line",
        data: [],
      },
    ],
  };
  option2.xAxis.data = data.map((d) => d.commit_date);
  option2.series[0].data = data.map(
    (d) => d.structureSize.parametered_operations
  );
  option2.series[1].data = data.map(
    (d) => d.structureSize.distinct_parameters.length
  );
  option2.series[2].data = data.map(
    (d) => d.structureSize.parameters_per_operations
  );
  option2.series[3].data = data.map(
    (d) => d.structureSize.used_parameters.length
  );
  //   }

  // METHODS METRICS
  //   if (options.methods || !options) {
  var option3 = {
    title: {
      text: "Evolution of API methods",
      subtext: "Methods over time",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: [
        "get",
        "post",
        "put",
        "delete",
        "patch",
        "options",
        "head",
        "trace",
      ],
      bottom: 0,
    },
    toolbox: {
      show: true,
      feature: {
        dataZoom: {
          yAxisIndex: "none",
        },
        // dataView: { readOnly: false },
        magicType: { type: ["line", "bar"] },
        //restore: {},
        saveAsImage: {},
      },
    },
    xAxis: {
      type: "category",
      data: [],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "get",
        type: "bar",
        stack: "methods",
        data: [],
      },
      {
        name: "post",
        type: "bar",
        stack: "methods",
        data: [],
      },
      {
        name: "put",
        type: "bar",
        stack: "methods",
        data: [],
      },
      {
        name: "delete",
        type: "bar",
        stack: "methods",
        data: [],
      },
      {
        name: "patch",
        type: "bar",
        stack: "methods",
        data: [],
      },
      {
        name: "options",
        type: "bar",
        stack: "methods",
        data: [],
      },
      {
        name: "head",
        type: "bar",
        stack: "methods",
        data: [],
      },
      {
        name: "trace",
        type: "bar",
        stack: "methods",
        data: [],
      },
    ],
  };

  option3.xAxis.data = data.map((d) => d.commit_date);
  option3.series[0].data = data.map((d) => d.structureSize.methods.get);
  option3.series[1].data = data.map((d) => d.structureSize.methods.post);
  option3.series[2].data = data.map((d) => d.structureSize.methods.put);
  option3.series[3].data = data.map((d) => d.structureSize.methods.delete);
  option3.series[4].data = data.map((d) => d.structureSize.methods.patch);
  option3.series[5].data = data.map((d) => d.structureSize.methods.options);
  option3.series[6].data = data.map((d) => d.structureSize.methods.head);
  option3.series[7].data = data.map((d) => d.structureSize.methods.trace);
  //   }

  // DATAMODEL METRICS
  //   if (options.datamodel || !options) {
  var option4 = {
    title: {
      text: "Evolution of API Datamodel",
      subtext: "Schemas and properties over time",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["schemas", "properties", "distinct_properties"],
      bottom: 0,
    },
    toolbox: {
      show: true,
      feature: {
        dataZoom: {
          yAxisIndex: "none",
        },
        // dataView: { readOnly: false },
        magicType: { type: ["line", "bar"] },
        //restore: {},
        saveAsImage: {},
      },
    },
    xAxis: {
      type: "category",
      data: [],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "schemas",
        type: "line",
        data: [],
      },
      {
        name: "properties",
        type: "line",
        data: [],
      },
      {
        name: "distinct_properties",
        type: "line",
        data: [],
      },
    ],
  };

  option4.xAxis.data = data.map((d) => d.commit_date);
  option4.series[0].data = data.map((d) => d.schemaSize.schemas);

  option4.series[1].data = data.map((d) => d.schemaSize.properties);

  option4.series[2].data = data.map(
    (d) => d.schemaSize.distinct_properties.length
  );
  //   }

  //   if (options.breakingchanges || !options) {
  var option5 = {
    title: {
      text: "Breaking Changes",
      subtext: "Radar chart",
    },
    tooltip: {},
    // legend: {
    //   data: ["Breaking Changes"],
    // },
    radar: {
      // shape: 'circle',
      name: {
        textStyle: {
          color: "#fff",
          backgroundColor: "#999",
          borderRadius: 2,
          padding: [2, 4],
        },
      },
      indicator: [
        // { name: "paths", max: 100 },
      ],
    },
    radius: "100%",
    series: [
      {
        name: "Breaking Changes",
        type: "radar",
        // areaStyle: {normal: {}},
        // size of radar chart
        data: [
          {
            value: [],
            name: "Breaking Changes",
          },
        ],
      },
    ],
  };
  //   }

  var breackingChanges = JSON.parse(
    fs.readFileSync(join(path, ".previous_versions", ".breaking.json"), "utf8")
  );

  var indicators =
    //   [
    //     ...new Set(
    breackingChanges
      .map((d) => d.breaking)
      .filter((a) => a.length > 0).flat(1)
     .map((d) => d.id);

      console.log(indicators);
  // ),
  //   ];
  var count = {};
  indicators.forEach(function (i) {
    count[i] = (count[i] || 0) + 1;
  });

  option5.radar.indicator = Object.keys(count).map((d) => {
    return { name: d, max: Object.values(count).reduce((a, b) => a + b) };
  });
  option5.series[0].data[0].value = Object.values(count);
  option5.series[0].data[0].name = "Breaking Changes";

  // creat bar chart for number of methods affected by breaking changes
  //   if (options.breakingMethods || !options) {
  var option6 = {
    title: {
      text: "Methods affected by breaking changes",
      // subtext: "Methods over time",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: [
        "get",
        "post",
        "put",
        "delete",
        "patch",
        "options",
        "head",
        "trace",
      ],
      bottom: 0,
    },
    toolbox: {
      show: true,
      feature: {
        dataZoom: {
          yAxisIndex: "none",
        },
        // dataView: { readOnly: false },
        magicType: { type: ["line", "bar"] },
        //restore: {},
        saveAsImage: {},
      },
    },
    xAxis: {
      type: "category",
      data: ["Methods"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "get",
        type: "bar",
        stack: "methods",
        data: [],
      },
      {
        name: "post",
        type: "bar",
        stack: "methods",
        data: [],
      },
      {
        name: "put",
        type: "bar",
        stack: "methods",
        data: [],
      },
      {
        name: "delete",
        type: "bar",
        stack: "methods",
        data: [],
      },
      {
        name: "patch",
        type: "bar",
        stack: "methods",
        data: [],
      },
      {
        name: "options",
        type: "bar",
        stack: "methods",
        data: [],
      },
      {
        name: "head",
        type: "bar",
        stack: "methods",
        data: [],
      },
      {
        name: "trace",
        type: "bar",
        stack: "methods",
        data: [],
      },
    ],
  };

  // methods affected by breaking changes
  var methods = breackingChanges
    .map((d) => d.breaking)
    .filter((a) => a)
    .flat(1)
    .map((d) => d.operation.toLowerCase());



  var count = {};
  methods.forEach(function (i) {
    count[i] = (count[i] || 0) + 1;
  });
  Object.keys(count).forEach((d) => {
    option6.series.find((e) => e.name == d).data.push(count[d]);
  });
  //   }

  // render charts options in ejs
  var template = fs.readFileSync(
    join(path, ".previous_versions", "metrics.ejs"),
    "utf8",
    (err, template) => {
      if (err) {
        console.error("Error reading template:", err);
        return;
      }
    }
  );

  var rendered = ejs.render(template, {
    options: options,
    usedOptions: usedOptions,
    option: option,
    option2: option2,
    option3: option3,
    option4: option4,
    option5: option5,
    option6: option6,
  });

  /// write rendered html to file
  if (!fs.existsSync(join(path, "apivol-outputs"))) {
    fs.mkdirSync(join(path, "apivol-outputs"), {
      recursive: true,
    });
  }

  console.log(
    "Writing metrics.html to",
    join(path, "apivol-outputs", "metrics.html")
  );

  fs.writeFileSync(
    join(path, "apivol-outputs", "metrics.html"),
    rendered,
    (err) => {
      if (err) throw err;
    }
  );
}
