import Config from '@root/config'
import Server from '@lib/server'
import FSHelper from '@core/fs-helper'
import Util from '@core/util'
import Client from '@lib/client'
import WorldLocations from '@lib/world-locations'
import Team from '@lib/team'
import Vehicle from '@lib/vehicle';
import Zone from '@lib/zone';

Server.addCommand('savepos', (client: Client, description: string) => {
	let coords = [ client.position, client.heading ]

	if (client.vehicle) {
		coords = [ client.vehicle.position, client.vehicle.rotation ]
	}

	let append = JSON.stringify(coords)
	let prefixedAppend = description ? `${description} ${append}` : append

	FSHelper.appendFile(Config.savedPositionsFile, prefixedAppend + "\n", (err: any) => {
		if (err) {
			console.error(err)
			return
		}

		client.sendMessage(`!{#ff0000}${append} ` + (description ? `!{#ffff00}(${description}) ` : '') + `!{#ffffff}has been saved.`)
		Server.log(append + ' has been saved.')
	})
})

Server.addCommand('register', (client: Client) => {
	Server.db.getUserBySocialClub(client.mp.socialClub, (userData: any) => {
		if (userData != null) {
			client.sendMessage("!{#ff0000}You're already registered.");
			return;
		}

		client.onClientRequestAccountStatus();
	});
})

Server.addCommand('v', (client: Client, modelName: string) => {
	if (!modelName || typeof modelName !== 'string') {
		client.sendMessage(`!{#ffff00}Usage: !{#ffffff}/v !{#dddddd}[vehicle_model]`);
		return;
	}

	let clientPosition = client.position;
	clientPosition.z += 1;

	let newVehicle = new Vehicle(modelName, clientPosition, null);
	newVehicle.respawnable = false;
	client.putInVehicle(newVehicle);
	client.sendMessage(`!{#00ff00}[VEHICLE] !{#ffffff}Successfully spawned !{#ffff00}"${modelName}"!{#ffffff}.`);
})

Server.addCommand('setspawnzone', (client: Client, zoneSlug: string) => {
	if (!zoneSlug || typeof zoneSlug !== 'string') {
		client.sendMessage(`!{#ffff00}Usage: !{#ffffff}/setspawnzone !{#dddddd}[zone_slug]`);
		return;
	}

	const zone = Zone.all.bySlug(zoneSlug)
	if (!zone) {
		client.sendMessage(`!{#ff0000}[SPAWN ZONE] !{#ffffff}Zone !{#ffff00}"${zoneSlug}"!{#ffffff} couldn't be found...`)
		return;
	}

	const validSpawnZone = client.setSpawnZone(zone)

	if (validSpawnZone) {
		client.sendMessage(`!{#00ff00}[SPAWN ZONE] !{#ffffff}Zone !{#ffff00}"${zoneSlug}"!{#ffffff} has been set as your spawn zone.`)
	} else {
		client.sendMessage(`!{#ff0000}[SPAWN ZONE] !{#ffffff}Zone !{#ffff00}"${zoneSlug}"!{#ffffff} doesn't contain any spawns and is therefore unavailable.`)
	}
})

Server.addCommand('weapon', (client: Client, modelName: string, ammo?: number) => {
	if (!modelName || typeof modelName !== 'string') {
		client.sendMessage(`!{#ffff00}Usage: !{#ffffff}/weapon !{#dddddd}[weapon_model]`);
		return;
	}

	client.giveWeapon(modelName, ammo || 10000)
});

