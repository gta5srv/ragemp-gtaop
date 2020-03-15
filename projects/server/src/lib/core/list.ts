export default class List<T> implements Iterable<T> {
  protected _items: T[] = []

  get items (): T[] {
    return this._items
  }

  get count () {
    return this._items.length
  }

  public add (...args: T[]): boolean {
    const newItems = [ ...args ]
    const count = this.count

    newItems.forEach((newItem: T) => {
      if (this._items.indexOf(newItem) === -1) {
        this._items.push(newItem)
      }
    })

    return this.count !== count
  }

  public remove (item: T): boolean {
    const itemIndex = this._items.indexOf(item)
    const count = this.count

    this._items = this._items.filter((_item: T, i) => {
      return i !== itemIndex
    })

    return this.count !== count
  }

  public contains (item: T): boolean {
    return this._items.indexOf(item) !== -1
  }

  public [Symbol.iterator](): Iterator<T> {
    let count = 0
    return {
      next: (): IteratorResult<T> => {
        return {
          done: count === (this._items.length - 1),
          value: this._items[count++]
        }
      }
    }
  }
}
