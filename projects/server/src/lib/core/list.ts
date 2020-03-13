export default class List<T> implements Iterable<T> {
  protected _items: T[] = []

  get items (): T[] {
    return this._items
  }

  public add (...args: T[]): void {
    const items = [ ...args ]

    items.forEach((item: T) => {
      if (this._items.indexOf(item) === -1) {
        this._items.push(item)
      }
    })
  }

  public remove (item: T): void {
    let itemIndex = this._items.indexOf(item)

    if (itemIndex === -1) {
      return
    }

    delete this._items[itemIndex]
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
