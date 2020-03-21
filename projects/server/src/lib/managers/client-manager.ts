import List from '@core/list';
import Client from '@lib/client';

export class ClientManager extends List<Client> {
   public byPlayerMp (player: PlayerMp): Client | null {
     let foundClient = null;

     super.items.forEach((client: Client) => {
       if (client.mp == player) {
         foundClient = client;
       }
     })

     return foundClient;
   }

   public removeByPlayerMp (player: PlayerMp): void {
     const client = this.byPlayerMp(player);

     if (client) {
       this.remove(client);
     }
   }

   public sendMessage (...args: any[]): void {
     super.items.forEach((client: Client) => {
       client.sendMessage(...args);
     });
   }

   public call (eventName: string, ...args: any[]) {
     super.items.forEach((client: Client) => client.call(eventName, ...args));
   }
}
