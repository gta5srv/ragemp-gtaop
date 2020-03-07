export default class Manager<T> {
  protected _items: Array<T> = []

  get items () {
    return this._items
  }

  add (...args: T[]): void {
    let items = [ ...args ]
    items.forEach((item: T) => {
      if (this._items.indexOf(item) === -1) {
        this._items.push(item)
      }
    })
  }

  remove (item: T): void {
    let itemIndex = this._items.indexOf(item)

    if (itemIndex === -1) {
      return
    }

    delete this._items[itemIndex]
  }
}
