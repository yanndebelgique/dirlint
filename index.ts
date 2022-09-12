#! /usr/bin/env node
import { analyse_and_report } from "./src/analyse_directory/analyse_and_report";

const fs = require("fs");

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
  analyse_and_report({dirPath})
}

run();

