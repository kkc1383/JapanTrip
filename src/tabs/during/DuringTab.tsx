import { useState } from 'react'
import DayTabs from '../../components/DayTabs'
import SectionTitle from '../../components/SectionTitle'
import { todayKey } from '../../lib/dates'
import { sortByOrder } from '../../lib/sort'
import { useRtdbValue } from '../../hooks/useRtdb'
import type { DayKey, ItineraryItem } from '../../types'
import TodayView from './TodayView'
import TripMap from './TripMap'

export default function DuringTab() {
  const data = useRtdbValue<Partial<Record<DayKey, Record<string, ItineraryItem>>>>('itinerary')
  const [day, setDay] = useState<DayKey>(() => todayKey() ?? 'day1')
  const items = sortByOrder(data?.[day])

  return (
    <div className="stagger space-y-3.5">
      <DayTabs day={day} onChange={setDay} />
      <TripMap items={items} />
      <section>
        <SectionTitle ko="오늘의 일정" sub="Timeline" />
        <TodayView items={items} isToday={day === todayKey()} />
      </section>
    </div>
  )
}
