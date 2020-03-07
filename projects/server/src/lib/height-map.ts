const fs = require('fs')
import Rectangle from "./algebra/rectangle";

export default class HeightMap {
  file: string
  area: Rectangle

  constructor (file: string, area: Rectangle) {
    this.file = file
    this.area = area
  }

  getZ (v: Vector3Mp, cb: Function): void {
    fs.open(this.file, 'r', (err: any, fd: any) => {
        if(err) {
          cb(0)
          return console.error(err);
        }

        const LENGTH = 4

        let buffer = Buffer.alloc(LENGTH)

        let x = Math.floor(v.x) - Math.floor(this.area.x.min)
        let y = Math.floor(this.area.x.total()) * (Math.floor(v.y) - Math.floor(this.area.y.min))

        let start = (y + x) * LENGTH

        fs.read(fd, buffer, 0, LENGTH, start, (err: any, num: any) => {
          if (err) {
            cb(0)
            return
          }

          let z = buffer.readFloatLE(0)
          cb(z)
        })
    })
  }
}
