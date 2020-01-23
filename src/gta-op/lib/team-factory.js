import Team from '@lib/team'

export default class TeamFactory {
  constructor () {
    this.teams = []
  }

  bySlug (slug) {
    let targetTeam = null

    this.teams.forEach(team => {
      if (team.slug === slug) {
        targetTeam = team
      }
    })

    return targetTeam
  }

  add (team) {
    let teams = [ ...arguments ]

    teams.forEach(team => {
      if (!(team instanceof Team)) {
        team = new Team(team)
      }

      if (this.teams.indexOf(team) === -1) {
        this.teams.push(team)
        console.log('[TEAM] Adding ' + team.name)
      }
    })
  }

  remove (team) {
    let teamIndex = this.teams.indexOf(team)

    if (teamIndex === -1) {
      return
    }

    console.log('Removing ' + team.name)
    delete this.teams[teamIndex]
  }
}
