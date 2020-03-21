import List from '@core/list';
import Team from '@lib/team';

export class TeamManager extends List<Team> {
  bySlug (slug: string): Team | null {
    let foundTeam = null;

    super.items.forEach((team: Team) => {
      if (team.slug === slug) {
        foundTeam = team;
      }
    });

    return foundTeam;
  }
}
