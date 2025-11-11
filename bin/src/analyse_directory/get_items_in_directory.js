"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_items_in_directory = get_items_in_directory;
var fs = require("fs");
var path = require("path");
function get_items_in_directory(directory_path) {
    var items = fs.readdirSync(directory_path);
    var item_paths = items.map(function (item) { return path.join(directory_path, item); });
    return item_paths.map(function (item_path) {
        return {
            item_path: item_path,
            item_type: fs.lstatSync(item_path).isFile() ? 'file' : 'dir'
        };
    });
}
