export function renderMetrics(metrics,options){
console.log(metrics)
}


// console.log("metrics-evolution.js: loading");
var load_metrics = function (api_id) {
 

    console.log("metrics-evolution.js: api_id: " + "6462");
    if (api_id != "ALL APIs" && api_id != "") {
      console.log("fetching api_id: " + api_id);
      var myChart = echarts.init(document.getElementById("metrics-echart"));
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
      myChart.showLoading();
  
      var myChart2 = echarts.init(document.getElementById("parameters-echart"));
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
      myChart2.showLoading();
  
      var myChart3 = echarts.init(document.getElementById("methods-echart"));
      // creat a stacked bar chart for methods every year  shwing how many get post put delete patch options head trace every year
  
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
  
      myChart3.showLoading();
  
      var myChart4 = echarts.init(document.getElementById("schema-echart"));
      // line chart for schemas and properties over time
      // schemas, properties and distinct_properties over time
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
  
      myChart4.showLoading();
  
      // create radar chart
      var myChart5 = echarts.init(document.getElementById("radar-echart"));
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
  
      myChart5.showLoading();
  
      // creat bar chart for number of methods affected by breaking changes
      var myChart6 = echarts.init(document.getElementById("methods-breaking"));
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
  
      myChart6.showLoading();
  
      fetch(`/metrics/evolution-metrics/${api_id}`)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
  
          option.xAxis.data = data.map((d) => d.commit_date);
          option.series[0].data = data.map((d) => d.structureSize.paths);
          option.series[1].data = data.map((d) => d.structureSize.operations);
  
          myChart.hideLoading();
          myChart.setOption(option);
  
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
  
          myChart2.hideLoading();
          myChart2.setOption(option2);
  
          console.log(data);
          option3.xAxis.data = data.map((d) => d.commit_date);
          option3.series[0].data = data.map((d) => d.structureSize.methods.get);
          option3.series[1].data = data.map((d) => d.structureSize.methods.post);
          option3.series[2].data = data.map((d) => d.structureSize.methods.put);
          option3.series[3].data = data.map(
            (d) => d.structureSize.methods.delete
          );
          option3.series[4].data = data.map((d) => d.structureSize.methods.patch);
          option3.series[5].data = data.map(
            (d) => d.structureSize.methods.options
          );
          option3.series[6].data = data.map((d) => d.structureSize.methods.head);
          option3.series[7].data = data.map((d) => d.structureSize.methods.trace);
  
          myChart3.hideLoading();
          myChart3.setOption(option3);
  
          option4.xAxis.data = data.map((d) => d.commit_date);
          option4.series[0].data = data.map((d) => d.schemaSize.schemas);
  
          option4.series[1].data = data.map((d) => d.schemaSize.properties);
  
          option4.series[2].data = data.map(
            (d) => d.schemaSize.distinct_properties.length
          );
  
          myChart4.hideLoading();
          myChart4.setOption(option4);
  
          var indicators =
            //   [
            //     ...new Set(
            data
              .map((d) => d.diff_2)
              .filter((a) => a)
              .flat(1)
              .map((d) => d.id);
          // ),
          //   ];
          var count = {};
          indicators.forEach(function (i) {
            count[i] = (count[i] || 0) + 1;
          });
          console.log(count);
          option5.radar.indicator = Object.keys(count).map((d) => {
            return { name: d, max: Object.values(count).reduce((a, b) => a + b) };
          });
          option5.series[0].data[0].value = Object.values(count);
          option5.series[0].data[0].name = "Breaking Changes";
          myChart5.hideLoading();
          myChart5.setOption(option5);
  
          console.log(option5);
  
          // methods affected by breaking changes
          var methods = data
            .map((d) => d.diff_2)
            .filter((a) => a)
            .flat(1)
            .map((d) => d.operation.toLowerCase());
  
          var count = {};
          methods.forEach(function (i) {
            count[i] = (count[i] || 0) + 1;
          });
          console.log(count);
  
          console.log(option6);
  
          Object.keys(count).forEach((d) => {
            option6.series.find((e) => e.name == d).data.push(count[d]);
          });
  
          myChart6.hideLoading();
          myChart6.setOption(option6);
        });
    }
  };
  
  
