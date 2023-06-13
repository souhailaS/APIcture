import { exec } from 'child_process';
// clone these projects to ../../test_repo folder

const projects_with_oas = [
    'https://github.com/ga4gh-rnaseq/schema',
]


const clone = (url) => {
    const command = `git clone ${url} ../../test_repo/${url.split('/').pop()}`
    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.log(err)
        }
        console.log(stdout)
    })
}

projects_with_oas.forEach(project => {
    clone(project)
}
)