Server.addCommand('tp', (client: Client, ...args: string[]) => {
	// Prepare given arguments as suitable array
	let params: any[] = [...args];
	// Remove first argument (which only contains all latter ones)
	params.shift();
	// Convert numeric values to floats
	params = params.map((param: string): number|string => {
		return Util.isNumeric(param) ? parseFloat(param) : param;
	});

	// Two parameters given
	if (params.length === 2) {
		if (params[0] === 'base') {
			if (typeof params[1] === 'string') {
				const teamSlug = params[1];
				const team = Team.all.bySlug(teamSlug);

				if (!team) {
					client.sendMessage(`!{#ff0000}[TELEPORT] !{#ffffff}Team slug !{#ffff00}"${teamSlug}"!{#ffffff} couldn't be found...`)
					return
				}

				client.position = team.getSpawn();

				client.sendMessage(`!{#00ff00}[TELEPORT] !{#ffffff}Teleported to team !{#ffff00}"${team.name}"!{#ffffff} base.`);
				return;
			}

			if (!client.team) {
				client.sendMessage(`!{#ff0000}[TELEPORT] !{#ffffff}You don't have a team yet, so your base couldn't be detected.`);
				return
			}

			client.position = client.team.getSpawn();
			return;
		}

		// Is location
		if (params[0] === 'location' && typeof params[1] === 'string') {
			const locationName = params[1];
			const location = WorldLocations.byName(locationName);

			if (location) {
				WorldLocations.tp(client, location);
				client.sendMessage(`!{#00ff00}[TELEPORT] !{#ffffff}Going to !{#ffff00}"${location.name}"!{#ffffff} (${location.position}).`);
			} else {
				client.sendMessage(`!{#ff0000}[TELEPORT] !{#ffffff}Location !{#ffff00}"${locationName}"!{#ffffff} couldn't be found...`);
			}

			return
		}

		// Is zone
		if (params[0] === 'zone' && typeof params[1] === 'string') {
			const zoneSlug = params[1]
			const zone = Zone.all.bySlug(zoneSlug)

			if (zone) {
				let zonePosition: Vector3Mp = zone.position
				zonePosition.z += 0.4
				client.position = zonePosition
				client.sendMessage(`!{#00ff00}[TELEPORT] !{#ffffff}Going to zone !{#ffff00}"${zone.name}"!{#ffffff} (${zone.slug}).`)
			} else {
				client.sendMessage(`!{#ff0000}[TELEPORT] !{#ffffff}Zone !{#ffff00}"${zoneSlug}"!{#ffffff} couldn't be found...`)
			}

			return
		}

		// Is saved position
		if (params[0] === 'saved' && typeof params[1] === 'string') {
			const savedLocationSlug = params[1]
			let foundLocation = false

			FSHelper.readByLine(Config.savedPositionsFile, (line: string) => {
				const savedPosRegExp = new RegExp(/(?:(\w+) )\[\{"x":(.*?),"y":(.*?),"z":(.*?)\},(.*?)\]/)
				const matches = line.match(savedPosRegExp)

				if (!(matches && matches.length >= 5)) {
					return
				}

				foundLocation = true
				matches.shift() // Remove main match

				// Convert remaining coordinates matches to floats
				const position = matches.slice(1).map((match) => {
					return parseFloat(match)
				})

				client.position = new mp.Vector3(position[0], position[1], position[2])
				client.heading = position[3]
			})

			if (!foundLocation) {
				client.sendMessage(`!{#ff0000}[TELEPORT] !{#ffffff}Saved position !{#ffff00}"${savedLocationSlug}"!{#ffffff} couldn't be found...`)
			}

			return
		}
	}

	// At least two parameters given of which all are numbers -> assuming coordinates
	if (params.length >= 2 && Util.isTypeArray(params, 'number')) {
		const position = new mp.Vector3(params[0], params[1], 0)

		// No Z coordinate given ->
		if (params[2] === undefined) {
			// Use height map for Z coordinate retrieval
			Server.heightMap.getZ(position.x, position.y, (z: number) => {
				position.z = z
				client.position = position
				client.sendMessage(`!{#00ff00}[TELEPORT] !{#ffffff}Going to !{#ffff00}(${position}){#ffffff}.`)

			})
		} else {
			position.z = params[2]
			client.position = position
			client.sendMessage(`!{#00ff00}[TELEPORT] !{#ffffff}Going to !{#ffff00}(${position})!{#ffffff}.`)
		}

		return
	}

	// Print usage if no specific action could be determined
	client.sendMessage(`!{#ffff00}Usage: !{#ffffff}/tp location !{#dddddd}[location_name]`)
	client.sendMessage(`!{#ffff00}Usage: !{#ffffff}/tp zone !{#dddddd}[zone_slug]`)
	client.sendMessage(`!{#ffff00}Usage: !{#ffffff}/tp saved !{#dddddd}[saved_position_name]`)
	client.sendMessage(`!{#ffff00}Usage: !{#ffffff}/tp !{#dddddd}base`)
	client.sendMessage(`!{#ffff00}Usage: !{#ffffff}/tp !{#dddddd}base [team_slug]`)
	client.sendMessage(`!{#ffff00}Usage: !{#ffffff}/tp !{#dddddd}[x] [y]`)
	client.sendMessage(`!{#ffff00}Usage: !{#ffffff}/tp !{#dddddd}[x] [y] [z]`)
}, false)

Server.addCommand('kill', (client: Client) => {
	client.kill()
})

Server.addCommand('help', (client: Client) => {
	client.sendMessage(`!{#ffff00}Teleport: !{#ffffff}/tp`);
	client.sendMessage(`!{#ffff00}Set team: !{#ffffff}/setteam`);
	client.sendMessage(`!{#ffff00}Spawn vehicle: !{#ffffff}/v`);
	client.sendMessage(`!{#ffff00}Set spawn zone: !{#ffffff}/setspawnzone`);
	client.sendMessage(`!{#ffff00}Give weapon: !{#ffffff}/weapon`);
	client.sendMessage(`!{#ffff00}Save position to file: !{#ffffff}/savepos`);
});

// Server.addCommand('zones', (client: Client, page: number) => {
// 	const ZONES_PER_PAGE = 10;
//
// 	if (!Number.isInteger(page) || page < 1) {
// 		page = 1;
// 	}
// 	const zoneIndexStart = ZONES_PER_PAGE * page;
//
// 	const zones = Zone.all.items.slice(zoneIndexStart, ZONES_PER_PAGE);
// 	if (!zones.length) {
// 		client.sendMessage(`!{#ff0000}[TEAM] !{#ffffff}Team slug !{#ffff00}"${teamSlug}"!{#ffffff} couldn't be found...`)
// 	}
// })

Server.addCommand('setteam', (client: Client, teamSlug: string) => {
	const team = Team.all.bySlug(teamSlug)

	if (!teamSlug) {
		client.sendMessage(`!{#ffff00}Usage: !{#ffffff}/setteam !{#dddddd}[team_slug]`)
		client.sendMessage(`!{#ffff00}Note: !{#ffffff}Possible team slugs are: !{#dddddd}fib!{#ffffff}, !{#dddddd}marines!{#ffffff}, !{#dddddd}lost_mc`)
		return
	}

	if (!team) {
		client.sendMessage(`!{#ff0000}[TEAM] !{#ffffff}Team slug !{#ffff00}"${teamSlug}"!{#ffffff} couldn't be found...`)
		return
	}

	client.team = team
	client.spawn()

	Server.debug(`Setting ${client.name}'s team to ${team.name}`)
	client.sendMessage(`!{#00ff00}[TEAM] !{#ffffff}Setting your team to !{#ffff00}"${team.name}"!{#ffffff}.`)
})
