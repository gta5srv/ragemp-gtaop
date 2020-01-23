import Client from '@lib/client'

export default class ClientFactory {
   constructor () {
     this._list = []
   }

   get all () {
     return this._list
   }

   byPlayer (player) {
     let client = null

     this._list.forEach(singleClient => {
       if (singleClient.player == player) {
         client = singleClient
       }
     })

     return client
   }

   add (player) {
     if (!this.byPlayer(player)) {
       this._list.push(new Client(player))
       console.log('Adding ' + player.name)
     }
   }

   remove (player) {
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

   sendMessage () {
     this._list.forEach(client => client.sendMessage(...arguments))
   }
}
