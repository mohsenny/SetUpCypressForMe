const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to create directory if it does not exist
const createDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Function to add test-e2e script to package.json
const addTestScript = () => {
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = require(packageJsonPath);

    packageJson.scripts['test-e2e'] = 'cypress run';

    // Remove the placeholder test script
    delete packageJson.scripts.test;

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Added test-e2e command to package.json');
};

const installCypressAndSetup = () => {
    exec('npm install cypress --save-dev', (installErr, installStdout) => {
        if (installErr) throw installErr;
        console.log(installStdout);
        console.log('Installed Cypress');

        const cypressRunCmd = process.platform === 'win32'
            ? '.\\node_modules\\.bin\\cypress run'
            : './node_modules/.bin/cypress run';

        exec(cypressRunCmd, (runErr, runStdout) => {
            if (runErr) console.log('Cypress run completed with errors, but boilerplate should be generated');
            console.log(runStdout);

            // Manually create the necessary directories and files
            const cypressDir = path.join(__dirname, 'cypress');
            createDir(cypressDir);
            createDir(path.join(cypressDir, 'integration'));
            createDir(path.join(cypressDir, 'plugins'));
            createDir(path.join(cypressDir, 'support'));
            createDir(path.join(cypressDir, 'fixtures'));

            fs.writeFileSync(path.join(cypressDir, 'plugins', 'index.js'), `module.exports = (on, config) => {}`);
            fs.writeFileSync(path.join(cypressDir, 'support', 'commands.js'), `// Custom Commands can be added here`);
            fs.writeFileSync(path.join(cypressDir, 'support', 'index.js'), `// Import commands.js using ES2015 syntax:\nimport './commands'`);

            const sampleTestCode = `
describe('My First Test', () => {
    it('Does not do much!', () => {
        expect(true).to.equal(true)
    })
})
`;
            fs.writeFileSync(path.join(cypressDir, 'integration', 'sample_spec.js'), sampleTestCode);
            console.log('Added a sample test file');
            
            // Add test-e2e script to package.json
            addTestScript();
        });
    });
};

if (fs.existsSync(path.join(__dirname, 'package.json'))) {
    console.warn('package.json already exists. The script will only install Cypress and set up the boilerplate.');
    installCypressAndSetup();
} else {
    exec('npm init -y', (initErr, initStdout) => {
        if (initErr) throw initErr;
        console.log(initStdout);
        console.log('Initialized Node.js project');
        installCypressAndSetup();
    });
}
