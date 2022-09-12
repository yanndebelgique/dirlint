import { Analysis } from "./analyse_directory/analyse_directory";
import { FileSystemItem } from "./analyse_directory/get_items_in_directory";

interface Params {
  analysis: Analysis;
  dirPath: string;
  options?: {
    readability_level: "very" | "somewhat" | "standard";
  };
}

export function make_analysis_readable({
  analysis,
  dirPath,
  options,
}: Params): any {
  const { readability_level = "somewhat" } = options ?? {};
  const _make_analysis_readable = ({
    item,
    analysis,
  }: Analysis): {
    missing_items: any[];
    incorrect_items: any[];
    extraneous_items: any[];
    item: string;
  } => {
    const missing_items = analysis.missing_items.map((item) => {
      return item.name_rule;
    });

    const incorrect_items = analysis.incorrect_items.map((analysis) =>
      _make_analysis_readable(analysis)
    );
    // @ts-ignore
    return removeEmpty({
      item: printItem(item),
      missing_items,
      incorrect_items,
      extraneous_items: analysis.extraneous_items.map(printItem),
    });

    function removeEmpty(obj: any) {
      return Object.fromEntries(
        Object.entries(obj).filter(([_, val]) => {
          if (val === undefined) return false;
          if (val === null) return false;
          if (Array.isArray(val) && val.length === 0) return false;
          return true;
        })
      );
    }
    function printItem(item: FileSystemItem) {
      switch (readability_level) {
        case "very": {
          return `${item.item_type} ${item.item_path.replace(dirPath, "")}`;
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
  const _readable_analysis = _make_analysis_readable(analysis);
  return _readable_analysis;
}
