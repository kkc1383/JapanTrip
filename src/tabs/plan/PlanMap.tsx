import 'leaflet/dist/leaflet.css'
import { useState } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import { FitBounds, Revalidate, TOKYO } from '../../components/mapHelpers'
import { DAYS } from '../../lib/dates'
import { placeSearchUrl } from '../../lib/googleMaps'
import { useRtdbValue } from '../../hooks/useRtdb'
import type { DayKey, ItineraryItem, WishlistItem } from '../../types'

const DAY_COLOR: Record<DayKey, string> = {
  day1: '#bf3b2e',
  day2: '#33557e',
  day3: '#b48a3f',
}
const WISH_COLOR = '#8d8371'

type Mark = { key: string; lat: number; lng: number; color: string; name: string; sub: string }

export default function PlanMap() {
  const itinerary = useRtdbValue<Partial<Record<DayKey, Record<string, ItineraryItem>>>>('itinerary')
  const wishlist = useRtdbValue<Record<string, WishlistItem>>('wishlist')
  const [expanded, setExpanded] = useState(false)

  const marks: Mark[] = []
  for (const d of DAYS) {
    for (const [id, it] of Object.entries(itinerary?.[d.key] ?? {})) {
      if (it.lat != null && it.lng != null) {
        marks.push({
          key: `${d.key}-${id}`,
          lat: it.lat,
          lng: it.lng,
          color: DAY_COLOR[d.key],
          name: it.title,
          sub: `${d.label}${it.time ? ' · ' + it.time : ''}`,
        })
      }
    }
  }
  for (const [id, w] of Object.entries(wishlist ?? {})) {
    if (w.lat != null && w.lng != null) {
      marks.push({ key: `wish-${id}`, lat: w.lat, lng: w.lng, color: WISH_COLOR, name: w.title, sub: '후보' })
    }
  }
  const points = marks.map(m => [m.lat, m.lng] as [number, number])

  return (
    <div className="card relative z-0 overflow-hidden !p-0">
      <div className="flex items-center justify-between border-b border-dashed border-line bg-card px-3 py-1.5">
        <span className="font-display text-[12px] tracking-[0.25em] text-indigo">計畫地圖 · PLAN</span>
        <button
          type="button"
          onClick={() => setExpanded(x => !x)}
          className="font-display text-[11px] tracking-wider text-accent"
        >
          {expanded ? '접기 ▴' : '펼치기 ▾'}
        </button>
      </div>
      {/* 범례 */}
      <div className="flex items-center gap-3 border-b border-dashed border-line bg-card px-3 py-1 text-[10px] text-sub">
        {DAYS.map(d => (
          <span key={d.key} className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full" style={{ background: DAY_COLOR[d.key] }} />
            {d.label}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span className="inline-block size-2 rounded-full" style={{ background: WISH_COLOR }} />
          후보
        </span>
      </div>
      <div className={`relative transition-[height] duration-300 ${expanded ? 'h-[62dvh]' : 'h-52'}`}>
        <MapContainer center={TOKYO} zoom={12} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={points} />
          <Revalidate dep={expanded} />
          {marks.map(m => (
            <CircleMarker
              key={m.key}
              center={[m.lat, m.lng]}
              radius={9}
              pathOptions={{ color: '#fffdf4', weight: 2, fillColor: m.color, fillOpacity: 0.95 }}
            >
              <Popup>
                <div className="text-sm font-semibold">{m.name}</div>
                <div className="text-xs">{m.sub}</div>
                <a
                  href={placeSearchUrl(m.name, m.lat, m.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline"
                >
                  구글맵에서 열기
                </a>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
        {!marks.length && (
          <div className="pointer-events-none absolute inset-x-0 top-2 z-[500] text-center">
            <span className="rounded-sm border border-dashed border-ink/30 bg-card/95 px-3 py-1 text-[11px] tracking-wide text-sub">
              좌표가 등록된 일정/후보가 없어요 — 장소 입력 시 좌표 검색을 눌러보세요
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
