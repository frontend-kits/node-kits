var fs = require("fs");
var path = require("path");
const { deleteLocalFiles } = require('@node-kits/aliyun')
 
deleteLocalFiles(path.resolve("./node_modules/ali-oss"));