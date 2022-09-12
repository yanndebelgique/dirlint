"use strict";
exports.__esModule = true;
exports.analyse_directory_structure = void 0;
var index_1 = require("./index");
function analyse_directory_structure(_a) {
    var dirPath = _a.dirPath;
    var dir_structure_analysis = index_1["default"].analyse_directory(dirPath);
    if (index_1["default"].is_invalid_analysis(dir_structure_analysis)) {
        console.log('invalid dir structure!');
        var readable_analysis = index_1["default"].make_analysis_readable({
            dirPath: dirPath,
            analysis: dir_structure_analysis
        });
        console.log(JSON.stringify(readable_analysis, null, 2));
    }
    else {
        console.log('valid!');
    }
}
exports.analyse_directory_structure = analyse_directory_structure;
analyse_directory_structure({
    dirPath: './test_directories/project_a/src'
});
