import List from '@core/list'
import Zone from '@lib/zone'

export class ZoneManager extends List<Zone> {
  bySlug (slug: string): Zone | null {
    let foundZone = null

    super.items.forEach((zone: Zone) => {
      if (zone.slug === slug) {
        foundZone = zone
      }
    })

    return foundZone
  }
}
