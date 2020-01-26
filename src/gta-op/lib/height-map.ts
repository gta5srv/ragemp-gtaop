export default class HeightMap {
  constructor (file, area) {
    this.file = file
    this.area = area
  }

  getZ (v, cb) {
    fs.open(this.file, 'r', (err, fd) => {
        if(err) {
          cb(0)
          return console.error(err);
        }

        const LENGTH = 4

        let buffer = Buffer.alloc(LENGTH)

        let x = parseInt(v.x) - parseInt(this.area.x.min)
        let y = parseInt(this.area.x.total()) * (parseInt(v.y) - parseInt(this.area.y.min))

        let start = (y + x) * LENGTH

        fs.read(fd, buffer, 0, LENGTH, start, (err, num) => {
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
