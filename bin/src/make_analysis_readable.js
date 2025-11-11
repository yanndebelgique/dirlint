"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.make_analysis_readable = make_analysis_readable;
function make_analysis_readable(_a) {
    var analysis = _a.analysis, dirPath = _a.dirPath, options = _a.options;
    var _b = (options !== null && options !== void 0 ? options : {}).readability_level, readability_level = _b === void 0 ? "somewhat" : _b;
    var _make_analysis_readable = function (_a) {
        var item = _a.item, analysis = _a.analysis;
        var missing_items = analysis.missing_items.map(function (item) {
            return item.name_rule;
        });
        var incorrect_items = analysis.incorrect_items.map(function (analysis) {
            return _make_analysis_readable(analysis);
        });
        // @ts-ignore
        return removeEmpty({
            item: printItem(item),
            missing_items: missing_items,
            incorrect_items: incorrect_items,
            extraneous_items: analysis.extraneous_items.map(printItem),
        });
        function removeEmpty(obj) {
            return Object.fromEntries(Object.entries(obj).filter(function (_a) {
                var _ = _a[0], val = _a[1];
                if (val === undefined)
                    return false;
                if (val === null)
                    return false;
                if (Array.isArray(val) && val.length === 0)
                    return false;
                return true;
            }));
        }
        function printItem(item) {
            switch (readability_level) {
                case "very": {
                    return "".concat(item.item_type, " ").concat(item.item_path.replace(dirPath, ""));
                }
                case "somewhat": {
                    return {
                        item_type: item.item_type,
                        item_path: item.item_path.replace(dirPath, ""),
                    };
                }
                case "standard": {
                    return item;
                }
            }
        }
    };
    var _readable_analysis = _make_analysis_readable(analysis);
    return _readable_analysis;
}
