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
      margin-left:50px;
      margin-right:50px;
    }
    .views-item {
      height: 800px;
      width:800px;
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
#visualizations{
  display:flex;
  flex-direction:row;
  justify-content:space-between;
}
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

   
   
  </div>
  <div class="row" id="visualizations">
  <div>
  <h3>API Version Clock</h3>
    <div id="versions" class="views-item"></div>
  </div>
  <div>
  <h3>API Changes</h3>
    <div id="changes" class="views-item"></div>
  </div>
</div>
  <h3>Metrics</h3>
  <div id="metrics-container">
  <div id="metrcis-views-container" >
    <div id="structure-metrics">
      <div
        id="metrics-echart"
        class="metrics-views-item"
        style="width: 33vw; height: 45vh"
      ></div>
      <div id="parameters-echart" style="width: 33vw; height: 45vh"></div>
      <div id="methods-echart" style="width: 33vw; height: 45vh"></div>
    </div>
    <div id="schema-metrics">
      <div id="schema-echart" style="width: 33vw; height: 45vh"></div>
      <div id="radar-echart" style="width: 46vw; height: 45vh"></div>
      <div id="methods-breaking" style="width: 38vw; height: 45vh"></div>
    </div>
  </div>
</div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/4.1.0/echarts.min.js"></script>
    <script>
      // Initialize ECharts chart with the container element
      var chartContainer = document.getElementById('changes');
      var chart = echarts.init(chartContainer);
      var chartOptions_1 = <%-JSON.stringify(JSON.parse(JSON.stringify(changes_echarts))) %>;
      chart.setOption(chartOptions_1);
      window.addEventListener('resize', function() {
        chart.resize();
      });

      var chartContainer = document.getElementById('versions');
      var chart = echarts.init(chartContainer);
      var chartOptions_2 = <%-JSON.stringify(JSON.parse(JSON.stringify(versions_echarts))) %>;
      chart.setOption(chartOptions_2);
      window.addEventListener('resize', function() {
          chart.resize();
      });


     
    </script>
  </body>
</html>
`;

export function renderAllCharts(input) {
  var rendered = ejs.render(HTML, {
    changes_echarts: JSON.parse(JSON.stringify(input.changes_echarts)),
    versions_echarts: JSON.parse(JSON.stringify(input.versions_echarts)),
    history_metadata: input.history_metadata,
    options:input.options || {},
    usedOptions:input.usedOptions,
    metrics:input.metrics
  });
  var output = input.output;
  var path = input.path ;
  if (!output) {
    path = join(path, "APIcture", input.oas_path);
  } else {

    path = join(output)//, input.history_metadata.oas_file);
  }
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }

  output = join(path, `viz-${input.filename}.html`);

  fs.writeFileSync(output, rendered, "utf-8", (err) => {
    if (err) throw err;
  });
}
