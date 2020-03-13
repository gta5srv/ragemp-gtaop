import Config from '@root/config'
import Server from '@lib/server'
import FSHelper from '@core/fs-helper'
import Util from '@core/util'
import Client from '@lib/client'
import WorldLocations from '@lib/world-locations'
import Team from '@lib/team'

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

Server.addCommand('tp', (client: Client, ...args: string[]) => {
	// Prepare given arguments as suitable array
	let params: any[] = [...args]
	// Remove first argument (which only contains all latter ones)
	params.shift()
	// Convert numeric values to floats
	params = params.map((param: string): number|string => {
		return Util.isNumeric(param) ? parseFloat(param) : param
	})

	// Two parameters given
	if (params.length === 2) {
		// Is location
		if (params[0] === 'location' && typeof params[1] === 'string') {
			const locationName = params[1]
			const location = WorldLocations.byName(locationName)

			if (location) {
				WorldLocations.tp(client, location)
				client.sendMessage(`!{#00ff00}[TELEPORT] !{#ffffff}Going to !{#ffff00}"${location.name}"!{#ffffff} (${location.position}).`)
			} else {
				client.sendMessage(`!{#ff0000}[TELEPORT] !{#ffffff}Location !{#ffff00}"${locationName}"!{#ffffff} couldn't be found...`)
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
	client.sendMessage(`!{#ffff00}Usage: !{#ffffff}/tp saved !{#dddddd}[saved_position_name]`)
	client.sendMessage(`!{#ffff00}Usage: !{#ffffff}/tp !{#dddddd}[x] [y]`)
	client.sendMessage(`!{#ffff00}Usage: !{#ffffff}/tp !{#dddddd}[x] [y] [z]`)
})

Server.addCommand('kill', (client: Client) => {
	client.kill()
})

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
