const args = process.argv.slice(2)

const { uploadFiles } = require('@node-kits/aliyun')
const [uploadPath, uploadType] = args

if (!uploadPath) {
  console.error('notfound upload path')
  return
}

uploadFiles(uploadPath)

// const { aliyun } = config
// if (!aliyun) {
//   console.error('notfound aliyun config')
//   return
// }

// const { auth, oss } = aliyun

// const client = new OSS({
//   cname: true,
//   //云账号AccessKey有所有API访问权限，建议遵循阿里云安全最佳实践，部署在服务端使用RAM子账号或STS，部署在客户端使用STS。
//   accessKeyId: auth.accessKeyId,
//   accessKeySecret: auth.accessKeySecret,
//   bucket: oss.bucket,
//   endpoint: oss.endpoint,
//   secure: true, // (secure: true)则使用HTTPS，(secure: false)则使用HTTP
// })

// async function put(target, file) {
//   try {
//     //object-name可以自定义为文件名（例如file.txt）或目录（例如abc/test/file.txt）的形式，实现将文件上传至当前Bucket或Bucket下的指定目录。
//     const result = await client.put(target, file)
//     console.log('Upload Success: ' + result.name)
//   } catch (e) {
//     console.error(e)
//   }
// }
// function uploadFile(target, pathname) {
//   if (oss.package) {
//     target = `/${oss.package}/${target}`
//   }
//   put(target, pathname)
// }
// function uploadDir(dir) {
//   fs.readdirSync(dir).forEach(function(file) {
//     var pathname = path.join(dir, file)
//     if (fs.statSync(pathname).isDirectory()) {
//       uploadDir(pathname)
//     } else {
//       const filename = pathname.replace('\\', '/');
//       const curDir = filename.split(/(^.*?\/)/)[1]
//       let target = filename.split(curDir)[1]
//       uploadFile(target, pathname)
//     }
//   })
// }

// if (uploadType === '-f') {
//   const filename = uploadPath.replace('\\', '/');
//   const m = filename.split('/')
//   const target = m[m.length - 1]
//   uploadFile(target, uploadPath)
// } else {
//   uploadDir(uploadPath)
// }