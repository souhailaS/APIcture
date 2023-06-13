# WEB-API-EVOLUTION-VISUALIZATIONS-CLI
## What is apivol?
The apivol tool is a command-line interface (CLI) tool designed to provide visualization support for understanding the evolution of Web APIs. It enables users to generate insightful visualizations that highlight changes, version upgrades, and metrics associated with API development and evolution. The tool is particularly useful for tracking and analyzing the history of OpenAPI specifications stored in a Git repository, but it also supports generating visualizations directly from code repositories without OpenAPI descriptions.

## How to Use apivol?
To use the apivol tool, follow these steps:

Install the apivol tool using `npm install apivol`

Run the apivol command followed by the desired subcommand to generate the desired visualizations. The available subcommands include:

```
apivol <spec-path>: Generates the visualizations for the OpenAPI specification located at the specified path.
apivol changes <spec-path>: Focuses specifically on changes localization.
apivol versioning <spec-path>: Analyzes version upgrades versus changes types.
apivol metrics: Generates visualizations for API metrics.
```

Specify any additional options or flags to customize the visualization output, such as the desired format (e.g., PDF, SVG, interactive HTML).


Please refer to the documentation for more detailed instructions on using the apivol tool and understanding the various visualizations it offers.