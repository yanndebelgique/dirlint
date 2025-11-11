#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var analyse_and_report_1 = require("./src/analyse_directory/analyse_and_report");
var fs = require("fs");
var path = require("path");
var yargs = require('yargs/yargs');
var hideBin = require('yargs/helpers').hideBin;
var packageJson = require(path.join(__dirname, '../package.json'));
var argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 <directory>')
    .command('$0 <directory>', 'Validate directory structure', function (yargs) {
    yargs.positional('directory', {
        describe: 'Path to the directory to validate',
        type: 'string'
    });
})
    .example('$0 ./src/components', 'Validate the components directory')
    .example('$0 .', 'Validate the current directory')
    .version(packageJson.version)
    .alias('v', 'version')
    .help('h')
    .alias('h', 'help')
    .epilogue('For more information, visit: https://github.com/yanndebelgique/dirlint')
    .argv;
function run() {
    var dirPath = argv.directory || argv._[0];
    if (!dirPath) {
        console.error('Error: Please provide a path to the directory you want to validate!');
        console.log('\nUsage: dirlint <directory>');
        console.log('Try "dirlint --help" for more information.');
        process.exit(1);
    }
    if (!fs.existsSync(dirPath)) {
        console.error("Error: The path \"".concat(dirPath, "\" does not exist!"));
        process.exit(1);
    }
    (0, analyse_and_report_1.analyse_and_report)({ dirPath: dirPath });
}
run();
