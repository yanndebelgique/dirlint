const fs = require("fs");
const path = require("path");

const isDirectory = (file_path: string) => fs.lstatSync(file_path).isDirectory();

export function get_directories_in_directory(directory_path: string) {
  const files = fs.readdirSync(directory_path);
  const dir_paths = files
    .map((fn: string) => path.join(directory_path, fn))
    .filter(isDirectory);
  return dir_paths;
}
