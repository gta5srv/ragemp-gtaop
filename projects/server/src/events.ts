import Server from '@core/server'
import Client from '@lib/client'

Server.addEvent('playerDeath', (client: Client, reason: any, killer: any) => {
   client.spawn(5000)
})

Server.addEvent('playerCreateWaypoint', (client: Client, position: string) => {
  let coords = JSON.parse(position)

  Server.heightMap.getZ(coords, (z: number) => {
    if (!z) {
      console.error('Invalid z coordinate given')
      return
    }

    console.log('Setting pos to', new mp.Vector3(coords.x, coords.y, z))
    client.position = new mp.Vector3(coords.x, coords.y, z + 0.5)
  })

  console.log('playerCreateWaypoint', client, coords)
})

Server.addEvent('playerReady', (client: Client) => {
  client.spawn()
})
