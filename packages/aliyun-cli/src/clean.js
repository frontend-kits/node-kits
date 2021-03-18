var fs = require("fs");
var path = require("path");
const { deleteLocalFiles } = require('@node-kits/aliyun')

const rootDir = path.resolve('./build')
if (fs.existsSync(rootDir)) {
    deleteLocalFiles(rootDir)
}