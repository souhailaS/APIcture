import chai from 'chai';
const expect = chai.expect;
import { fetchOASFiles } from '../bin/fetch_history.js';
import { compute_diff } from '../bin/oasdiff.js';
import fs from 'fs';
import { promisify } from "util";
import { exec } from "child_process";


const execPromise = promisify(exec);
const __dirname = new URL(".", import.meta.url).pathname;
console.log = function () { };

describe('Clone the 11 repositories', function () {
    async function clone() {
        const projects_to_test = [
            "https://github.com/openai/openai-openapi.git",
            "https://github.com/CodeForBaltimore/Bmore-Responsive.git",
            "https://github.com/ipfs/pinning-services-api-spec.git",
            "https://github.com/SODALITE-EU/xopera-rest-api.git",
            "https://github.com/CIRCABC/EUShare.git",
            "https://github.com/pa-media-group/sport-api-development-kit.git",
            "https://github.com/openzim/wp1.git",
            "https://github.com/Collis88/yamltest.git",
            "https://github.com/pinnacleapi/openapi-specification.git",
            "https://github.com/sonallux/spotify-web-api.git",
            "https://github.com/cloudtruth/cloudtruth-cli.git"
        ];

        const cloneFolder = `${__dirname}/test_repos`;
        fs.existsSync(cloneFolder) || fs.mkdirSync(cloneFolder);

        const nextRepo = async function (i) {
            const repoUrl = projects_to_test[i];
            const repoName = repoUrl.split("/").pop().replace(".git", "");
            const clonePath = `${cloneFolder}/${repoName}`;
            try {
                const { stdout, stderr } = await execPromise(
                    `git clone ${repoUrl} ${clonePath}`
                );
                if (stdout) {
                    // console.log(stdout);
                }
                if (stderr) {
                    // console.error(stderr);
                }
            } catch (error) {
                // console.error(error);
            }

            if (i == projects_to_test.length - 1) {
                return fs.readdirSync(cloneFolder).length;
            }
            else return await nextRepo(i + 1);
        }

        return await nextRepo(0);
    }

    it('should clone all repositories in /test_repos', async function () {
        const cloneFolder = `${__dirname}/test_repos`;
        fs.existsSync(cloneFolder) || fs.mkdirSync(cloneFolder);
        const totalRepos = await clone();
        expect(totalRepos).to.be.equal(11);
    });
});


describe('Fetch the OAS files', function () {
    async function fetch_oas() {
        const cloneFolder = `${__dirname}/test_repos`;
        let totalOASFiles = 0;
        const next_project = async function (i) {
            const repoName = fs.readdirSync(cloneFolder)[i];
            const repoPath = `${cloneFolder}/${repoName}`;
            const oasFiles = await fetchOASFiles(repoPath, true);
            totalOASFiles += oasFiles.length;
            if (i == fs.readdirSync(cloneFolder).length - 1) {
                return totalOASFiles;
            }
            else return await next_project(i + 1);
        }
        return await next_project(0);
    }
    it('should be at least 11 OAS files', async function () {
        const totalOASFiles = await fetch_oas();
        expect(totalOASFiles).to.be.at.least(11);
    });

});