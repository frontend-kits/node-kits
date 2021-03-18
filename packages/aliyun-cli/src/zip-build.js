
var fs = require("fs");
var path = require("path");
const compressing = require('compressing')
const { deleteLocalFiles } = require('@node-kits/aliyun')

const args = process.argv.slice(2)
const [buildType] = args

const prod = buildType === 'prod'

const rootDir = './build/bundle'
if (fs.existsSync(rootDir)) {
    deleteLocalFiles(rootDir)
}
fs.mkdirSync(rootDir)
fs.mkdirSync(rootDir + '/build')
fs.mkdirSync(rootDir + '/config')


function copyFilesSync(files) {
    for (const file of files) {
        if (!fs.existsSync(file)) {
            continue
        }
        console.log(fs.existsSync(file), path.resolve(file), path.resolve(rootDir, file))
        fs.copyFileSync(path.resolve(file), path.resolve(rootDir, file))
    }
}
copyFilesSync([
    './package.json',
    './build/index.js',
    './config/aliyun.toml',
    './config/auth.toml',
    './config/proxy.toml',
])

compressing.zip.compressDir(rootDir, rootDir + '.zip').then(() => {
    if (prod) {
        deleteLocalFiles(rootDir)
        fs.unlinkSync('./build/index.js');
    }
})

