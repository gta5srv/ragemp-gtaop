export default class Util {
  static isNumeric(n: any): boolean {
    return !isNaN(parseFloat(n)) && isFinite(n)
  }
}
