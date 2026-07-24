import { useState } from 'react'
import DayTabs from '../../components/DayTabs'
import { todayKey } from '../../lib/dates'
import { sortByOrder } from '../../lib/sort'
import { useRtdbValue } from '../../hooks/useRtdb'
import type { DayKey, ItineraryItem } from '../../types'
import TodayView from './TodayView'

export default function DuringTab() {
  const data = useRtdbValue<Partial<Record<DayKey, Record<string, ItineraryItem>>>>('itinerary')
  const [day, setDay] = useState<DayKey>(() => todayKey() ?? 'day1')
  const items = sortByOrder(data?.[day])

  return (
    <div className="space-y-3">
      <DayTabs day={day} onChange={setDay} />
      <TodayView items={items} isToday={day === todayKey()} />
    </div>
  )
}
