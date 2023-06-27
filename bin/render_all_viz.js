import ejs from "ejs";
import fs from "fs";
import path from "path";
import { join } from "path";
import echarts from "echarts";

const HTML = `<!DOCTYPE html>
<html>
<head>
  <title>API Changes vs. API versioning</title>
  <!-- Latest compiled and minified CSS -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
  <!-- jQuery library -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js"></script>
  <!-- Latest compiled JavaScript -->
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
  <style>
    body {
      /* set font */
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      height: 100vh; 
    }
    .views-item {
      height: 600px;
      box-shadow: #bfc4c6 0px 0px 4px;
    }
    .versions {
      resize: both;
      overflow: auto;
  } 
  .changes {
    resize: both;
    overflow: auto;
} 
  </style>
</head>
<body onLoad="window.scrollTo(0,170)">
  <div class="container">
    

    <div class="row">
      <div class="col-md-6">
      <h3>API Meta data</h3>
      <div class="font-weight-bold">Source: <a href="<%= history_metadata.git_url %>"><%= history_metadata.git_url %></a></div>
      <div class="font-weight-bold">OAS File: <%= history_metadata.oas_file %></div>
      <div class="font-weight-bold">API Title: <%= history_metadata.api_titles[history_metadata.api_titles.length - 1].title %> [<%= history_metadata.api_titles[history_metadata.api_titles.length - 1].commit_date %>]</div>
      <% if (history_metadata.api_titles.length > 1) { %>
        <table class="table">
          <thead>
            <tr>
              <th>Commit Date</th>
              <th>Version</th>
              <th>Title</th>
            </tr>
          </thead>
          <tbody>
            <% history_metadata.api_titles.forEach((title) => { %>
              <tr>
                <td><%= title.commit_date %></td>
                <td><%= title.version %></td>
                <td><%= title.title %></td>
              </tr>
            <% }); %>
          </tbody>
        </table>
      <% } %>
     
      
     
      </div>
      <div class="col-md-6">
      <h3>API Commits and Versions</h3>
      <table class="table">
      <tr>
        <th class="font-weight-bold">Unique Versions</th>
        <td><%=history_metadata.unique_versions.length%></td>
      </tr>
      <tr>
        <th class="font-weight-bold">API Total Commits</th>
        <td><%=history_metadata.total_commits %></td>
      </tr>
      <tr>
        <th class="font-weight-bold">API First commit</th>
        <td><%=history_metadata.first_commit %></td>
      </tr>
      <tr>
        <th class="font-weight-bold">API Last Commit</th>
        <td><%=history_metadata.last_commit %></td>
      </tr>
    </table>
      </div>
    </div>

   
    <div class="row" id="visualizations">
      <div class="col-md-6">
      <h3>API Version Clock</h3>
        <div id="versions" class="views-item"></div>
      </div>
      <div class="col-md-6">
      <h3>API Changes</h3>
        <div id="changes" class="views-item"></div>
      </div>
    </div>
  </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/4.1.0/echarts.min.js"></script>
    <script>
      // Initialize ECharts chart with the container element
      var chartContainer = document.getElementById('changes');
      var chart = echarts.init(chartContainer);
      var chartOptions_1 = <%-JSON.stringify(JSON.parse(JSON.stringify(changesEcharts))) %>;
      chart.setOption(chartOptions_1);
      window.addEventListener('resize', function() {
        chart.resize();
      });

      var chartContainer = document.getElementById('versions');
      var chart = echarts.init(chartContainer);
      var chartOptions_2 = <%-JSON.stringify(JSON.parse(JSON.stringify(versionsEcharts))) %>;
      chart.setOption(chartOptions_2);
      window.addEventListener('resize', function() {
          chart.resize();
      });
    </script>
  </body>
</html>
`;

