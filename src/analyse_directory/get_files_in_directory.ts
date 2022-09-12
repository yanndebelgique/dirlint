import { get_items_in_directory } from './get_items_in_directory'

export function get_files_in_directory(directory_path: string) {
  const _is_file = ({ item_type }: { item_type: string }) =>
    item_type === 'file'
  return get_items_in_directory(directory_path)
    .filter(_is_file)
    .map(({ item_path }) => item_path)
}
