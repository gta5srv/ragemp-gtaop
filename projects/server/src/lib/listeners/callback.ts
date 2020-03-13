import * as Listeners from './'
import { Listener } from './'
import List from '@core/list'
import Util from '@core/util'
import Client from '@lib/client'

export default class Callback extends List<Listener<any>> {
  constructor () {
    super()

    this.init()
    this.register()
  }

  get subscribers () {
    return this.items
  }

  public addEvent (event: string,
                   subscriberCheckCb: (subscriber: Listener<any>) => boolean,
                   callback: Function, stripFirstParameter: boolean = true): void {
    mp.events.add(event, (...args: any[]) => {
      this.subscribers.forEach((subscriber: Listener<any>) => {
        if (!subscriberCheckCb(subscriber)) {
          return true
        }

        let params = Util.convertRageMPInstances(...args)
        if (stripFirstParameter) {
          params.shift() // Strip first argument
        }

        // Prepend issueing subscriber to parameters
        params.unshift(subscriber)
        callback(...params)
      })
    })
  }

  init () {
    mp.events.add('playerJoin', (player: PlayerMp) => {
      new Client(player)
    })

    mp.events.add('playerQuit', (player: PlayerMp) => {
      Client.all.removeByPlayerMp(player)
    })
  }

  register () {
    this.addEvent('playerReady', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener) => {
      subscriber.onClientReady()
    })

    this.addEvent('playerDeath', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener, reason: number, killer: Client) => {
      subscriber.onClientDeath(reason, killer)
    })

    this.addEvent('playerCreateWaypoint', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener, position: string) => {
      let coords = JSON.parse(position)
      subscriber.onClientCreateWaypoint(coords.x, coords.y)
    })
  }
}
