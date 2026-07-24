import { useState } from 'react'
import DayTabs from '../../components/DayTabs'
import SectionTitle from '../../components/SectionTitle'
import { todayKey } from '../../lib/dates'
import { directionsUrl } from '../../lib/googleMaps'
import { sortByOrder } from '../../lib/sort'
import { useRtdbValue } from '../../hooks/useRtdb'
import type { DayKey, ItineraryItem } from '../../types'
import TodayView from './TodayView'
import TripMap from './TripMap'

function nowHM(): string {
  const n = new Date()
  return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`
}

export default function DuringTab() {
  const data = useRtdbValue<Partial<Record<DayKey, Record<string, ItineraryItem>>>>('itinerary')
  const [day, setDay] = useState<DayKey>(() => todayKey() ?? 'day1')
  const items = sortByOrder(data?.[day])

  // 다음 목적지: 오늘이면 지금 시각 이후 첫 일정(좌표 보유), 아니면 그 날 첫 좌표 일정
  const isToday = day === todayKey()
  const now = nowHM()
  const withCoords = items.filter(([, it]) => it.lat != null && it.lng != null)
  const upcoming = withCoords
    .filter(([, it]) => it.time)
    .sort((a, b) => a[1].time!.localeCompare(b[1].time!))
    .filter(([, it]) => !isToday || it.time! > now)
  const next = upcoming[0] ?? withCoords[0]

  return (
    <div className="stagger space-y-3.5">
      <DayTabs day={day} onChange={setDay} />
      {next && (
        <a
          href={directionsUrl(next[1].lat!, next[1].lng!)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary block text-center"
        >
          🧭 다음 일정 길찾기 — {next[1].title}
        </a>
      )}
      <TripMap items={items} />
      <section>
        <SectionTitle ko="오늘의 일정" sub="Timeline" />
        <TodayView items={items} isToday={isToday} />
      </section>
    </div>
  )
}
