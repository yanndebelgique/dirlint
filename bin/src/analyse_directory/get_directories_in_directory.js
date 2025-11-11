"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_directories_in_directory = get_directories_in_directory;
var fs = require("fs");
var path = require("path");
var isDirectory = function (file_path) { return fs.lstatSync(file_path).isDirectory(); };
function get_directories_in_directory(directory_path) {
    var files = fs.readdirSync(directory_path);
    var dir_paths = files
        .map(function (fn) { return path.join(directory_path, fn); })
        .filter(isDirectory);
    return dir_paths;
}
