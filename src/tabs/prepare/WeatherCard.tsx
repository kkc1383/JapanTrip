import { useEffect, useState } from 'react'

type DayWx = { date: string; max: number; min: number; code: number }
type CityWx = { name: string; days: DayWx[] }

const CITIES = [
  { name: '도쿄', lat: 35.68, lon: 139.76, tz: 'Asia/Tokyo' },
  { name: '서울', lat: 37.57, lon: 126.98, tz: 'Asia/Seoul' },
]
const DATES = ['2026-08-20', '2026-08-21', '2026-08-22']
const DATE_LABEL = ['8/20 목', '8/21 금', '8/22 토']

/** 예보 제공 전(약 16일 전까지)에 보여줄 8월 하순 평년값 */
const NORMALS: Record<string, DayWx[]> = {
  도쿄: DATES.map(date => ({ date, max: 31, min: 25, code: 80 })),
  서울: DATES.map(date => ({ date, max: 30, min: 23, code: 2 })),
}

function wxLabel(code: number): { emoji: string; label: string } {
  if (code === 0) return { emoji: '☀️', label: '맑음' }
  if (code <= 2) return { emoji: '🌤️', label: '대체로 맑음' }
  if (code === 3) return { emoji: '☁️', label: '흐림' }
  if (code <= 48) return { emoji: '🌫️', label: '안개' }
  if (code <= 57) return { emoji: '🌦️', label: '이슬비' }
  if (code <= 67) return { emoji: '🌧️', label: '비' }
  if (code <= 77) return { emoji: '🌨️', label: '눈' }
  if (code <= 82) return { emoji: '🌦️', label: '소나기' }
  return { emoji: '⛈️', label: '뇌우' }
}

export default function WeatherCard() {
  const [cities, setCities] = useState<CityWx[] | null>(null)
  const [isNormal, setIsNormal] = useState(false)

  useEffect(() => {
    let cancelled = false
    function load() {
      Promise.all(
        CITIES.map(async c => {
          const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}` +
            `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
            `&timezone=${encodeURIComponent(c.tz)}&start_date=${DATES[0]}&end_date=${DATES[2]}`
          const r = await fetch(url)
          if (!r.ok) throw new Error('out of range')
          const d = (await r.json()) as {
            daily?: { time: string[]; temperature_2m_max: number[]; temperature_2m_min: number[]; weather_code: number[] }
          }
          if (!d.daily?.time?.length) throw new Error('no data')
          return {
            name: c.name,
            days: d.daily.time.map((date, i) => ({
              date,
              max: Math.round(d.daily!.temperature_2m_max[i]),
              min: Math.round(d.daily!.temperature_2m_min[i]),
              code: d.daily!.weather_code[i],
            })),
          }
        }),
      )
        .then(cs => {
          if (!cancelled) {
            setCities(cs)
            setIsNormal(false)
          }
        })
        .catch(() => {
          // 아직 예보 범위 밖 — 평년값으로 표시
          if (!cancelled) {
            setCities(CITIES.map(c => ({ name: c.name, days: NORMALS[c.name] })))
            setIsNormal(true)
          }
        })
    }
    load()
    // 앱을 켜둔 동안 1시간마다, 화면에 다시 돌아올 때마다 갱신
    const id = setInterval(load, 60 * 60_000)
    const onVis = () => {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelled = true
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <section className="card px-4 py-3.5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[15px]">여행 날씨 · 옷차림 참고</h3>
        <span className="text-[9px] font-semibold tracking-[0.25em] text-gold uppercase">Weather</span>
      </div>
      {!cities ? (
        <p className="py-3 text-center text-[12px] text-sub">날씨 불러오는 중...</p>
      ) : (
        <>
          <div className="mt-2.5 grid grid-cols-[52px_1fr_1fr] gap-y-1 text-center">
            <span />
            {cities.map(c => (
              <span key={c.name} className="font-display text-[12.5px] text-indigo">
                {c.name}
              </span>
            ))}
            {DATES.map((date, di) => (
              <div key={date} className="col-span-3 grid grid-cols-subgrid items-center border-t border-dashed border-line/60 py-1.5">
                <span className="text-[11.5px] font-semibold text-sub">{DATE_LABEL[di]}</span>
                {cities.map(c => {
                  const d = c.days.find(x => x.date === date)
                  if (!d) return <span key={c.name} className="text-[11px] text-sub">—</span>
                  const wx = wxLabel(d.code)
                  return (
                    <span key={c.name} className="text-[12.5px]">
                      {wx.emoji} <b className="text-accent">{d.max}°</b>
                      <span className="text-sub"> / </span>
                      <b className="text-indigo">{d.min}°</b>
                      <span className="ml-1 text-[10.5px] text-sub">{wx.label}</span>
                    </span>
                  )
                })}
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-sub">
            {isNormal
              ? '아직 예보 전이라 8월 하순 평년 기준이에요 — 출발 2주 전부터 실제 예보로 바뀝니다.'
              : '실제 예보 기준이에요.'}{' '}
            도쿄는 서울보다 덥고 습해요 — 얇은 옷 + 실내 냉방 대비 겉옷 하나, 소나기 대비 접이식 우산 추천.
          </p>
        </>
      )}
    </section>
  )
}
