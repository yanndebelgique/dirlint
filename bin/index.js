#! /usr/bin/env node
"use strict";
exports.__esModule = true;
var fs = require("fs");
var analyse_directory_1 = require("./src/analyse_directory");
var make_analysis_readable_1 = require("./src/make_analysis_readable");
var argv = require('yargs/yargs')(process.argv.slice(2)).argv;
function run() {
    var _a = argv._, first_arg = _a[0], rest = _a.slice(1);
    if (rest.length !== 0) {
        console.log('too many arguments! Just pass the path to the directory you want to validate!');
        return;
    }
    if (!first_arg) {
        console.log('please pass the path to the directory you want to validate!');
        return;
    }
    if (!fs.existsSync(first_arg)) {
        console.log('the path you passed does not exist!');
        return;
    }
    var dirPath = first_arg;
    var dir_structure_analysis = (0, analyse_directory_1.analyse_directory)(dirPath);
    if ((0, analyse_directory_1.is_invalid_analysis)(dir_structure_analysis)) {
        var readable_analysis = (0, make_analysis_readable_1.make_analysis_readable)({
            dirPath: dirPath,
            analysis: dir_structure_analysis
        });
        console.log(JSON.stringify(readable_analysis, null, 2));
        console.log('invalid dir structure!');
        process.exit(1);
    }
    else {
        console.log('valid!');
        process.exit(0);
    }
}
run();
