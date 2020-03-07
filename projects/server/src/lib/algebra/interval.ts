export default class Interval {
  min: number
  max: number
  
  constructor (a: number, b: number) {
    if (a < b) {
      this.min = a
      this.max = b
    } else {
      this.min = b
      this.max = a
    }
  }

  total () {
    return this.max - this.min
  }
}
