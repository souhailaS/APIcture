import fs from "fs";
import path, { join } from "path";

import { exec, execSync } from "child_process";
import chalk from "chalk";

export async function generateOAS(repoPath, autogen) {
  if (autogen) {
    var cmd = `cd ${repoPath} && npm install --save-dev  swagger-autogen`;
    // install swagger autogen
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.log(`x -- could not install depend for ${repoPath}`);
      } else {
        console.log(`√ -- installed depend for ${repoPath}`);
        // time stamp for auto-gen install
        try {
          var packageJson = JSON.parse(
            fs.readFileSync(join(repoPath, "package.json"), "utf8")
          );
          console.log(packageJson);
          var start = packageJson.scripts.start;
          console.log(start);
        } catch (e) {
          console.log(`No start command found`);
          return true;
        }
        var module = packageJson.type == "module" ? true : false;
        if (start) {
          // if it doesn't end with js add the js extension
          var f = packageJson.scripts.start.split(" ");
          // take last element in f
          f = f[f.length - 1];
          if (!f.endsWith(".js")) {
            f += ".js";
          }
          console.log(f);
          runSwaggerAutogen(repoPath, f, module);
          return true;
        } else {
          console.log("no start file found");
          return true;
          // if the start file is not explicitly in the start command we can try to find it
          // var c = `cd ${repoPath} && grep -r 'app.listen' .`;
          // console.log(`running ${c} on ${owner}/${project}`);
          // exec(c, (err, stdout, stderr) => {
          //   if (err) {
          //     console.log(`x -- no start file found ${project}`);
          //   } else {
          //     console.log(`√ -- start file found ${project}`);
          //     startFile = stdout
          //       .split("\n")
          //       .map((s) => s.split(":")[0])
          //       .filter((s) => !s.includes("node_modules") && s.endsWith(".js"));
          //     console.log(startFile);
          //     if (startFile.length == 0) {
          //     }
          //     var o = 0;
          //     startFile.forEach((s) => {
          //       o = o + 1;
          //       runSwaggerAutogen(
          //         owner + "/" + project,
          //         s,
          //         o,
          //         t3,
          //         non_processed[0]
          //       );
          //     });
          //   }
          // });
          // if the start file is not found we will not try for the moment.
        }
      }
    });
  } else {
    return runExpresso(repoPath);
  }
}

export async function runExpresso(project) {
  var c = `cd ${project} && npm install && expresso generate`;
  // make it silent
  var { stdout, stderr } =  execSync(c, {stdio: 'pipe'});
  if (stderr) {
    // console.log(stderr);
    // console.log(`x -- could not create expresso ${project}`);
    return false;
  }
  // console.log(`√ -- created expresso ${project}`);
  // console.log(stdout);
  return true;
}

function runSwaggerAutogen(project, starFile, module) {
  var c = `cd ${project} && touch swagger.js`;
  exec(c, (err, stdout, stderr) => {
    if (err) {
      console.log(`x -- could not create swagger.js ${project}`);
    } else {
      console.log(`√ -- created swagger.js ${project}`);
      // write in the swagger.js file
      var swaggerJs = module
        ? `import  swaggerAutogen from "swagger-autogen"`
        : `const swaggerAutogen = require('swagger-autogen')();\n`;
      swaggerJs += `
      const doc = {
        openapi: "3.0.0",
        info: {
          title: 'My API',
          description: 'Description',
        }
      };\n
      const outputFile = './swagger_output.json';\nconst endpointsFiles = ['./${starFile}'];\nswaggerAutogen(outputFile, endpointsFiles,doc);`;
      fs.writeFileSync(join(project, "swagger.js"), swaggerJs, "utf8");
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
