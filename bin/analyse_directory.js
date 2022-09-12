"use strict";
exports.__esModule = true;
exports.analyse_directory = exports.is_invalid_analysis = void 0;
var yaml = require("js-yaml");
var get_items_in_directory_1 = require("./shared/get_items_in_directory");
var path = require("path");
var fs = require("fs");
function escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}
var is_invalid_analysis = function (_a) {
    var analysis = _a.analysis;
    var missing_items = analysis.missing_items, incorrect_items = analysis.incorrect_items, extraneous_items = analysis.extraneous_items;
    return (missing_items.length !== 0 ||
        incorrect_items.length !== 0 ||
        extraneous_items.length !== 0);
};
exports.is_invalid_analysis = is_invalid_analysis;
function unpackAnalysis(analysis) {
    var is_valid = function (a) { return !(0, exports.is_invalid_analysis)(a); };
    if (is_valid(analysis)) {
        return analysis;
    }
    if (analysis.analysis.incorrect_items.length !== 1 ||
        analysis.analysis.missing_items.length !== 0) {
        throw new Error("cannot unpack because you would loose info!");
    }
    return analysis.analysis.incorrect_items[0];
}
/**
 *
 * @param dir_path
 */
function analyse_directory(dir_path) {
    return _iter_analyse_directory(dir_path);
    function _iter_analyse_directory(dir_path) {
        var source = {
            item_type: "dir",
            item_path: path.dirname(dir_path)
        };
        if (!_has_dir_rule_configured(dir_path)) {
            return {
                item: source,
                //@ts-ignore
                rule: undefined,
                analysis: {
                    missing_items: [],
                    incorrect_items: [],
                    extraneous_items: []
                }
            };
        }
        var rule = _parse_dir_rule_configuration(dir_path);
        return unpackAnalysis(_evaluate_rule(source, rule));
    }
    function _has_dir_rule_configured(dir_path) {
        return fs.existsSync(path.join(dir_path, ".dirrules.yaml"));
    }
    function _parse_dir_rule_configuration(dir_path) {
        var doc = yaml.load(fs.readFileSync(path.join(dir_path, ".dirrules.yaml"), "utf8"));
        return {
            optional: false,
            applied_to_items_of_type: "dir",
            name_rule: path.basename(dir_path),
            content_rules: doc.map(parseYamlRule)
        };
        function parseYamlRule(rule) {
            if (typeof rule === "string" && !rule.startsWith("/")) {
                return {
                    optional: rule.startsWith("?"),
                    applied_to_items_of_type: "file",
                    name_rule: rule.replace("?", ""),
                    content_rules: []
                };
            }
            else {
                var _a = parseRule(rule), isOptional = _a.isOptional, dir_name = _a.dir_name, _b = _a.dir_content_rules, dir_content_rules = _b === void 0 ? [] : _b;
                return {
                    optional: isOptional,
                    applied_to_items_of_type: "dir",
                    name_rule: dir_name,
                    content_rules: dir_content_rules.map(parseYamlRule)
                };
            }
            function parseRule(rule) {
                if (typeof rule === "string") {
                    var dir_name_1 = rule.replace("/", "");
                    return {
                        isOptional: dir_name_1.startsWith("?"),
                        dir_name: dir_name_1.replace("?", "")
                    };
                }
                var key = Object.keys(rule)[0];
                var dir_name = key.replace("/", "");
                var isOptional = dir_name.startsWith("?");
                return {
                    isOptional: isOptional,
                    dir_name: dir_name.replace("?", ""),
                    //@ts-ignore
                    dir_content_rules: rule[key]
                };
            }
        }
    }
}
exports.analyse_directory = analyse_directory;
function _evaluate_rule(item, rule) {
    var dir_path = item.item_path;
    var isOptional = rule.optional, applied_to_items_of_type = rule.applied_to_items_of_type;
    var items_in_directory = (0, get_items_in_directory_1.get_items_in_directory)(dir_path);
    var items_that_passed_the_name_rule = _get_items_that_passes_name_rule(items_in_directory.filter(function (item) { return item.item_type === applied_to_items_of_type; }), rule);
    if (items_that_passed_the_name_rule.length === 0) {
        return isOptional
            ? {
                item: item,
                rule: rule,
                analysis: {
                    missing_items: [],
                    incorrect_items: [],
                    extraneous_items: []
                }
            }
            : {
                item: item,
                rule: rule,
                analysis: {
                    missing_items: [rule],
                    incorrect_items: [],
                    extraneous_items: []
                }
            };
    }
    function does_item_pass_name_rule(_a) {
        var item = _a.item, rule = _a.rule;
        return _get_items_that_passes_name_rule([item], rule).length === 1;
    }
    var items_with_invalid_content = items_that_passed_the_name_rule
        .map(function (item) {
        var invalid_content_rules = rule.content_rules
            .map(function (r) { return _evaluate_rule(item, r); })
            .filter(function (i) { return (0, exports.is_invalid_analysis)(i); });
        var missing_items = invalid_content_rules.flatMap(function (_a) {
            var item = _a.item, rule = _a.rule, analysis = _a.analysis;
            return analysis.missing_items;
        });
        var incorrect_items = invalid_content_rules.flatMap(function (_a) {
            var item = _a.item, rule = _a.rule, analysis = _a.analysis;
            return analysis.incorrect_items;
        });
        var extraneous_items = item.item_type === "file"
            ? []
            : (0, get_items_in_directory_1.get_items_in_directory)(item.item_path).filter(function (item) {
                if (isDirRuleItem(item)) {
                    return false;
                }
                if (rule.content_rules.length === 0) {
                    return false;
                }
                // does not match any name rule. therefore it has no place in directory
                var no_rule_matches = rule.content_rules.some(function (rule) {
                    return does_item_pass_name_rule({ item: item, rule: rule });
                });
                return !no_rule_matches;
            });
        return {
            item: item,
            rule: rule,
            analysis: {
                missing_items: missing_items,
                incorrect_items: incorrect_items,
                extraneous_items: extraneous_items
            }
        };
    })
        .filter(function (i) {
        //@ts-ignore
        return (0, exports.is_invalid_analysis)(i);
    });
    return {
        item: item,
        rule: rule,
        analysis: {
            missing_items: [],
            incorrect_items: items_with_invalid_content,
            extraneous_items: []
        }
    };
    function isDirRuleItem(item) {
        return (item.item_type === "file" && item.item_path.endsWith(".dirrules.yaml"));
    }
    /**
     * Determines if a given item rule is violated or not
     * An item rule consists of 2 parts:
     * - part 1: existence rule. Does a certain item exist in the directory
     * - part 2: content rule. What the items that passed the name rule should contain
     * @param dir_path
     * @param rule
     */
    /**
     * determines if a directory passes a given file rule
     * - A file rule is requirement that a certain file is in the directory
     * @param items
     * @param rule
     */
    function _get_items_that_passes_name_rule(items, rule) {
        var rule_type = rule.name_rule.includes("<camelCase>")
            ? "camelCase"
            : rule.name_rule.includes("<PascalCase>")
                ? "PascalCase"
                : rule.name_rule.includes("<NameOfParentDir>")
                    ? "NameOfParentDir"
                    : rule.name_rule === "*"
                        ? "*"
                        : "specific_file_name";
        switch (rule_type) {
            case "specific_file_name": {
                // This rule is restrictive: we need a specific file with a given name
                return items.filter(function (i) { return path.basename(i.item_path) === rule.name_rule; });
            }
            case "*": {
                return items;
            }
            // starts with Capital letter
            case "PascalCase": {
                var regex_1 = rule.name_rule
                    .split("<PascalCase>")
                    .map(escapeRegex)
                    .join("<PascalCase>")
                    .replace("<PascalCase>", "[A-Z]([A-Z0-9]*[a-z][a-z0-9]*)[A-Za-z0-9]*");
                var passed_1 = function (name) { return new RegExp(regex_1).test(name); };
                return items.filter(function (i) {
                    var base = path.basename(i.item_path);
                    return passed_1(base);
                });
            }
            case "camelCase": {
                var regex_2 = rule.name_rule
                    .split("<camelCase>")
                    .map(escapeRegex)
                    .join("<camelCase>")
                    .replace("<camelCase>", "[A-Za-z]([A-Z0-9]*[a-z][a-z0-9]*)[A-Za-z0-9]*");
                var passed_2 = function (name) { return new RegExp(regex_2).test(name); };
                return items.filter(function (i) {
                    var base = path.basename(i.item_path);
                    return passed_2(base);
                });
            }
            case "NameOfParentDir": {
                var expected_item_name_1 = rule.name_rule.replace("<NameOfParentDir>", path.basename(dir_path));
                return items.filter(function (i) {
                    return path.basename(i.item_path) === expected_item_name_1;
                });
            }
            default: {
                throw new Error("rule_type ".concat(rule_type, " does not exist"));
            }
        }
    }
}
