import Types from '@core/types'
import Server from '@lib/server'
import FSHelper from '@core/fs-helper'
import Team from '@lib/team'
import Zone from '@lib/zone'
import { WorldLocations, WorldLocation } from '@lib/world-locations'

export default class Loader {
  static run (rootDirectory: string): void {
    FSHelper.rootDirectory = rootDirectory

    Loader.teams()
    Loader.zones()
    Loader.heightMap()
    Loader.worldLocations()
  }

  static team (info: Loader.TeamInfo): Team {
    const vehicleGroupManager = new Team.VehicleGroupManager()

    if (info.vehicles) {
      info.vehicles.forEach((vehGroup: Loader.VehicleGroupInfo[]) => {
        vehGroup.forEach((vehInfo: Loader.VehicleGroupInfo) => {
          const vehGroupSpawns: Types.Location[] = vehInfo.locations.map((l: Loader.LocationInfo) => {
            return {
              position: new mp.Vector3(l.position[0], l.position[1], l.position[2]),
              rotation: new mp.Vector3(l.rotation[1], l.rotation[1], l.rotation[2])
            }
          })

          const vehicleGroup: Team.VehicleGroup = {
            model: vehInfo.model,
            name: vehInfo.name,
            spawns: vehGroupSpawns,
            price: vehInfo.price
          }

          vehicleGroupManager.add(vehicleGroup)
        })
      })
    }

    const base = new mp.Vector3(info.base[0], info.base[1], info.base[2])
    const spawns = info.spawns.map((spawn: number[]) => {
      return new mp.Vector3(spawn[0], spawn[1], spawn[2])
    })

    return new Team(
      info.name,
      info.slug,
      base,
      info.blipColorID,
      info.vehicleColors,
      info.models,
      spawns,
      vehicleGroupManager
    )
  }

  static teams (): void {
    let teamsInfo = require('@config/teams').teams

    for (let teamSlug in teamsInfo) {
      let teamInfo = teamsInfo[teamSlug]
      teamInfo.slug = teamSlug

      Loader.team(teamInfo)
    }
  }

  static zones (): void {
    let zonesInfo = require('@config/zones').zones

    zonesInfo.forEach((zoneInfo: Loader.ZoneInfo) => {
      const zoneBase = new mp.Vector3(
        zoneInfo.position[0],
        zoneInfo.position[1],
        zoneInfo.position[2]
      )

      new Zone(
        zoneInfo.name,
        zoneBase,
        zoneInfo.group
      )
    })
  }

  static worldLocations (): void {
    let worldLocationsInfo = require('@config/world-locations').world_locations
    let worldLocations: WorldLocation[] = []

    worldLocationsInfo.forEach((worldLocationInfo: Loader.WorldLocationInfo) => {
      const worldLocationPosition = new mp.Vector3(
        worldLocationInfo.position[0],
        worldLocationInfo.position[1],
        worldLocationInfo.position[2]
      )

      const worldLocation = new WorldLocation(
        worldLocationInfo.name,
        worldLocationPosition,
        worldLocationInfo.ipls,
        worldLocationInfo.interior_props
      )

      worldLocations.push(worldLocation)
    })

    WorldLocations.add(...worldLocations)
  }

  static heightMap (): void {
    Server.initHeightMap(FSHelper.path('assets/hmap.dat'))
  }
}

namespace Loader {
  export interface ZoneInfo {
    name: string
    position: Array3d,
    group?: string
  }

  export interface LocationInfo {
    position: Array3d
    rotation: Array3d
  }

  export interface VehicleGroupInfo {
    name: string,
    model: string,
    price?: number,
    locations: LocationInfo[]
  }

  export interface TeamInfo {
    name: string
    slug: string
    base: Array3d,
    blipColorID: number,
    vehicleColors: [RGB, RGB],
    models: Array<string>,
    spawns: Array3d[],
    vehicles: VehicleGroupInfo[][]
  }

  export interface WorldLocationInfo {
    name: string,
    position: Array3d,
    ipls?: string[],
    interior_props?: string[]
  }
}
