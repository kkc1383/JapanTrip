import { ref, update } from 'firebase/database'
import { useEffect, useState, type FormEvent } from 'react'
import { db } from '../../lib/firebase'
import { useRtdbValue } from '../../hooks/useRtdb'
import type { PrepMoney } from '../../types'

type FxPoint = { date: string; per100: number }

const MONEY_ROWS: { key: 'card' | 'cash'; label: string }[] = [
  { key: 'card', label: '카드 (트래블월렛·트래블로그 등)' },
  { key: 'cash', label: '현금 (엔화)' },
]

/** 카드 통합 이전(wallet/log 분리) 데이터도 합산해서 표시 */
function rowValue(money: PrepMoney | null, key: 'card' | 'cash'): number {
  if (key === 'card') return money?.card ?? (money?.wallet ?? 0) + (money?.log ?? 0)
  return money?.cash ?? 0
}

function fmt(n: number): string {
  return n.toLocaleString('ko-KR')
}

function dateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 최근 7일 환율 스파크라인 (단일 시리즈 — 직접 라벨: 최고/최저/최신) */
function Sparkline({ points }: { points: FxPoint[] }) {
  if (points.length < 2) return null
  const w = 300
  const h = 72
  const px = 34
  const py = 14
  const vs = points.map(p => p.per100)
  const min = Math.min(...vs)
  const max = Math.max(...vs)
  const span = max - min || 1
  const x = (i: number) => px + (i * (w - px - 10)) / (points.length - 1)
  const y = (v: number) => py + (1 - (v - min) / span) * (h - py * 2)
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.per100).toFixed(1)}`).join(' ')
  const lastI = points.length - 1

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="최근 7일 환율 추이">
      {/* 면 채움 */}
      <path
        d={`${line} L${x(lastI).toFixed(1)},${h - 6} L${x(0).toFixed(1)},${h - 6} Z`}
        fill="var(--color-accent)"
        opacity="0.07"
      />
      {/* 최고/최저 눈금 라벨 */}
      <text x={px - 5} y={y(max) + 3} textAnchor="end" fontSize="9" fill="var(--color-sub)">
        {max.toFixed(1)}
      </text>
      <text x={px - 5} y={y(min) + 3} textAnchor="end" fontSize="9" fill="var(--color-sub)">
        {min.toFixed(1)}
      </text>
      <line x1={px} y1={y(max)} x2={w - 10} y2={y(max)} stroke="var(--color-line)" strokeDasharray="3 3" strokeWidth="0.7" />
      <line x1={px} y1={y(min)} x2={w - 10} y2={y(min)} stroke="var(--color-line)" strokeDasharray="3 3" strokeWidth="0.7" />
      <path d={line} fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(lastI)} cy={y(points[lastI].per100)} r="3.5" fill="var(--color-accent)" stroke="var(--color-card)" strokeWidth="1.5" />
      {/* 날짜 라벨: 처음/끝 */}
      <text x={x(0)} y={h - 1} fontSize="8.5" fill="var(--color-sub)">
        {points[0].date.slice(5).replace('-', '/')}
      </text>
      <text x={x(lastI)} y={h - 1} textAnchor="end" fontSize="8.5" fill="var(--color-sub)">
        {points[lastI].date.slice(5).replace('-', '/')}
      </text>
    </svg>
  )
}

export default function FxSection() {
  const [points, setPoints] = useState<FxPoint[]>([])
  const [failed, setFailed] = useState(false)
  const money = useRtdbValue<PrepMoney>('prep/money')
  const [editKey, setEditKey] = useState<'card' | 'cash' | null>(null)
  const [editVal, setEditVal] = useState('')

  useEffect(() => {
    let cancelled = false
    function load() {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 8)
      // api.frankfurter.app은 CORS 헤더 없는 301을 반환해 브라우저 fetch가 차단됨 — .dev/v1 직접 호출
      fetch(`https://api.frankfurter.dev/v1/${dateStr(start)}..${dateStr(end)}?from=JPY&to=KRW`)
        .then(r => r.json())
        .then((d: { rates?: Record<string, { KRW?: number }> }) => {
          if (!d.rates) throw new Error('bad response')
          const pts = Object.entries(d.rates)
            .map(([date, r]) => ({ date, per100: (r.KRW ?? 0) * 100 }))
            .filter(p => p.per100 > 0)
            .sort((a, b) => a.date.localeCompare(b.date))
          if (!pts.length) throw new Error('empty')
          if (!cancelled) {
            setPoints(pts)
            setFailed(false)
          }
        })
        .catch(() => {
          if (!cancelled) setFailed(true)
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

  const latest = points.length ? points[points.length - 1] : null
  const prev = points.length > 1 ? points[points.length - 2] : null
  const diff = latest && prev ? latest.per100 - prev.per100 : 0

  const totalJpy = MONEY_ROWS.reduce((s, r) => s + rowValue(money, r.key), 0)
  const totalKrw = latest ? Math.round((totalJpy * latest.per100) / 100) : null

  function startEdit(key: 'card' | 'cash') {
    setEditKey(key)
    setEditVal(String(rowValue(money, key) || ''))
  }

  function saveEdit(e: FormEvent) {
    e.preventDefault()
    if (!editKey) return
    const n = Math.max(0, Math.floor(Number(editVal) || 0))
    update(ref(db, 'prep/money'), { [editKey]: n })
    setEditKey(null)
  }

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-dashed border-line px-4 py-2">
        <span className="font-display text-[13px] tracking-wide text-indigo">엔화 환전 현황</span>
        <span className="text-[9px] font-semibold tracking-[0.25em] text-gold">JPY → KRW</span>
      </div>

      <div className="px-4 pt-3">
        {failed ? (
          <p className="py-2 text-[12px] text-sub">환율 정보를 불러오지 못했어요 — 네트워크 확인 후 새로고침</p>
        ) : !latest ? (
          <p className="py-2 text-[12px] text-sub">환율 불러오는 중...</p>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[24px]">
                100엔 = <span className="text-accent">{latest.per100.toFixed(1)}</span>원
              </span>
              {prev && (
                <span className={`text-[11px] font-semibold ${diff > 0 ? 'text-accent' : 'text-indigo'}`}>
                  {diff > 0 ? '▲' : diff < 0 ? '▼' : '—'} {Math.abs(diff).toFixed(1)}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[10px] text-sub">최근 7일 · {latest.date.replace(/-/g, '.')} 기준 (참고용)</p>
            <div className="mt-1.5">
              <Sparkline points={points} />
            </div>
          </>
        )}
      </div>

      {/* 준비 금액 */}
      <div className="mt-2 border-t border-dashed border-line px-4 py-3">
        {MONEY_ROWS.map(row => {
          const val = rowValue(money, row.key)
          const editing = editKey === row.key
          return (
            <div key={row.key} className="flex items-center justify-between border-b border-dashed border-line/60 py-1.5 last:border-b-0">
              <span className="text-[13px]">{row.label}</span>
              {editing ? (
                <form onSubmit={saveEdit} className="flex items-center gap-1.5">
                  <input
                    autoFocus
                    inputMode="numeric"
                    value={editVal}
                    onChange={e => setEditVal(e.target.value.replace(/[^0-9]/g, ''))}
                    onBlur={saveEdit}
                    className="field w-28 !py-1 text-right text-[13px]"
                  />
                  <span className="text-[12px] text-sub">엔</span>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => startEdit(row.key)}
                  className="group flex items-center gap-1.5"
                >
                  <span className="font-display text-[14px]">¥{fmt(val)}</span>
                  {latest && val > 0 && (
                    <span className="text-[10px] text-sub">≈ {fmt(Math.round((val * latest.per100) / 100))}원</span>
                  )}
                  <span className="text-[10px] text-sub/60 underline underline-offset-2 group-hover:text-accent">수정</span>
                </button>
              )}
            </div>
          )
        })}
        <div className="mt-2 flex items-center justify-between rounded-sm bg-accent-soft/60 px-2.5 py-1.5">
          <span className="font-display text-[12px] tracking-wide text-accent">합계</span>
          <span className="font-display text-[14px] text-accent">
            ¥{fmt(totalJpy)}
            {totalKrw != null && totalJpy > 0 && (
              <span className="ml-1.5 text-[11px] font-normal opacity-80">≈ {fmt(totalKrw)}원</span>
            )}
          </span>
        </div>
      </div>
    </section>
  )
}
