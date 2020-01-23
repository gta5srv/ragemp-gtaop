import Client from '@lib/client'

export default class ClientFactory {
   constructor () {
     this.list = []
   }

   byPlayer (player) {
     let client = null

     this.list.forEach(singleClient => {
       if (singleClient.player == player) {
         client = singleClient
       }
     })

     return client
   }

   add (player) {
     if (!this.byPlayer(player)) {
       this.list.push(new Client(player))
       console.log('Adding ' + player.name)
     }
   }

   remove (player) {
     const client = this.byPlayer(player)
     if (!client) {
       return
     }

     console.log('Removing ' + player.name)
     const clientIndex = this.list.indexOf(client)
     delete this.list[clientIndex]
   }

   spawn (player) {
     let client = this.byPlayer(player)
     
     if (client) {
       client.spawn()
     }
   }
}
