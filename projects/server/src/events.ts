import Server from '@lib/server'
import Client from '@lib/client'

Server.addEvent('playerDeath', (client: Client, reason: any, killer: any) => {
   client.spawn(5000)
})

Server.addEvent('playerCreateWaypoint', (client: Client, position: string) => {
  let coords = JSON.parse(position)

  Server.heightMap.getZ(coords, (z: number) => {
    client.position = new mp.Vector3(coords.x, coords.y, z + 0.5)
  })
})

Server.addEvent('playerReady', (client: Client) => {
  client.spawn()
})
