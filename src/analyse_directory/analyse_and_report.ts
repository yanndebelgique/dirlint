import { analyse_directory, is_invalid_analysis } from "./index";
import { make_analysis_readable } from "../make_analysis_readable";

/**
 * Responsible for printing to console and exiting the program with the right code
 * @param dirPath
 */
export function analyse_and_report({ dirPath }: { dirPath: string }) {
  const dir_structure_analysis = analyse_directory(dirPath);
  if (is_invalid_analysis(dir_structure_analysis)) {
    const readable_analysis = make_analysis_readable({
      dirPath,
      analysis: dir_structure_analysis
    });
    console.log(JSON.stringify(readable_analysis, null, 2));
    console.log("invalid dir structure!");
    process.exit(1);
  } else {
    console.log("valid!");
    process.exit(0);
  }
}
