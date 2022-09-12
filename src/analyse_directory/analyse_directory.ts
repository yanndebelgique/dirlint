const yaml = require("js-yaml");
import {
  FileSystemItem,
  get_items_in_directory,
} from "./get_items_in_directory";

import * as path from "path";
import * as fs from "fs";

export interface Analysis {
  item: FileSystemItem;
  rule?: Rule;
  analysis: {
    missing_items: Rule[];
    incorrect_items: Analysis[];
    extraneous_items: FileSystemItem[];
  };
}

interface Rule {
  optional: boolean;
  applied_to_items_of_type: "file" | "dir";
  name_rule: string;
  name_rule_violated?: boolean;
  content_rules: Rule[];
  content_rules_violated?: boolean;
}

function escapeRegex(string: string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

export const is_invalid_analysis = ({ analysis }: Analysis) => {
  const { missing_items, incorrect_items, extraneous_items } = analysis;
  return (
    missing_items.length !== 0 ||
    incorrect_items.length !== 0 ||
    extraneous_items.length !== 0
  );
};

function unpackAnalysis(analysis: Analysis): Analysis {
  const is_valid = (a: Analysis) => !is_invalid_analysis(a);
  if (is_valid(analysis)) {
    return analysis;
  }
  if (
    analysis.analysis.incorrect_items.length !== 1 ||
    analysis.analysis.missing_items.length !== 0
  ) {
    throw new Error("cannot unpack because you would loose info!");
  }
  return analysis.analysis.incorrect_items[0];
}

/**
 *
 * @param dir_path
 */
export function analyse_directory(dir_path: string): Analysis {
  return _iter_analyse_directory(dir_path);

  function _iter_analyse_directory(dir_path: string): Analysis {
    const source = {
      item_type: "dir" as FileSystemItem["item_type"],
      item_path: path.dirname(dir_path),
    };
    if (!_has_dir_rule_configured(dir_path)) {
      return {
        item: source,
        rule: undefined,
        analysis: {
          missing_items: [],
          incorrect_items: [],
          extraneous_items: [],
        },
      };
    }

    const rule = _parse_dir_rule_configuration(dir_path);
    return unpackAnalysis(_evaluate_rule(source, rule));
  }

  function _has_dir_rule_configured(dir_path: string): boolean {
    return fs.existsSync(path.join(dir_path, ".dirrules.yaml"));
  }

  function _parse_dir_rule_configuration(dir_path: string): Rule {
    const doc = yaml.load(
      fs.readFileSync(path.join(dir_path, ".dirrules.yaml"), "utf8")
    ) as Array<string | Object>;

    return {
      optional: false,
      applied_to_items_of_type: "dir",
      name_rule: path.basename(dir_path),
      content_rules: doc.map<Rule>(parseYamlRule),
    };

    function parseYamlRule(rule: string | Object): Rule {
      if (typeof rule === "string" && !rule.startsWith("/")) {
        return {
          optional: rule.startsWith("?"),
          applied_to_items_of_type: "file",
          name_rule: rule.replace("?", ""),
          content_rules: [],
        };
      } else {
        const {
          isOptional,
          dir_name,
          dir_content_rules = [],
        } = parseRule(rule);
        return {
          optional: isOptional,
          applied_to_items_of_type: "dir",
          name_rule: dir_name,
          content_rules: dir_content_rules.map(parseYamlRule),
        };
      }
      function parseRule(rule: Object | string) {
        if (typeof rule === "string") {
          const dir_name = rule.replace("/", "");
          return {
            isOptional: dir_name.startsWith("?"),
            dir_name: dir_name.replace("?", ""),
          };
        }
        const key = Object.keys(rule)[0];
        const dir_name = key.replace("/", "");

        const isOptional = dir_name.startsWith("?");
        return {
          isOptional,
          dir_name: dir_name.replace("?", ""),
          //@ts-ignore
          dir_content_rules: rule[key],
        };
      }
    }
  }
}

interface IsInvalidRuleOutput {
  missing_items: Rule[];
  incorrect_items?: {
    item: FileSystemItem;
    invalid_content?: IsInvalidRuleOutput;
  }[];
}

function _evaluate_rule(item: FileSystemItem, rule: Rule): Analysis {
  const { item_path: dir_path } = item;
  const { optional: isOptional, applied_to_items_of_type } = rule;

  const items_in_directory = get_items_in_directory(dir_path);
  const items_that_passed_the_name_rule = _get_items_that_passes_name_rule(
    items_in_directory.filter(
      (item) => item.item_type === applied_to_items_of_type
    ),
    rule
  );

  if (items_that_passed_the_name_rule.length === 0) {
    return isOptional
      ? {
          item,
          rule,
          analysis: {
            missing_items: [],
            incorrect_items: [],
            extraneous_items: [],
          },
        }
      : {
          item,
          rule,
          analysis: {
            missing_items: [rule],
            incorrect_items: [],
            extraneous_items: [],
          },
        };
  }

  function does_item_pass_name_rule({
    item,
    rule,
  }: {
    item: FileSystemItem;
    rule: Rule;
  }) {
    return _get_items_that_passes_name_rule([item], rule).length === 1;
  }

  const items_with_invalid_content = items_that_passed_the_name_rule
    .map((item) => {
      const invalid_content_rules = rule.content_rules
        .map((r) => _evaluate_rule(item, r))
        .filter((i) => is_invalid_analysis(i));

      const missing_items = invalid_content_rules.flatMap(
        ({ item, rule, analysis }) => analysis.missing_items
      );

      const incorrect_items = invalid_content_rules.flatMap(
        ({ item, rule, analysis }) => analysis.incorrect_items
      );
      const extraneous_items =
        item.item_type === "file"
          ? []
          : get_items_in_directory(item.item_path).filter((item) => {
              if (isDirRuleItem(item)) {
                return false;
              }
              if (rule.content_rules.length === 0) {
                return false;
              }
              // does not match any name rule. therefore it has no place in directory
              const no_rule_matches = rule.content_rules.some((rule) => {
                return does_item_pass_name_rule({ item, rule });
              });
              return !no_rule_matches;
            });

      return {
        item,
        rule,
        analysis: {
          missing_items: missing_items,
          incorrect_items: incorrect_items,
          extraneous_items,
        },
      };
    })
    .filter((i) => {
      return is_invalid_analysis(i);
    });

  return {
    item,
    rule,
    analysis: {
      missing_items: [],
      incorrect_items: items_with_invalid_content,
      extraneous_items: [],
    },
  };

  // Implementation
  function isDirRuleItem(item: FileSystemItem): boolean {
    return (
      item.item_type === "file" && item.item_path.endsWith(".dirrules.yaml")
    );
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
  function _get_items_that_passes_name_rule(
    items: FileSystemItem[],
    rule: Rule
  ): FileSystemItem[] {
    const rule_type = rule.name_rule.includes("<camelCase>")
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
        return items.filter(
          (i) => path.basename(i.item_path) === rule.name_rule
        );
      }
      case "*": {
        return items;
      }
      // starts with Capital letter
      case "PascalCase": {
        const regex = rule.name_rule
          .split("<PascalCase>")
          .map(escapeRegex)
          .join("<PascalCase>")
          .replace(
            "<PascalCase>",
            "[A-Z]([A-Z0-9]*[a-z][a-z0-9]*)[A-Za-z0-9]*"
          );
        const passed = (name: string) => new RegExp(regex).test(name);
        return items.filter((i) => {
          const base = path.basename(i.item_path);
          return passed(base);
        });
      }
      case "camelCase": {
        const regex = rule.name_rule
          .split("<camelCase>")
          .map(escapeRegex)
          .join("<camelCase>")
          .replace(
            "<camelCase>",
            "^[a-z][A-Za-z0-9]*"
          );

        const passed = (name: string) => {
          return !name.includes('_') && new RegExp(regex).test(name);
        }
        return items.filter((i) => {
          const base = path.basename(i.item_path);
          return passed(base);
        });
      }
      case "NameOfParentDir": {


        const expected_item_name = rule.name_rule.replace(
          "<NameOfParentDir>",
          path.basename(dir_path)
        );
        return items.filter((i) => {
          return path.basename(i.item_path) === expected_item_name;
        });
      }
      default: {
        throw new Error(`rule_type ${rule_type} does not exist`);
      }
    }
  }
}
