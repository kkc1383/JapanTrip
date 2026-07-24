import { push, ref, remove, update } from 'firebase/database'
import { useState, type FormEvent } from 'react'
import { db } from '../../lib/firebase'
import { useRtdbValue } from '../../hooks/useRtdb'
import type { PassportEntry } from '../../types'
import PrepCard from './PrepCard'

/** 여행일(2026-08-20) 기준 6개월 여유 기준일 */
const SAFE_UNTIL = '2027-02-20'
const TRIP_START = '2026-08-20'

export default function PassportCard() {
  const data = useRtdbValue<Record<string, PassportEntry>>('prep/passports')
  const entries = Object.entries(data ?? {})
  const [name, setName] = useState('')
  const [expiry, setExpiry] = useState('')

  const allDone = entries.length > 0 && entries.every(([, p]) => p.checked)

  function add(e: FormEvent) {
    e.preventDefault()
    const n = name.trim()
    if (!n || !expiry) return
    push(ref(db, 'prep/passports'), { name: n, expiry, checked: false })
    setName('')
    setExpiry('')
  }

  return (
    <PrepCard title="여권 확인" sub="Passport" checked={allDone}>
      <p className="mb-1.5 text-[11px] text-sub">
        일본은 체류일 이상 유효하면 입국 가능하지만, <b>6개월 미만이면 갱신 권장</b>
      </p>
      {!entries.length && (
        <p className="py-2 text-center text-[12px] text-sub">아래에 이름·만료일을 등록하세요</p>
      )}
      {entries.map(([id, p]) => {
        const expired = p.expiry < TRIP_START
        const short = !expired && p.expiry < SAFE_UNTIL
        return (
          <div key={id} className="flex items-center gap-2.5 border-b border-dashed border-line/60 py-1.5 last:border-b-0">
            <input
              type="checkbox"
              checked={p.checked}
              onChange={e => update(ref(db, `prep/passports/${id}`), { checked: e.target.checked })}
              className="stamp-check !size-[17px]"
            />
            <span className="flex-1 text-[13.5px]">{p.name}</span>
            <span className="text-[12px] text-sub">{p.expiry.replace(/-/g, '.')}</span>
            {expired ? (
              <span className="rounded-sm border border-accent/40 bg-accent-soft px-1.5 py-0.5 text-[10px] font-bold text-accent">
                만료됨!
              </span>
            ) : short ? (
              <span className="rounded-sm border border-accent/40 bg-accent-soft px-1.5 py-0.5 text-[10px] font-bold text-accent">
                6개월 미만
              </span>
            ) : (
              <span className="rounded-sm border border-indigo/40 bg-indigo/10 px-1.5 py-0.5 text-[10px] font-bold text-indigo">
                여유
              </span>
            )}
            <button
              onClick={() => remove(ref(db, `prep/passports/${id}`))}
              className="text-[13px] text-sub/50 transition-colors hover:text-accent"
              aria-label="삭제"
            >
              ✕
            </button>
          </div>
        )
      })}
      <form onSubmit={add} className="mt-2 flex gap-1.5">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="이름"
          className="field w-20 flex-none !py-1.5 text-[12.5px]"
        />
        <input
          type="date"
          value={expiry}
          onChange={e => setExpiry(e.target.value)}
          className="field flex-1 !py-1.5 text-[12.5px]"
        />
        <button type="submit" className="btn-soft shrink-0 px-3 text-[12px]">
          추가
        </button>
      </form>
    </PrepCard>
  )
}
