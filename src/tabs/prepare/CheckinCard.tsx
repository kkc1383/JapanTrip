import { ref, update } from 'firebase/database'
import { db } from '../../lib/firebase'
import { PEOPLE, type PersonKey } from '../../lib/people'
import { useRtdbValue } from '../../hooks/useRtdb'
import PrepCard from './PrepCard'

type LegState = boolean | { kc?: boolean; yb?: boolean } | undefined

/** 사람별 체크 도입 이전의 boolean 값은 두 사람 공통으로 이어받음 */
function legDone(v: LegState, p: PersonKey): boolean {
  if (typeof v === 'boolean') return v
  return v?.[p] ?? false
}

export default function CheckinCard() {
  const data = useRtdbValue<{ out?: LegState; back?: LegState }>('prep/checkin')

  const rows = [
    { key: 'out' as const, label: '가는 편 체크인', date: '8/20 (목) 출국', v: data?.out },
    { key: 'back' as const, label: '오는 편 체크인', date: '8/22 (토) 귀국', v: data?.back },
  ]
  const allDone = rows.every(r => PEOPLE.every(p => legDone(r.v, p.key)))

  function setLeg(key: 'out' | 'back', v: LegState, p: PersonKey, next: boolean) {
    update(ref(db, `prep/checkin/${key}`), {
      kc: p === 'kc' ? next : legDone(v, 'kc'),
      yb: p === 'yb' ? next : legDone(v, 'yb'),
    })
  }

  return (
    <PrepCard title="항공권 체크인" sub="Check-in" checked={allDone}>
      {/* 체크 컬럼 헤더 */}
      <div className="flex items-center justify-end">
        {PEOPLE.map(p => (
          <span
            key={p.key}
            className="w-9 text-center text-[10px] font-semibold"
            style={{ color: p.key === 'kc' ? 'var(--color-accent)' : 'var(--color-indigo)' }}
          >
            {p.name}
          </span>
        ))}
      </div>
      {rows.map(r => {
        const bothDone = PEOPLE.every(p => legDone(r.v, p.key))
        return (
          <div key={r.key} className="flex items-center border-b border-dashed border-line/60 py-2 last:border-b-0">
            <span className={`flex-1 text-[13.5px] ${bothDone ? 'text-sub/70 line-through decoration-accent/50' : ''}`}>
              {r.label} <span className="ml-1 text-[11px] text-sub">{r.date}</span>
            </span>
            {PEOPLE.map(p => (
              <span key={p.key} className="flex w-9 justify-center">
                <input
                  type="checkbox"
                  checked={legDone(r.v, p.key)}
                  onChange={e => setLeg(r.key, r.v, p.key, e.target.checked)}
                  className={`stamp-check !size-[17px] ${p.key === 'yb' ? 'check-yb' : ''}`}
                  aria-label={`${r.label} ${p.name} 체크`}
                />
              </span>
            ))}
          </div>
        )
      })}
      <p className="mt-2 text-[11px] text-sub">온라인 체크인은 보통 출발 24~48시간 전에 열려요 · e-티켓 확인 필수</p>
    </PrepCard>
  )
}
