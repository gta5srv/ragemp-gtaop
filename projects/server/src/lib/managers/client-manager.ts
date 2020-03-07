import Client from '@lib/client'

export default class ClientManager {
  _list: Array<Client>

   constructor () {
     this._list = []
   }

   get all () {
     return this._list
   }

   byPlayer (player: PlayerMp) {
     let client = null

     this._list.forEach(singleClient => {
       if (singleClient.player == player) {
         client = singleClient
       }
     })

     return client
   }

   add (player: PlayerMp) {
     if (!this.byPlayer(player)) {
       this._list.push(new Client(player))
       console.log('Adding ' + player.name)
     }
   }

   remove (player: PlayerMp) {
     const client = this.byPlayer(player)
     if (!client) {
       return
     }

     console.log('Removing ' + player.name)

     const clientIndex = this._list.indexOf(client)

     this._list = this._list.filter((listItem, listItemIndex) => {
       return listItemIndex != clientIndex
     })
   }

   sendMessage (...args: any[]) {
     this._list.forEach(client => client.sendMessage(...args))
   }
}
