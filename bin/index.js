#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var analyse_and_report_1 = require("./src/analyse_directory/analyse_and_report");
var fs = require("fs");
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
    (0, analyse_and_report_1.analyse_and_report)({ dirPath: dirPath });
}
run();
