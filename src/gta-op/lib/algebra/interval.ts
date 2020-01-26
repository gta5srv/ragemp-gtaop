export default class Interval {
  constructor (a, b) {
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
