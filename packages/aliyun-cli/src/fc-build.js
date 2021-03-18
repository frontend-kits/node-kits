
const { execFileSync, execSync } = require('child_process');
const path = require('path')

const args = process.argv.slice(2)
const [buildType] = args
const subargs = args.slice(1)
const prod = buildType === 'prod'

const PATHS = {
    'clean': path.join(__dirname, '/clean.js'),
    'fix': path.join(__dirname, '/fix-alioss.js'),
    'zip': path.join(__dirname, '/zip-build.js'),
    'webpack': path.join(__dirname, '/webpackNode.config.js'),
}
// execFile('node', [PATHS.clean, ...subargs])

execFileSync('node', [PATHS.clean, ...subargs])
execFileSync('node', [PATHS.fix, ...subargs])
execSync('NODE_ENV=production webpack --config ' + PATHS.webpack)
execFileSync('node', [PATHS.zip, ...subargs])