# APIcture
## What is APIcture?
APIcture is a command-line interface (CLI) tool designed to provide visualization support for understanding the evolution of Web APIs. It enables users to generate insightful visualizations that highlight changes, version upgrades, and metrics associated with API development and evolution. The tool is particularly useful for tracking and analyzing the history of OpenAPI specifications stored in a Git repository, but it also supports generating visualizations directly from code repositories without OpenAPI descriptions.

## How to Use APIcture?
To use the apict tool, follow these steps:

1. Install the APIcture CLI tool using `npm install apict -g` 

2. Run the `apict` command followed by the desired subcommand to generate the desired visualizations. The available subcommands include:

   - `apict <spec-path>`: Generates the visualizations for the OpenAPI specification located at the specified path.
   - `apict changes <spec-path>`: Focuses specifically on changes localization.
   - `apict versioning <spec-path>`: Analyzes version upgrades versus changes types.
   - `apict metrics`: Generates visualizations for API metrics.

3. Specify any additional options or flags to customize the visualization output, such as the desired format (e.g., PDF, SVG, interactive HTML).

#### Metrics Options

When using the `apict metrics` subcommand, you have the option to select specific API size metrics that you want to visualize the evolution of over time. 

There are a set of available options of the `metrics` subcommand :

- `--endpoints(-e)`: Count the number of endpoints at every commit timestamp.
- `--paths(-p)`: Count the number of paths at every commit timestamp.
- `--breaking-changes(-bc)`: Count the frequently detected breaking changes in the API history.
- `--methods(-m)`: Track the evolution of the usage of HTTP methods in the API over time.
- `--breaking-methods(-bm)`: Analyze the types of API changes occurring within specific HTTP methods.
- `--parameters(-param)`: Depict the number of parameters and parameterized operations present in the API at every commit timestamp. Also, count the number of distinct parameters used in the API for each commit.
- `--datamodel(-d)`: Reflect the evolution of the complexity of the API's data model by counting the number of used schemas and their properties, as well as the number of distinct properties at each commit timestamp.

These options allow you to choose specific API size metrics that you want to visualize the evolution of over time. Feel free to select the options that best suit your analysis needs to gain insights into the changes and growth of your Web APIs.

Feel free to explore the available metrics options and adapt them to your specific needs to gain deeper insights into the evolution of your Web APIs.

## Examples of Usage

Here are a few examples of how to use the `apict` tool:

1. Visualize the changes in an OpenAPI specification:
   
```
apict changes -r /path/to/git-repo
```

2. Analyze the version upgrades and changes types in an OpenAPI specification:
   
```
apict versioning /path/to/git-repo
```

![API change vs version changes](./changes-vs-versions.gif)



1. Generate visualizations for API endpoints related metrics:

```
apict metrics --endpoints  /path/to/git-repo
```



These examples illustrate some of the basic functionalities of the APIcture tool. Feel free to explore the available options and adapt them to your specific needs to gain deeper insights into the evolution of your Web APIs.

<!-- ## Test -->
