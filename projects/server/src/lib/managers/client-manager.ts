import List from '@core/list'
import Client from '@lib/client'

export class ClientManager extends List<Client> {
   byPlayerMp (player: PlayerMp): Client | null {
     let foundClient = null

     super.items.forEach((client: Client) => {
       if (client.player == player) {
         foundClient = client
       }
     })

     return foundClient
   }

   removeByPlayerMp (player: PlayerMp): void {
     const client = this.byPlayerMp(player)

     if (client) {
       this.remove(client)
     }
   }

   sendMessage (...args: any[]) {
     super.items.forEach((client: Client) => {
       client.sendMessage(...args)
     })
   }
}
