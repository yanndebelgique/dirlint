"use strict";
exports.__esModule = true;
exports.analyse_and_report = void 0;
var index_1 = require("./index");
var make_analysis_readable_1 = require("../make_analysis_readable");
/**
 * Responsible for printing to console and exiting the program with the right code
 * @param dirPath
 */
function analyse_and_report(_a) {
    var dirPath = _a.dirPath;
    var dir_structure_analysis = (0, index_1.analyse_directory)(dirPath);
    if ((0, index_1.is_invalid_analysis)(dir_structure_analysis)) {
        var readable_analysis = (0, make_analysis_readable_1.make_analysis_readable)({
            dirPath: dirPath,
            analysis: dir_structure_analysis
        });
        console.log(JSON.stringify(readable_analysis, null, 2));
        console.log("invalid dir structure!");
        process.exit(1);
    }
    else {
        console.log("valid!");
        process.exit(0);
    }
}
exports.analyse_and_report = analyse_and_report;
