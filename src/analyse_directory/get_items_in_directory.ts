const fs = require("fs");
const path = require("path");

export interface FileSystemItem { item_path: string, item_type: 'file' | 'dir' }

export function get_items_in_directory(directory_path: string): FileSystemItem[] {
  const items = fs.readdirSync(directory_path);
  const item_paths = items.map((item:string):string => path.join(directory_path, item));
  return item_paths.map((item_path:string) => {
    return {
      item_path: item_path,
      item_type: fs.lstatSync(item_path).isFile() ? 'file' : 'dir'
    };
  });
}
