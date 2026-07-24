import { placeSearchUrl } from '../../lib/googleMaps'
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
  const now = nowHM()
  const timed = items.filter(([, it]) => it.time)
  const currentId = isToday
    ? [...timed].reverse().find(([, it]) => it.time! <= now)?.[0] ?? null
    : null
  const nextId = isToday ? timed.find(([, it]) => it.time! > now)?.[0] ?? null : null

  if (!items.length) {
    return <p className="py-8 text-center text-sm text-sub">이 날의 일정이 없어요. 여행 계획 탭에서 추가하세요!</p>
  }
  return (
    <div className="space-y-2.5">
      {items.map(([id, it]) => {
        const badge = id === currentId ? '지금' : id === nextId ? '다음' : null
        return (
          <div
            key={id}
            className={`flex items-start gap-3 rounded-xl border bg-card px-4 py-3.5 ${
              badge ? 'border-accent' : 'border-line'
            }`}
          >
            <div className="min-w-12 pt-0.5 text-sm font-bold text-accent">{it.time || '—'}</div>
            <div className="flex-1">
              <div className="font-semibold">
                {badge && (
                  <span className="mr-1.5 rounded bg-accent px-1.5 py-0.5 text-[11px] font-bold text-white">
                    {badge}
                  </span>
                )}
                {it.title}
              </div>
              {it.place && (
                <a
                  href={placeSearchUrl(it.place, it.lat, it.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 block text-[13px] text-sub underline"
                >
                  📍 {it.place}
                </a>
              )}
              {it.memo && <div className="mt-1.5 text-[13px] whitespace-pre-wrap">{it.memo}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
