import { Server, FSHelper } from '@core/index'
import { Client, Vehicle } from '@lib/index'

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

		client.sendMessage(`!{#ff0000}${append} ` + (description ? `!{#ffff00}(${description}) ` : '') + `!{#ffffff}has been saved!`)
		Server.log(append + ' has been saved!')
	})
})

Server.addCommand('kill', (client: Client) => {
	client.kill()
})

Server.addCommand('setteam', (client: Client, teamSlug: string) => {
	let team = Server.teams.bySlug(teamSlug)

	if (!(team && teamSlug)) {
		client.sendMessage(`!{#ffff00}Usage: !{#ffffff}/setteam !{#dddddd}[team_slug]`)
		client.sendMessage(`!{#ffff00}Note: !{#ffffff}Possible team slugs are: !{#dddddd}fib!{#ffffff}, !{#dddddd}marines!{#ffffff}, !{#dddddd}lost_mc`)
		return
	}

	client.team = Server.teams.bySlug(teamSlug)
	client.spawn()

	Server.debug(`Setting ${client.player.name}'s team to ${client.team.name}`)
	client.sendMessage(`Setting your team to !{#ff0000}${client.team.name}`)
})
