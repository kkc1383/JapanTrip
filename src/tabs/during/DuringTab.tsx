import { lazy, Suspense, useEffect, useState } from 'react'
import DayTabs from '../../components/DayTabs'
import SectionTitle from '../../components/SectionTitle'
import { todayKey } from '../../lib/dates'
import { directionsUrl } from '../../lib/googleMaps'
import { sortByOrder } from '../../lib/sort'
import { useRtdbValue } from '../../hooks/useRtdb'
import type { DayKey, ItineraryItem } from '../../types'
import TodayView from './TodayView'

// Leaflet 번들이 커서 지도는 필요할 때만 로드
const TripMap = lazy(() => import('./TripMap'))

function nowHM(): string {
  const n = new Date()
  return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`
}

export default function DuringTab() {
  const data = useRtdbValue<Partial<Record<DayKey, Record<string, ItineraryItem>>>>('itinerary')
  const [day, setDay] = useState<DayKey>(() => todayKey() ?? 'day1')
  const [, setTick] = useState(0)
  // 시간이 흐르면 '다음 일정'도 따라가도록 1분마다 다시 계산
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const items = sortByOrder(data?.[day])

  // 다음 목적지: 오늘이면 지금 시각 이후 첫 일정(좌표 보유) → 없으면 시간 미정 일정.
  // 오늘 일정이 모두 지났으면 버튼을 숨긴다 (지난 일정으로 안내하지 않기).
  const isToday = day === todayKey()
  const now = nowHM()
  const withCoords = items.filter(([, it]) => it.lat != null && it.lng != null)
  let next: [string, ItineraryItem] | undefined
  if (isToday) {
    next =
      withCoords
        .filter(([, it]) => it.time && it.time > now)
        .sort((a, b) => a[1].time!.localeCompare(b[1].time!))[0] ??
      withCoords.find(([, it]) => !it.time)
  } else {
    next = withCoords[0]
  }

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
      {isToday && !next && withCoords.length > 0 && (
        <p className="empty-box !py-2.5 text-[12px]">오늘 일정이 모두 끝났어요 — 수고했어요! 🍺</p>
      )}
      <Suspense fallback={<div className="card flex h-52 items-center justify-center text-[12px] text-sub">지도 불러오는 중...</div>}>
        <TripMap items={items} />
      </Suspense>
      <section>
        <SectionTitle ko="오늘의 일정" sub="Timeline" />
        <TodayView items={items} isToday={isToday} />
      </section>
    </div>
  )
}
