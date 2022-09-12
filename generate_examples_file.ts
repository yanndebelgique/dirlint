import { execSync } from 'child_process'
import * as path from "path";
const fs = require('fs')
/**
 * For each example dirrule it will run the case suite
 * Format is:
 * ```
 * case <number>:
 * <dirrule content>
 *
 * <directory structure>
 *
 * <dirlint output>
 * ```
 */
function pretty_print(path: string) {
  return path.replace(__dirname, '')
    .replace('/test_directories', '')
    .replace('test_directories', '')
}
function generate_example_file(example_dir_path: string) {
  const cases = fs.readdirSync(example_dir_path).filter((dir_name: string) => {
    return dir_name.startsWith('case')
  });
  const dirrule_content = fs.readFileSync(`${example_dir_path}/.dirrules.yaml`, 'utf8');
  const cases_text = cases.map((case_dir_path: string) => {
    return generate_case_segment(path.join(__dirname, example_dir_path, case_dir_path));
  }).join('\n\n')

  return `## Example ${pretty_print(example_dir_path).trim()}:
.dirrules.yaml
\`\`\`.dirrules.yaml
${dirrule_content.trim()}
\`\`\`
${cases_text}`.trim()
}

function generate_case_segment(case_dir_path: string) {
  const tree_structure = execSync(`tree -a ${case_dir_path}`).toString('utf8');
  let dirlint_output
  try {
    dirlint_output = execSync(`dirlint ${case_dir_path}`).toString('utf8');
  } catch (error: any) {
    dirlint_output = error?.stdout?.toString('utf8')
  }

  return `
### case ${pretty_print(case_dir_path).trim()}: 
\`\`\` directory structure
${pretty_print(tree_structure).trim()}
\`\`\`

\`\`\` dirlint output 
> dirlint ${pretty_print(case_dir_path).trim()}
${pretty_print(dirlint_output).trim()} 
\`\`\`
  `.trim()
}

function generate_examples_file(dir: string) {
  const example_dirs = fs.readdirSync(dir).filter((dir_name: string) => {
    return dir_name.startsWith('example')
  })
  const example_files = example_dirs.map((example_dir: string) => {
    return generate_example_file(path.join(dir, example_dir))
  }).join('\n\n')
  return example_files
}

function generate_and_save_examples_file(dir: string) {
  const examples_file = generate_examples_file(dir)
  fs.writeFileSync('./EXAMPLES.md', `AUTOGENERATED FILE SEE ${__filename} \n\n` + examples_file)
}

generate_and_save_examples_file('./test_directories')