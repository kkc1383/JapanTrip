import { useEffect, useState } from 'react'
import { directionsUrl, placeSearchUrl } from '../../lib/googleMaps'
import type { ItineraryItem } from '../../types'

function nowHM(): string {
  const n = new Date()
  return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`
}

export default function TodayView({
  items,
  isToday,
}: {
  items: [string, ItineraryItem][]
  isToday: boolean
}) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const now = nowHM()
  const timed = items
    .filter(([, it]) => it.time)
    .sort((a, b) => a[1].time!.localeCompare(b[1].time!))
  const currentId = isToday
    ? [...timed].reverse().find(([, it]) => it.time! <= now)?.[0] ?? null
    : null
  const nextId = isToday ? timed.find(([, it]) => it.time! > now)?.[0] ?? null : null

  if (!items.length) {
    return <p className="empty-box">이 날의 일정이 없어요 — 여행 계획 탭에서 추가하세요</p>
  }
  return (
    <div className="relative space-y-3">
      {/* 좌측 여정 레일 */}
      <span className="pointer-events-none absolute top-2 bottom-2 left-[31px] border-l border-dashed border-ink/20" />
      {items.map(([id, it]) => {
        const badge = id === currentId ? '지금' : id === nextId ? '다음' : null
        return (
          <div
            key={id}
            className={`card flex items-stretch overflow-hidden ${
              badge === '지금' ? '!border-accent !shadow-[3px_3px_0_rgba(191,59,46,0.25)]' : ''
            }`}
          >
            <div
              className={`flex w-[64px] shrink-0 flex-col items-center justify-center border-r border-dashed border-line py-3 ${
                badge === '지금' ? 'bg-accent text-[#fff6e9]' : 'bg-accent-soft/40'
              }`}
            >
              <span className={`font-display text-[15px] ${badge === '지금' ? '' : 'text-accent'}`}>
                {it.time || '—'}
              </span>
            </div>
            <div className="flex-1 px-3.5 py-3">
              <div className="font-display flex items-center gap-2 text-[15px] tracking-wide">
                {badge && (
                  <span className={`badge-hanko ${badge === '지금' ? 'badge-hanko-fill' : ''}`}>
                    {badge}
                  </span>
                )}
                {it.title}
              </div>
              {it.place && (
                <span className="mt-1 inline-flex items-center gap-2">
                  <a
                    href={placeSearchUrl(it.place, it.lat, it.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] text-indigo underline decoration-indigo/40 underline-offset-2"
                  >
                    📍 {it.place}
                  </a>
                  {it.lat != null && it.lng != null && (
                    <a
                      href={directionsUrl(it.lat, it.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-sm border border-accent/40 bg-accent-soft px-1.5 py-px text-[10.5px] font-bold text-accent"
                    >
                      🧭 길찾기
                    </a>
                  )}
                </span>
              )}
              {it.memo && (
                <div className="mt-1.5 text-[12px] leading-relaxed whitespace-pre-wrap text-ink/75">{it.memo}</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
