"use strict";
exports.__esModule = true;
var analyse_directory_1 = require("./analyse_directory");
var make_analysis_readable_1 = require("./make_analysis_readable");
function main() {
    var dirPath = "/Users/yannbuydens/p/semantic_code_analysis/analyser/codebases_being_analysed/project_0/src";
    var analysis = (0, analyse_directory_1.analyse_directory)(dirPath);
    if ((0, analyse_directory_1.is_invalid_analysis)(analysis)) {
        var res = (0, make_analysis_readable_1.make_analysis_readable)({ analysis: analysis, dirPath: dirPath });
        console.log(res);
    }
    else {
        console.log("All good!");
    }
}
main();
