import fs from 'fs';
import path from 'path';

export default class FSHelper {
  static rootDirectory?: string

  static path (_path: string): string {
    return path.join(FSHelper.rootDirectory || '', _path)
  }

  static appendFile (file: string, append: any, cb: Function): void {
    fs.readFile(file, 'utf-8', (err: NodeJS.ErrnoException | null, data: string) => {
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
