import Client from '@lib/client'
import Manager from '@core/manager';

export default class ClientManager extends Manager<Client> {
   byPlayerMp (player: PlayerMp): Client | null {
     let foundClient = null

     super.items.forEach((client: Client) => {
       if (client.player == player) {
         foundClient = client
       }
     })

     return foundClient
   }

   sendMessage (...args: any[]) {
     super.items.forEach((client: Client) => {
       client.sendMessage(...args)
     })
   }
}