export function renderAllCharts(input, history_metadata) {
  // console.log(input);
  var rendered = ejs.render(HTML, {
    changesEcharts: JSON.parse(JSON.stringify(input.changesEcharts)),
    versionsEcharts: JSON.parse(JSON.stringify(input.versionsEchart)),
    history_metadata: input.history_metadata,
  });
  var output = input.output;
  console.log(output);
  if (!output) {
    output = join(
      process.cwd(),
      "apivol-outputs",
      `viz-${input.filename}-api.html`
    );
  } else {
    output = join(output);
  }

  // if join(process.cwd(), "apivol-outputs") not exists, create it
  if (!fs.existsSync(join(process.cwd(), "apivol-outputs"))) {
    fs.mkdirSync(join(process.cwd(), "apivol-outputs"));
  }
  try {
    fs.writeFileSync(output, rendered);

    // reder echarts as svg
    const chartChanges = echarts.init(null, null, {
      renderer: "svg", // must use SVG rendering mode
      ssr: true, // enable SSR
      width: 500, // need to specify height and width
      height: 500,
    });
    // levelsConfig(true, input.changesEcharts);
    chartChanges.setOption(input.changesEcharts);
    // ${oasFiles[i].oaspath.split(".")[0]}-${
    //   history_metadata.api_titles[0].title
    // }
    const svgStr = chartChanges.renderToSVGString();
    var dir = output.split("/").slice(0, -1);
    fs.writeFileSync(
      join(
        dir.join("/"),
        `viz-${input.filename}-${history_metadata.api_titles[0].title}-changes.svg`
      ),
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

    const chartVersions = echarts.init(null, null, {
      renderer: "svg", // must use SVG rendering mode
      ssr: true, // enable SSR
      width: 500, // need to specify height and width
      height: 500,
    });
    levelsConfig(true, input.versionsEchart);
    chartVersions.setOption(input.versionsEchart);

    const svgStr2 = chartVersions.renderToSVGString();

    console.log(output);
    fs.writeFileSync(
      // remove last

      join(
        dir.join("/"),
        `viz-${input.filename}-${history_metadata.api_titles[0].title}-versions.svg`
      ),
      svgStr2,
      "utf8",
      (err) => {
        if (err) {
          console.error("Error saving output:", err);
        } else {
          console.log("Output saved as", { outputPath });
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
}

function levelsConfig(svg, options) {
  if (svg) {
    delete options.toolbox;
    // remove tool
    options.series.levels = [
      {},
      {
        r0: "3%",
        r: "11%",
        label: { fontSize: 7, minAngle: 10 },
        itemStyle: { borderWidth: 0 },
      },
      {
        r0: "11%",
        r: "18%",
        label: { fontSize: 7, minAngle: 10 },
        itemStyle: { borderWidth: 0 },
      },
      {
        r0: "18%",
        r: "25%",
        label: { rotate: "tangential", fontSize: 7, minAngle: 10 },
        itemStyle: { borderWidth: 0 },
      },
      {
        r0: "25.25%",
        r: "38%",
        label: { fontSize: 7, minAngle: 9 },
        itemStyle: { borderWidth: 0 },
      },
      {
        r0: "38.5%",
        r: "39.5%",
        label: { show: false },
        itemStyle: { borderWidth: 0 },
      },
      {
        r0: "40%",
        r: "54%",
        label: { color: "#000000", fontSize: 9, minAngle: 5 },
        itemStyle: { borderWidth: 1 },
      },
      {
        r0: "54%",
        r: "56%",
        itemStyle: { borderWidth: 1 },
        label: { show: false, rotate: "tangential", minAngle: 12 },
      },
      {
        r0: "56.5%",
        r: "57.5%",
        label: {
          position: "outside",
          padding: 0,
          silent: false,
          fontSize: 10,
          color: "#000000",
          minAngle: 2,
        },
        itemStyle: { borderWidth: 1 },
      },
    ];
  } else {
    options.series.levels = [
      {},
      {
        r0: "3%",
        r: "11%",
        label: { fontSize: 10, minAngle: 10 },
        itemStyle: { borderWidth: 0 },
      },
      {
        r0: "11%",
        r: "18%",
        label: { fontSize: 10, minAngle: 10 },
        itemStyle: { borderWidth: 0 },
      },
      {
        r0: "18%",
        r: "25%",
        label: { rotate: "tangential", fontSize: 10, minAngle: 10 },
        itemStyle: { borderWidth: 0 },
      },
      {
        r0: "25.25%",
        r: "34%",
        label: { fontSize: 7, minAngle: 9 },
        itemStyle: { borderWidth: 0 },
      },
      {
        r0: "34.5%",
        r: "35.5%",
        label: { show: false },
        itemStyle: { borderWidth: 0 },
      },
      {
        r0: "36%",
        r: "50%",
        label: { color: "#000000", fontSize: 9, minAngle: 5 },
        itemStyle: { borderWidth: 1 },
      },
      {
        r0: "50%",
        r: "52%",
        itemStyle: { borderWidth: 1 },
        label: { show: false, rotate: "tangential", minAngle: 12 },
      },
      {
        r0: "52.5%",
        r: "53.5%",
        label: {
          position: "outside",
          padding: 0,
          silent: false,
          fontSize: 10,
          color: "#000000",
          minAngle: 2,
        },
        itemStyle: { borderWidth: 1 },
      },
    ];
  }
}
