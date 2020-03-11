import Server from '@core/server'
import FSHelper from '@core/fs-helper'
import Client from '@lib/client'
import Util from '@lib/util'
import WorldLocations from '@lib/world-locations'

Server.addCommand('savepos', (client: Client, description: string) => {
	let coords = [ client.position, client.heading ]

	if (client.vehicle) {
		coords = [ client.vehicle.position, client.vehicle.rotation ]
	}

	let append = JSON.stringify(coords)
	let prefixedAppend = description ? `${description} ${append}` : append

	FSHelper.appendFile('./positions.txt', prefixedAppend + "\n", (err: any) => {
		if (err) {
			console.error(err)
			return
		}

		client.sendMessage(`!{#ff0000}${append} ` + (description ? `!{#ffff00}(${description}) ` : '') + `!{#ffffff}has been saved.`)
		Server.log(append + ' has been saved.')
	})
})

Server.addCommand('tp', (client: Client, ...args: string[]) => {
	// Prepare given arguments as suitable array
	let params: any[] = [...args]
	// Remove first argument (which only contains all latter ones)
	params.shift()
	// Convert numeric values to floats
	params = params.map((param: string): any => {
		return Util.isNumeric(param) ? parseFloat(param) : param
	})

	// Only one parameter given which is a string -> assuming WorldLocation name
	if (params.length === 1 && typeof params[0] === 'string') {
		const locationName = params[0]
		const location = WorldLocations.byName(locationName)

		if (location) {
			WorldLocations.tp(client, location)
			client.sendMessage(`!{#00ff00}[TELEPORT] !{#ffffff}Going to !{#ffff00}"${location.name}"!{#ffffff} (${location.position}).`)
		} else {
			client.sendMessage(`!{#ff0000}[TELEPORT] !{#ffffff}Location !{#ffff00}"${locationName}"!{#ffffff} couldn't be found...`)
		}

		return
	}

	// At least two parameters given of which all are numbers -> assuming coordinates
	if (params.length >= 2 && params.every((p: any) => typeof p === 'number')) {
		const position = new mp.Vector3(params[0], params[1], 0)

		// No Z coordinate given ->
		if (params[2] === undefined) {
			// Use height map for Z coordinate retrieval
			Server.heightMap.getZ(position, (z: number) => {
				position.z = z
				client.position = position
				client.sendMessage(`!{#00ff00}[TELEPORT] !{#ffffff}Going to !{#ffff00}(${position}){#ffffff}.`)

			})
		} else {
			position.z = params[2]
			client.position = position
			client.sendMessage(`!{#00ff00}[TELEPORT] !{#ffffff}Going to !{#ffff00}(${position}){#ffffff}.`)
		}

		return
	}

	// Print usage if no specific action could be determined
	client.sendMessage(`!{#ffff00}Usage: !{#ffffff}/tp !{#dddddd}[world_location_name]`)
	client.sendMessage(`!{#ffff00}Usage: !{#ffffff}/tp !{#dddddd}[x] [y]`)
	client.sendMessage(`!{#ffff00}Usage: !{#ffffff}/tp !{#dddddd}[x] [y] [z]`)
})

Server.addCommand('kill', (client: Client) => {
	client.kill()
})

Server.addCommand('setteam', (client: Client, teamSlug: string) => {
	const team = Server.teams.bySlug(teamSlug)

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

	Server.debug(`Setting ${client.player.name}'s team to ${client.team.name}`)
	client.sendMessage(`!{#00ff00}[TEAM] !{#ffffff}Setting your team to !{#ffff00}"${client.team.name}"!{#ffffff}.`)
})
