import Client from "@lib/client";

export class WorldLocation {
  private _name: string
  private _position: Vector3Mp
  private _ipls: string[]
  private _interiorProps: string[]

  constructor (name: string, position: Vector3Mp,
               ipls: string[] = [], interiorProps: string[] = []) {
    this._name = name
    this._position = position
    this._ipls = ipls
    this._interiorProps = interiorProps
  }

  get name () {
    return this._name
  }

  get position () {
    return this._position
  }

  get ipls () {
    return this._ipls
  }

  get interiorProps () {
    return this._interiorProps
  }
}

export class WorldLocations {
  private static _list: WorldLocation[] = []

  static get all () {
    return this._list
  }

  public static byName (name: string): WorldLocation | null {
    let foundLocation: WorldLocation | null = null

    this._list.forEach((location: WorldLocation) => {
      if (location.name === name) {
        foundLocation = location
      }
    })

    return foundLocation
  }

  public static tp (client: Client, nameOrWorldLocation: string|WorldLocation): boolean {
    let location: WorldLocation | null = null

    if (nameOrWorldLocation instanceof WorldLocation) {
      location = nameOrWorldLocation
    } else {
      location = this.byName(String(nameOrWorldLocation))
    }

    if (location == null) {
      return false
    }


    location.ipls.forEach((ipl: string) => {
      mp.world.requestIpl(ipl)
    })

    client.loadWorldLocation(location)

    client.position = location.position
    return true
  }

  public static add (...worldLocations: WorldLocation[]) {
    this._list = this._list.concat(worldLocations)
  }
}

export default WorldLocations
