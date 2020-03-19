import Types from '@core/types';
import FSHelper from '@core/fs-helper';
import Server from '@lib/server';
import Team from '@lib/team';
import Zone from '@lib/zone';
import Vehicle from '@lib/vehicle';
import { WorldLocations, WorldLocation } from '@lib/world-locations';

export default class Loader {
  public static counts: Loader.Counts = {
    teams: 0,
    zones: 0,
    worldLocations: 0,
    worldVehicles: 0
  };

  static run (rootDirectory: string): void {
    FSHelper.rootDirectory = rootDirectory;

    Loader.heightMap();

    Loader.counts.teams = Loader.teams();
    Loader.counts.zones = Loader.zones();
    Loader.counts.worldLocations = Loader.worldLocations();
    Loader.counts.worldVehicles = Loader.worldVehicles();
  }

  static team (info: Loader.TeamModel): Team {
    const vehicleGroupManager = new Team.VehicleGroupManager();

    if (info.vehicles) {
      info.vehicles.forEach((vehGroup: Loader.VehicleGroupModel[]) => {
        vehGroup.forEach((vehInfo: Loader.VehicleGroupModel) => {
          const vehGroupSpawns: Types.Location[] = vehInfo.locations.map((l: Loader.VehicleLocationModel) => {
            return {
              position: new mp.Vector3(l.position[0], l.position[1], l.position[2]),
              rotation: new mp.Vector3(l.rotation[1], l.rotation[1], l.rotation[2])
            };
          });

          const vehicleGroup: Team.VehicleGroup = {
            model: vehInfo.model,
            name: vehInfo.name,
            spawns: vehGroupSpawns,
            price: vehInfo.price
          };

          vehicleGroupManager.add(vehicleGroup);
        });
      });
    }

    const base = new mp.Vector3(info.base[0], info.base[1], info.base[2]);
    const spawns = info.spawns.map((spawn: number[]) => {
      return new mp.Vector3(spawn[0], spawn[1], spawn[2]);
    });

    const team = new Team(
      info.name,
      info.slug,
      base,
      info.blipColorID,
      info.color,
      info.vehicleColors,
      info.models,
      spawns,
      vehicleGroupManager
    );

    // TODO: Add more constructor parameters as properties
    team.gtaColor = info.gtaColor;

    return team;
  }

  static teams (): number {
    let teamsInfo = require('@config/teams').teams;

    for (let teamSlug in teamsInfo) {
      let teamInfo: Loader.TeamModel = teamsInfo[teamSlug];
      teamInfo.slug = teamSlug;

      Loader.team(teamInfo);
    }

    return Object.keys(teamsInfo).length;
  }

  static zones (): number {
    const zonesInfo = require('@config/zones').zones;

    for (const zoneSlug in zonesInfo) {
      const zoneInfo: Loader.ZoneModel = zonesInfo[zoneSlug];

      const zoneBase = new mp.Vector3(
        zoneInfo.position[0],
        zoneInfo.position[1],
        zoneInfo.position[2]
      );

      let zoneSpawns: Types.Location[] = []
      if (zoneInfo.spawns) {
        zoneSpawns = zoneInfo.spawns.map((spawn: Array4d): Types.Location => {
          return {
            position: new mp.Vector3(spawn[0], spawn[1], spawn[2]),
            rotation: new mp.Vector3(0, 0, spawn[3])
          }
        });
      }

      let zoneVehicles: Vehicle[] = []
      if (zoneInfo.vehicles) {
        zoneInfo.vehicles.forEach((zoneVehicleInfo: Loader.ZoneVehicleModel) => {
          zoneVehicleInfo.spawns.forEach((zoneVehicleLocationInfo: Loader.VehicleLocationModel) => {
            const l = zoneVehicleLocationInfo;

            const position = new mp.Vector3(l.position[0], l.position[1], l.position[2] + 1);
            const rotation = new mp.Vector3(l.rotation[1], l.rotation[1], l.rotation[2]);

            zoneVehicles.push(new Vehicle(
              zoneVehicleInfo.model,
              position,
              rotation,
              Zone.DEFAULT_VEHICLE_COLORS,
              'ZONE'
            ));
          });
        });
      }

      const zone = new Zone(
        zoneInfo.name,
        zoneSlug,
        zoneBase,
        zoneSpawns,
        zoneInfo.group,
        zoneInfo.radius
      );

      zone.vehicles.add(...zoneVehicles);
    }

    return Object.keys(zonesInfo).length;
  }

  static worldLocations (): number {
    let worldLocationsInfo: Loader.WorldLocationModel[] = require('@config/world-locations').world_locations;
    let worldLocations: WorldLocation[] = [];

    worldLocationsInfo.forEach((worldVehicleLocationModel: Loader.WorldLocationModel) => {
      const worldLocationPosition = new mp.Vector3(
        worldVehicleLocationModel.position[0],
        worldVehicleLocationModel.position[1],
        worldVehicleLocationModel.position[2]
      );

      const worldLocation = new WorldLocation(
        worldVehicleLocationModel.name,
        worldLocationPosition,
        worldVehicleLocationModel.ipls,
        worldVehicleLocationModel.interior_props
      );

      worldLocations.push(worldLocation);
    })

    WorldLocations.add(...worldLocations);

    return worldLocationsInfo.length;
  }

  static worldVehicles (): number {
    let worldVehiclesInfo: Loader.WorldVehicleModel[] = require('@config/world-vehicles').world_vehicles;

    worldVehiclesInfo.forEach((worldVehicleInfo: Loader.WorldVehicleModel) => {
      const worldVehicle = new Vehicle(
        worldVehicleInfo.model,
        new mp.Vector3(
          worldVehicleInfo.position[0],
          worldVehicleInfo.position[1],
          worldVehicleInfo.position[2]
        ),
        new mp.Vector3(
          worldVehicleInfo.rotation[0],
          worldVehicleInfo.rotation[1],
          worldVehicleInfo.rotation[2]
        )
      );

      worldVehicle.randomizeColors();
    });

    return worldVehiclesInfo.length;
  }

  static heightMap (): void {
    Server.initHeightMap(FSHelper.path('assets/hmap.dat'));
  }
}

namespace Loader {
  export interface VehicleLocationModel {
    position: Array3d;
    rotation: Array3d;
  }

  export interface ZoneVehicleModel {
    model: string;
    spawns: VehicleLocationModel[];
  }

  export interface ZoneModel {
    name: string;
    position: Array3d;
    radius?: number;
    spawns?: Array4d[];
    vehicles?: ZoneVehicleModel[];
    group?: string;
  }

  export interface VehicleGroupModel {
    name: string;
    model: string;
    price?: number;
    locations: VehicleLocationModel[];
  }

  export interface TeamModel {
    name: string;
    slug: string;
    base: Array3d;
    blipColorID: number;
    color: RGB;
    vehicleColors: [RGB, RGB];
    gtaColor: string;
    models: string[];
    spawns: Array3d[];
    vehicles: VehicleGroupModel[][];
  }

  export interface WorldLocationModel {
    name: string,
    position: Array3d,
    ipls?: string[],
    interior_props?: string[]
  }

  export interface WorldVehicleModel {
    model: HashOrString;
    position: Array3d,
    rotation: Array3d
  }

  export interface Counts {
    teams: number;
    zones: number;
    worldLocations: number;
    worldVehicles: number;
  }
}
