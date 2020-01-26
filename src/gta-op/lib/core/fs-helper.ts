const fs = require('fs')
const path = require('path')

export default class FSHelper {
  static rootDirectory = null

  static path (_path) {
    return path.join(FSHelper.rootDirectory || '', _path)
  }

  static appendFile (file, append, cb) {
    fs.readFile(file, (err, data) => {
      if (err) {
        data = ''
      }

      fs.writeFile(file, data + append, (err) => {
          if(err) {
              return cb(err)
          }

          cb()
      })
    })
  }
}
