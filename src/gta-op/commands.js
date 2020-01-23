const fs = require('fs')

import FSHelper from '@lib/core/fs-helper'
import Vehicle from '@lib/vehicle'

module.exports = (server) => {
	mp.events.addCommand("savepos", (player) => {
		let pos = JSON.stringify(player.position)

		if (player.vehicle) {
			console.log(new Vehicle(player.vehicle).rotation)
		}

		FSHelper.appendFile('./positions.txt', JSON.stringify(player.position) + "\n", (err) => {
			if (err) {
				console.error(err)
				return
			}

			player.outputChatBox(pos + ' has been saved!')
		})
	})

	mp.events.addCommand('kill', player => {
		let client = server.clients.byPlayer(player)
		client.kill()
	})

	mp.events.addCommand('setteam', (player, teamSlug) => {
		let team = server.teams.bySlug(teamSlug)

		if (!(teamSlug && team)) {
			player.outputChatBox('Usage: /setteam [team_slug]')
			player.outputChatBox('Note: Possible team slugs are: "fib", "marines", "lost_mc"')
			return
		}

		let client = server.clients.byPlayer(player)
		client.team = server.teams.bySlug(teamSlug)
		client.spawn()

		let output = `Setting ${client.player.name}'s team to ${client.team.name}`
		player.outputChatBox(output)
		console.log(output)
	})
}
