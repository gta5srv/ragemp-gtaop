import fs from 'fs';
import Rectangle from "@lib/algebra/rectangle";

export default class HeightMap {
  private _file: string
  private _area: Rectangle

  constructor (file: string, area: Rectangle) {
    this._file = file
    this._area = area
  }

  get file () {
    return this._file
  }

  get area () {
    return this._area
  }

  getZ (v: Vector3Mp, cb: Function): void {
    fs.open(this._file, 'r', (err: NodeJS.ErrnoException | null, fd: number) => {
        if(err) {
          cb(0)
          return console.error(err);
        }

        const LENGTH = 4

        let buffer = Buffer.alloc(LENGTH)

        let x = Math.floor(v.x) - Math.floor(this._area.x.min)
        let y = Math.floor(this._area.x.total()) * (Math.floor(v.y) - Math.floor(this._area.y.min))

        let start = (y + x) * LENGTH

        fs.read(fd, buffer, 0, LENGTH, start, (err: any, _num: any) => {
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
