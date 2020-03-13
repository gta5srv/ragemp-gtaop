import Interval from './interval'

export default class Rectangle {
  x: Interval
  y: Interval

  constructor (vx: Interval, vy: Interval) {
    this.x = vx
    this.y = vy
  }
}
