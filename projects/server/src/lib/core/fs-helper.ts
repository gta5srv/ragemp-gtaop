const fs = require('fs')
const path = require('path')

export default class FSHelper {
  static rootDirectory?: string

  static path (_path: string) {
    return path.join(FSHelper.rootDirectory || '', _path)
  }

  static appendFile (file: string, append: any, cb: Function) {
    fs.readFile(file, (err: any, data: string) => {
      if (err) {
        data = ''
      }

      fs.writeFile(file, data + append, (err: any) => {
          if(err) {
              return cb(err)
          }

          cb()
      })
    })
  }
}
