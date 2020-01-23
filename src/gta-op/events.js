import Server from '@core/server'

Server.addEvent('playerDeath', (client, reason, killer) => {
   let respawnTimer = setTimeout(() => {
     client.spawn()
   }, 3000)
})

Server.addEvent('playerCreateWaypoint', (client, position) => {
  let coords = JSON.parse(position)

  Server.getZ(coords, z => {
    if (!z) {
      console.error('Invalid z coordinate given')
      return
    }

    console.log('Setting pos to', new mp.Vector3(coords.x, coords.y, z))
    client.position = new mp.Vector3(coords.x, coords.y, z + 0.5)
  })

  console.log('playerCreateWaypoint', client, coords)
})

Server.addEvent('playerReady', (client) => {
  client.spawn()
})
