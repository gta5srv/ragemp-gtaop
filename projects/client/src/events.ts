mp.events.add('loadInteriorProps', (position: Vector3Mp, props: string[]) => {
  const interiorID = mp.game.interior.getInteriorAtCoords(position.x, position.y, position.z)

  props.forEach((prop) => {
    mp.game.interior.enableInteriorProp(interiorID, prop)
  })
})


/**
 * A workaround for PlayerCreateWaypoint event
 */
let waypoint: any

mp.events.add('render', () => {
  if (waypoint !== mp.game.invoke('0x1DD1F58F493F1DA5')) {
    waypoint = mp.game.invoke('0x1DD1F58F493F1DA5')

    let blipIterator = mp.game.invoke('0x186E5D252FA50E7D')
    let FirstInfoId = mp.game.invoke('0x1BEDE233E6CD2A1F', blipIterator)
    let NextInfoId = mp.game.invoke('0x14F96AA50D6FBEA7', blipIterator)

    for (let i = FirstInfoId; mp.game.invoke('0xA6DB27D19ECBB7DA', i) != 0; i = NextInfoId) {
      if (mp.game.invoke('0xBE9B0959FFD0779B', i) == 4 ) {
        var coord = mp.game.ui.getBlipInfoIdCoord(i)
        coord.z = 0

        mp.events.call('playerCreateWaypoint', coord)
        mp.events.callRemote('playerCreateWaypoint', JSON.stringify(coord))
      }
    }
  }
})
