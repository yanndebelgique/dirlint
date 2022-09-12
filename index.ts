#! /usr/bin/env node
const fs = require("fs");
import { analyse_directory , is_invalid_analysis } from "./src/analyse_directory";
import { make_analysis_readable } from "./src/make_analysis_readable";

const argv = require('yargs/yargs')(process.argv.slice(2)).argv;

function run() {
  const [first_arg, ...rest] =  argv._
  if(rest.length !== 0){
    console.log('too many arguments! Just pass the path to the directory you want to validate!')
    return;
  }
  if(!first_arg){
    console.log('please pass the path to the directory you want to validate!')
    return;
  }
  if(!fs.existsSync(first_arg)){
    console.log('the path you passed does not exist!')
    return;
  }

  const dirPath = first_arg;
  const dir_structure_analysis = analyse_directory(dirPath);

  if(is_invalid_analysis(dir_structure_analysis)){
    const readable_analysis = make_analysis_readable({
      dirPath,
      analysis: dir_structure_analysis
    });
    console.log(JSON.stringify(readable_analysis, null, 2))
    console.log('invalid dir structure!');
    process.exit(1)
  } else {
    console.log('valid!')
    process.exit(0)
  }
}

run();

