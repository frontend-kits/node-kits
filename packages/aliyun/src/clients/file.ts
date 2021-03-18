import fs from 'fs'
import path from 'path'

export function getLocalFiles(fpath: string) {
    if (!fs.statSync(fpath).isDirectory()) {
        return fpath
    }
    const files = fs.readdirSync(fpath)
    const filenames = [] as string[]
    for (const file of files) {
        const fname = path.join(fpath, file)
        if (fs.statSync(fname).isDirectory()) {
            filenames.push(...getLocalFiles(fname))
        } else {
            filenames.push(fname)
        }
    }
    return filenames
}

export function deleteLocalFiles(fpath: string) {
    var files = [];
    //判断给定的路径是否存在
    if(fs.existsSync(fpath) ) {
        //返回文件和子目录的数组
        files = fs.readdirSync(fpath);
         
        files.forEach(function(file,index){
           // var curPath = url + "/" + file;
            var curPath = path.join(fpath,file);
            //fs.statSync同步读取文件夹文件，如果是文件夹，在重复触发函数
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteLocalFiles(curPath);
                 
            // 是文件delete file  
            } else {
                fs.unlinkSync(curPath);
            }
        })
        fs.rmdirSync(fpath);
    }else{
        console.log("给定的路径不存在，请给出正确的路径");
    }
}