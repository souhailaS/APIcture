import ejs from "ejs";
import fs from "fs";
import path from "path";
import { join } from "path";

const HTML = `<!DOCTYPE html>
<html>
  <head>
    <title>API Channges vs. API versioning</title>
    <style>
    .body {
      font-family: Arial, Helvetica, sans-serif;
    }
    .views-container {
        flex-direction: row;
        display: flex;
        justify-content: space-evenly;
      }
      
      .views-item {
        flex-grow: 1;
        min-width: 45vw;
        height: 80vh;
        box-shadow: #bfc4c6 0px 0px 4px;
      }
    </style>
  </head>
  <body>
  <h1>API Meta data</h1>
    <div>
      <div style="font-weight: bold">API: <%=history_metadata.api_titles.map((t)=> t.title+" ["+t.commit_date+"]").join(" -> ") %></div>
      <div style="font-weight: bold">Source: <a href="<%=history_metadata.git_url %>" > <%=history_metadata.git_url %> <a> </div>
      <br>
      <div style="font-weight: bold">Unique Versions: <%=history_metadata.unique_versions.length%>  <!--<%=history_metadata.unique_versions.map((t)=> t.version+" ["+t.commit_date+"]").join(" -> ") %>--></div>
      <div style="font-weight: bold">API total commits: <%=history_metadata.total_commits %></div>
      <div style="font-weight: bold">API First commit: <%=history_metadata.first_commit %></div>
      <div style="font-weight: bold">API Last commit: <%=history_metadata.last_commit %></div>
      

      <div style="display: inline-block"></div>
    </div>
<h1>Visualizations</h1>
    <div class="views-container" id="views-container">
      <div id="changes" class="views-item" style="min-width: 45vw"></div>
      <div id="versions" class="views-item" style="min-width: 45vw"></div>
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

export function renderAllCharts(input) {
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
    output = join(
      output,
      // "apivol-outputs",
      `viz-${input.filename}-api.html`
    );
  }

  console.log(output);

  // if join(process.cwd(), "apivol-outputs") not exists, create it
  if (!fs.existsSync(join(process.cwd(), "apivol-outputs"))) {
    fs.mkdirSync(join(process.cwd(), "apivol-outputs"));
  }

  fs.writeFileSync(output, rendered);
}
