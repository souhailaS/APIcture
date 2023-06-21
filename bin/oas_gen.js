/**
 *  This extracts specs from the cloned repo for each commit that changed the files in the routes forlder
 */
import fs from "fs";
import { execSync } from "child_process";
import { join } from "path";

function fetchAPIHistory(path) {
  if (fs.existsSync(join(path, "routes"))) {
    // get the list of commits that modified the routes folder
    var cmd = `cd ${path} && git log --pretty=format:"%H" -- routes`;
    var commits = execSync(cmd).toString().split("\n");
    // for each commit extract the api specification
    commits.forEach((commit) => {
      if (commit != "") {
        var c = `cd ${path} && git checkout ${commit}`;
        exec(c, (err, stdout, stderr) => {
          if (err) {
            console.log(`x -- could not checkout ${commit}`);
          } else {
            console.log(`√ -- checked out ${commit}`);
            // extract the api specification
            ExtractAPISpecification(path);
          }
        });
      }
    });
  } else {
    console.log(`x -- no routes folder found for ${project}`);
  }
}

function ExtractAPISpecification(path) {
  // install swagger-autogen
  var cmd = `cd ${path} && npm install swagger-autogen`;
  if (!fs.existsSync(join(path, "tsconfig.json"))) {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.log(`x -- could not install depend for ${project}`);
      } else {
        console.log(`√ -- installed dependencies for ${path}`);
        var start = "";
        try {
          var packageJson = JSON.parse(
            fs.readFileSync(join(path, "package.json"), "utf8")
          );
          start = packageJson.scripts.start;
        } catch (e) {
          console.log(`x -- no package.json found for ${project}`);
        }
        if (start && start != "") {
          // if it doesn't end with js add the js extension
          var f = packageJson.scripts.start.split(" ");
          // take last element in f
          f = f[f.length - 1];
          if (!f.endsWith(".js") && !f.endsWith(".ts")) {
            f += ".js";
            runSwaggerAutogen(path, start, o);
          }
        } else {
          var c = `cd output/repos/${owner}/${project} && grep -r 'app.listen' .`;
          console.log(`running ${c} on ${owner}/${project}`);

          exec(c, (err, stdout, stderr) => {
            if (err) {
              console.log(`x -- no start file found ${project}`);
            } else {
              console.log(`√ -- start file found ${project}`);
              console.log(stdout);
              startFile = stdout
                .split("\n")
                .map((s) => s.split(":")[0])
                .filter(
                  (s) => !s.includes("node_modules") && s.endsWith(".js")
                );
              console.log(startFile);

              if (startFile.length == 1) {
                runSwaggerAutogen(path, startFile[0], o);
              } else {
                console.log(`x -- no start file found ${project}`);
              }
            }
          });
        }
      }
    });
  }
}

function runSwaggerAutogen(project, starFile) {
  var c = `cd ${path} && touch swagger.js`;
  exec(c, (err, stdout, stderr) => {
    if (err) {
      console.log(`x -- could not create swagger.js ${project}`);
      writeOutcome(project, 0);
    } else {
      console.log(`√ -- created swagger.js ${project}`);
      // write in the swagger.js file
      var swaggerJs = `const swaggerAutogen = require('swagger-autogen')();\n
      const doc = {
        openapi: "3.0.0",
        info: {
          title: 'My API',
          description: 'Description',
        }
      };\n
      const outputFile = './swagger_output_${o}.json';\nconst endpointsFiles = ['./${starFile}'];\nswaggerAutogen(outputFile, endpointsFiles,doc);`;
      fs.writeFileSync(join(project, "swagger.js"), swaggerJs, "utf8");
      // run the swagger.js file
      var c = `cd ${project} && node swagger.js`;
      console.log(`running ${c} on ${project}`);

      exec(c, (err, stdout, stderr) => {
        if (err) {
          console.log(`x -- could not run swagger.js ${project}`);
          return false;
        } else {
          console.log(`√ -- ran swagger.js ${project}`);
        }
      });
    }
  });
}
