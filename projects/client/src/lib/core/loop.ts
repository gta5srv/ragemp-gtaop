export default class Loop {
  private _msRate: number
  private _timer: NodeJS.Timer|null = null
  private _lastRun: Date|null = null
  private _callback: (msSinceLastRun: number) => void
  private _callbackContext: any

  constructor (msRate: number, callback: (msSinceLastRun: number) => void, callbackContext: any = null) {
    this._msRate = msRate
    this._callback = callback
    this._callbackContext = callbackContext

    this.start()
  }

  public start (): void {
    if (this._timer) {
      clearTimeout(this._timer)
      this._timer = null
    }

    this._timer = setTimeout(this.start.bind(this), this._msRate)

    let msElapsed = 0

    if (this._lastRun) {
      msElapsed = new Date().getTime() - this._lastRun.getTime()
    }

    this._lastRun = new Date()
    this._callback.call(this._callbackContext, msElapsed)
  }

  public stop (): void {
    if (!this._timer) {
      return
    }

    clearTimeout(this._timer)
    this._timer = null
  }
}
