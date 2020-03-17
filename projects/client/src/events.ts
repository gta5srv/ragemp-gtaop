import Zone from "@lib/zone";
import Team from "@lib/team";
import Vehicle from "@lib/vehicle";

mp.events.add('loadInteriorProps', (position: Vector3Mp, props: string[]) => {
  const interiorID = mp.game.interior.getInteriorAtCoords(position.x, position.y, position.z);

  props.forEach((prop) => {
    if (mp.game.interior.isInteriorPropEnabled(interiorID, prop)) {
      return true;
    }

    mp.game.interior.enableInteriorProp(interiorID, prop);
  });
});


mp.events.add("playerEnterVehicle", (vehicle: VehicleMp, seat) => {
	vehicle.setInvincible(false);
});


/**
 * A workaround for PlayerCreateWaypoint event
 */
let waypoint: any

mp.events.add('render', () => {
  if (waypoint !== mp.game.invoke('0x1DD1F58F493F1DA5')) {
    waypoint = mp.game.invoke('0x1DD1F58F493F1DA5');

    let blipIterator = mp.game.invoke('0x186E5D252FA50E7D');
    let FirstInfoId = mp.game.invoke('0x1BEDE233E6CD2A1F', blipIterator);
    let NextInfoId = mp.game.invoke('0x14F96AA50D6FBEA7', blipIterator);

    for (let i = FirstInfoId; mp.game.invoke('0xA6DB27D19ECBB7DA', i) != 0; i = NextInfoId) {
      if (mp.game.invoke('0xBE9B0959FFD0779B', i) == 4 ) {
        var coord = mp.game.ui.getBlipInfoIdCoord(i);
        coord.z = 0;

        mp.events.call('playerCreateWaypoint', coord);
        mp.events.callRemote('playerCreateWaypoint', JSON.stringify(coord));
      }
    }
  }
});

mp.events.add('teamsAdd', (teamsData: string) => {
  const teams = JSON.parse(teamsData);
  if (!Array.isArray(teams)) {
    return;
  }

  teams.forEach((teamData: EventData.teamAdd) => {
    if (Team.all.bySlug(teamData.slug)) {
      return;
    }

    mp.gui.chat.push(`team add "${teamData.slug}"`);

    const teamVehicles = teamData.vehicleIds.map((vehicleId: number) => {
      const foundVehicle = Vehicle.all.byRemoteId(vehicleId);
      return foundVehicle ? foundVehicle : new Vehicle(mp.vehicles.atRemoteId(vehicleId));
    })

    new Team(
      teamData.slug,
      teamData.name,
      teamData.blipColor,
      teamVehicles
    );
  })
})

mp.events.add('zonesAdd', (zonesData: string) => {
  const zones = JSON.parse(zonesData);
  if (!Array.isArray(zones)) {
    return;
  }

  zones.forEach((zone: EventData.zoneAdd) => {
    if (Zone.all.bySlug(zone.slug)) {
      return;
    }

    // mp.gui.chat.push(`zone add "${zone.slug}"`);

    const zonePosition = new mp.Vector3(
      zone.position.x,
      zone.position.y,
      zone.position.z
    );

    const zoneOwner = zone.owner ? Team.all.bySlug(zone.owner) : null;

    const zoneVehicles = zone.vehicleIds.map((vehicleId: number) => {
      const foundVehicle = Vehicle.all.byRemoteId(vehicleId);
      return foundVehicle ? foundVehicle : new Vehicle(mp.vehicles.atRemoteId(vehicleId));
    });

    new Zone(
      zone.slug,
      zone.name,
      zonePosition,
      zone.state,
      zoneOwner,
      zoneVehicles
    );
  });
});

mp.events.add('zoneUpdate', (zoneUpdateData: string) => {
  const zoneUpdate = JSON.parse(zoneUpdateData);
  if (!zoneUpdate) {
    return;
  }

  mp.gui.chat.push(`zone state change "${zoneUpdate.slug}" (${Zone.State[zoneUpdate.state]})`);

  const zone = Zone.all.bySlug(zoneUpdate.slug);
  if (zone) {
    mp.gui.chat.push(`zone state change "${zoneUpdate.slug}" CONFIRM`);

    zone.state = zoneUpdate.state;
    zone.owner = zoneUpdate.owner ? Team.all.bySlug(zoneUpdate.owner) : null;
  }
});

mp.events.add('vehiclesAdded', (vehiclesDataJSON: string) => {
  mp.gui.chat.push('Trying to add vehicles')
  const vehiclesData = JSON.parse(vehiclesDataJSON);
  if (!Array.isArray(vehiclesData)) {
    return;
  }

  mp.gui.chat.push("Vehicles added")
  vehiclesData.forEach((vehicleData: EventData.vehicleAdd) => {
    if (Vehicle.all.byRemoteId(vehicleData.id)) {
      return;
    }

    const vehicleMp = mp.vehicles.atRemoteId(vehicleData.id);
    if (vehicleMp) {
      new Vehicle(vehicleMp);
      mp.gui.chat.push("Vehicle added")
    }
  })
})

namespace EventData {
  export interface teamAdd {
    slug: string;
    name: string;
    blipColor: number;
    vehicleIds: number[];
  }

  export interface zoneAdd {
    slug: string;
    name: string;
    position: Vector3Mp;
    state: Zone.State;
    owner: string|null;
    vehicleIds: number[];
  }

  export interface zoneUpdate {
    slug: string;
    state: number;
    owner: string|null;
  }

  export interface vehicleAdd {
    id: number;
  }
}
