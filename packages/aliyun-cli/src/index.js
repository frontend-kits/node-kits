#!/usr/bin/env node

const { execFile } = require('child_process');
const path = require('path')
const args = process.argv.slice(2)

const SCRIPT_MAP = {
    'oss-push': path.join(__dirname, '/upload.js'),
    'fc-build': path.join(__dirname, '/fc-build.js'),
}

const scriptFile = SCRIPT_MAP[args[0]]
if (scriptFile) {
    console.log('start exec: ' + args[0])
    const execArgs = [scriptFile, ...args.slice(1)]
    execFile('node', execArgs,  (error, stdout, stderr) => {
        if (error) {
            console.error(error)
        }
        if (stderr) {
            console.error(stderr)
        }
        console.log(stdout);
    }) 
} else {
    console.log('unknow script name')
}