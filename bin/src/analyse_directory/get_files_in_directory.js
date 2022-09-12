"use strict";
exports.__esModule = true;
exports.get_files_in_directory = void 0;
var get_items_in_directory_1 = require("./get_items_in_directory");
function get_files_in_directory(directory_path) {
    var _is_file = function (_a) {
        var item_type = _a.item_type;
        return item_type === 'file';
    };
    return (0, get_items_in_directory_1.get_items_in_directory)(directory_path)
        .filter(_is_file)
        .map(function (_a) {
        var item_path = _a.item_path;
        return item_path;
    });
}
exports.get_files_in_directory = get_files_in_directory;
