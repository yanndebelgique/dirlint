#! /usr/bin/env node
import { analyse_and_report } from "./src/analyse_directory/analyse_and_report";

const fs = require("fs");
const path = require("path");
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const packageJson = require(path.join(__dirname, '../package.json'));

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 <directory>')
  .command('$0 <directory>', 'Validate directory structure', (yargs: any) => {
    yargs.positional('directory', {
      describe: 'Path to the directory to validate',
      type: 'string'
    });
  })
  .example('$0 ./src/components', 'Validate the components directory')
  .example('$0 .', 'Validate the current directory')
  .version(packageJson.version)
  .alias('v', 'version')
  .help('h')
  .alias('h', 'help')
  .epilogue('For more information, visit: https://github.com/yanndebelgique/dirlint')
  .argv;

function run() {
  const dirPath = argv.directory || argv._[0];

  if(!dirPath){
    console.error('Error: Please provide a path to the directory you want to validate!');
    console.log('\nUsage: dirlint <directory>');
    console.log('Try "dirlint --help" for more information.');
    process.exit(1);
  }

  if(!fs.existsSync(dirPath)){
    console.error(`Error: The path "${dirPath}" does not exist!`);
    process.exit(1);
  }

  analyse_and_report({dirPath})
}

run();

