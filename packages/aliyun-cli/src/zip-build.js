
var fs = require("fs");
var path = require("path");
const compressing = require('compressing')
 
deleteFolderRecursive = function(url) {
    var files = [];
    //判断给定的路径是否存在
    if(fs.existsSync(url) ) {
        //返回文件和子目录的数组
        files = fs.readdirSync(url);
         
        files.forEach(function(file,index){
           // var curPath = url + "/" + file;
            var curPath = path.join(url,file);
            //fs.statSync同步读取文件夹文件，如果是文件夹，在重复触发函数
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
                 
            // 是文件delete file  
            } else {
                fs.unlinkSync(curPath);
            }
        })
        fs.rmdirSync(url);
    }else{
        console.log("给定的路径不存在，请给出正确的路径");
    }
};

const args = process.argv.slice(2)
const [buildType] = args

const prod = buildType === 'prod'

const rootDir = './build/bundle'
if (fs.existsSync(rootDir)) {
    deleteFolderRecursive(rootDir)
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
        deleteFolderRecursive(rootDir)
        fs.unlinkSync('./build/index.js');
    }
})

