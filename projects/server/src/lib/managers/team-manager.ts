import Manager from '@core/manager'
import Team from '@lib/team'

export default class TeamManager extends Manager<Team> {
  bySlug (slug: string): Team | null {
    let foundTeam = null

    super.items.forEach((team: Team) => {
      if (team.slug === slug) {
        foundTeam = team
      }
    })

    return foundTeam
  }
}
