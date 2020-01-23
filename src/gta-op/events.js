module.exports = (server) => {
  mp.events.add('playerDeath', function (player, reason, killer) {

     let respawnTimer = setTimeout(() => {
       server.clients.spawn(player)
     }, 3000)
  })

  mp.events.add('playerCreateWaypoint', (player, position) => {
    let coords = JSON.parse(position)

    server.getZ(coords, z => {
      if (!z) {
        console.error('Invalid z coordinate given')
        return
      }

      console.log('Setting pos to', new mp.Vector3(coords.x, coords.y, z))
      player.position = new mp.Vector3(coords.x, coords.y, z + 0.5)
    })

    console.log('playerCreateWaypoint', player, coords)
  })

  mp.events.add('playerJoin', player => {
    server.clients.add(player)
  })

  mp.events.add('playerQuit', player => {
    server.clients.remove(player)
  })

  mp.events.add('playerReady', player => {
    server.clients.spawn(player)
  })
}
