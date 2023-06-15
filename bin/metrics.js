import SwaggerParser from "@apidevtools/swagger-parser";
import fs from "fs";
import { join } from "path";
import chalk from "chalk";
import cliProgress from "cli-progress";
import colors from "ansi-colors";


const http_methods = [
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
];

export async function computeSizeMetrics(path) {
  path = join(path, ".previous_versions");
  fs.writeFileSync(join(path, ".metrics.json"), "[]");
  var hashes = fs.readFileSync(join(path, ".api_commits.json"));
  var oasPaths = JSON.parse(hashes); //.map((h) => h.hash + "." + h.fileExtension);

    // var bar = new cliProgress.SingleBar(
    //     {
    //         format: "|- Computing size metrics |" + colors.cyan("{bar}") + "| {percentage}% || {value}/{total} Chunks",
    //         barCompleteChar: "\u2588",
    //         barIncompleteChar: "\u2591",
    //         hideCursor: true,
    //     },
    //     cliProgress.Presets.rect
    // );
    // bar.start(oasPaths.length-1, 0);

  var next = async (l) => {
    if (l < oasPaths.length) {
        // bar.update(l);
      var api = await SwaggerParser.parse(
        join(path, oasPaths[l].hash + "." + oasPaths[l].fileExtension)
      );

      if (api) {
        // console.log(api)
        /**
         *
         *  structure size metrics
         * - paths
         * - operations
         * - used_methods
         * - parametered_operations
         * - distinct_parameters
         * - parameters_per_operations
         * - used_parameters
         * - methods
         *
         *  */

        var endpoints = Object.values(api.paths).reduce((acc, path) => {
          return acc.concat(Object.keys(path));
        }, []);

        var methods = Object.keys(api.paths)
          .map((path) => Object.keys(api.paths[path]))
          .flat(1)
          .filter((m) => http_methods.includes(m.toLowerCase()));

        var parameters = api.paths
          ? Object.values(api.paths).reduce((acc, path) => {
              return acc.concat(
                Object.values(path).map((endpoint) => endpoint?.parameters)
              );
            }, [])
          : [];

   
        var structureSize = {
          paths: Object.values(api.paths).length,
          operations: endpoints.length,
          used_methods: methods.length,
          parametered_operations: parameters.filter((x) => x).length,
          distinct_parameters: [
            ...new Set(
              parameters
                .flat(1)
                .filter((p) => p)
                .map((p) => p.name)
            ),
          ],
          parameters_per_operations:
            parameters
              .filter((p) => p)
              .reduce((acc, p) => {
                return acc + p.length;
              }, 0) / parameters.length,
          used_parameters: parameters
            .filter((p) => p)
            .reduce((acc, p) => {
              return acc + p.length;
            }, 0),
          methods: {
            get: methods.filter((m) => m.toLowerCase() == "get").length,
            put: methods.filter((m) => m.toLowerCase() == "put").length,
            post: methods.filter((m) => m.toLowerCase() == "post").length,
            delete: methods.filter((m) => m.toLowerCase() == "delete").length,
            options: methods.filter((m) => m.toLowerCase() == "options").length,
            head: methods.filter((m) => m.toLowerCase() == "head").length,
            patch: methods.filter((m) => m.toLowerCase() == "patch").length,
            trace: methods.filter((m) => m.toLowerCase() == "trace").length,
          }, //.length,
        };

        /**
         * schema size metrics
         * - schemas
         * - distinct_schemas
         * - properties
         * - distinct_properties
         * - required_properties
         * - distinct_required_properties [TODO]
         * - required_properties_per_schema [TODO]
         * - distinct_required_properties_per_schema [TODO]
         * - required_properties_per_schema [TODO]
         * - distinct_required_properties_per_schema [TODO]
         *
         * */

        var comp = (schema) => {
          //   console.log(schema.schema)
          if (schema.schema.type == "object") {
            if (schema.schema.oneOf && schema.schema.oneOf.length > 0) {
              if (schema.schema.oneOf.type == "object") {
                return Math.max(schema.schema.oneOf.map((s) => comp(s)));
              }
            }
            if (schema.schema.allOf) {
              if (schema.schema.allOf.type == "object") {
                return schema.schema.allOf
                  .map((s) => comp(s))
                  .reduce((a, b) => {
                    return a + b;
                  }, 0);
              }
            }
            if (schema.schema.anyOf) {
              if (schema.schema.anyOf.type == "object") {
                return schema.schema.anyOf
                  .map((s) => comp(s))
                  .reduce((a, b) => {
                    return a + b;
                  }, 0);
              }
            }

            if (schema.schema.properties) {
              return Object.keys(schema.schema.properties).length;
            }
          }
          if (schema.schema.items) {
            if (schema.schema.items.type == "object") {
              if (
                schema.schema.items.oneOf &&
                schema.schema.items.oneOf.length > 0
              ) {
                return Math.max(schema.schema.items.oneOf.map((s) => comp(s)));
              }
              if (
                schema.schema.items.allOf &&
                schema.schema.items.allOf.length > 0
              ) {
                return schema.schema.items.allOf
                  .map((s) => comp(s))
                  .reduce((a, b) => {
                    return a + b;
                  }, 0);
              }
              if (schema.schema.items.properties) {
                return Object.keys(schema.schema.items.properties).length;
              }
            }
          }
          return 0;
        };

        var collect_properties = (schema) => {
          if (schema.schema.type == "object") {
            if (schema.schema.oneOf && schema.schema.oneOf.length > 0) {
              if (schema.schema.oneOf.type == "object") {
                return schema.schema.oneOf
                  .map((s) => collect_properties(s))
                  .flat(1);
              }
            }
            if (schema.schema.allOf) {
              if (schema.schema.allOf.type == "object") {
                return schema.schema.allOf
                  .map((s) => collect_properties(s))
                  .flat(1);
              }
            }
            if (schema.schema.anyOf) {
              if (schema.schema.anyOf.type == "object") {
                return schema.schema.anyOf
                  .map((s) => collect_properties(s))
                  .flat(1);
              }
            }

            if (schema.schema.properties) {
              return Object.keys(schema.schema.properties);
            }
          }
          if (schema.schema.items) {
            if (schema.schema.items.type == "object") {
              if (
                schema.schema.items.oneOf &&
                schema.schema.items.oneOf.length > 0
              ) {
                return schema.schema.items.oneOf
                  .map((s) => collect_properties(s))
                  .flat(1);
              }
              if (
                schema.schema.items.allOf &&
                schema.schema.items.allOf.length > 0
              ) {
                return schema.schema.items.allOf
                  .map((s) => collect_properties(s))
                  .flat(1);
              }
              if (schema.schema.items.properties) {
                return Object.keys(schema.schema.items.properties);
              }
            }
          }
          return [];
        };

        var schemaSize = {
          schemas: api.schemas ? api.schemas.length : 0,
          defined_schemas: api.components?.schemas,
          properties: api.schemas
            ?.map((schema) => {
              return comp(schema);
            })
            .reduce((a, b) => {
              return a + b;
            }, 0),
          max_properties: api.schemas
            ? Math.max(
                ...api.schemas?.map((schema) => {
                  return comp(schema);
                })
              )
            : 0,
          min_properties: api.schemas
            ? Math.min(
                ...api.schemas?.map((schema) => {
                  return comp(schema);
                })
              )
            : 0,
          distinct_properties: [
            ...new Set(
              api.schemas
                ?.map((schema) => {
                  return collect_properties(schema);
                })
                .flat(1)
            ),
          ],
        };

        var metrics_file = fs.readFileSync(join(path, ".metrics.json"), "utf8");
        var metrics = JSON.parse(metrics_file);
        metrics.push({
          hash: oasPaths[l].hash,
          comit_date: oasPaths[l].comit_date,
          structureSize: structureSize,
          schemaSize: schemaSize,
        });
        fs.writeFileSync(
          join(path, ".metrics.json"),
          JSON.stringify(metrics, null, 2)
        );
        // console.log(
        //   `- Processing ${l}/${oasPaths.length} ( ${oasPaths[l].hash} )`
        // );
        l++;
        return await next(l);
      } else {
        // bar.stop();
        // // exit code 0
        // process.exit(0);
        // // console.log("Done");
        return ;
      }
    }
  };

   await next(0);
   return fs.readFileSync(join(path, ".metrics.json"), "utf8");

}

