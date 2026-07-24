import { push, ref, remove, update } from 'firebase/database'
import { useState, type FormEvent } from 'react'
import { db } from '../../lib/firebase'
import { PEOPLE, type PersonKey } from '../../lib/people'
import { sortByOrder } from '../../lib/sort'
import { useRtdbValue } from '../../hooks/useRtdb'
import type { ChecklistCategory, ChecklistItem } from '../../types'
import PrepCard from './PrepCard'

/** 사람별 체크 여부 (사람별 필드 없던 예전 항목은 공용 checked를 이어받음) */
function isDone(it: ChecklistItem, p: PersonKey): boolean {
  return it.by?.[p] ?? it.checked ?? false
}

export default function PackingCard() {
  const data = useRtdbValue<Record<string, ChecklistCategory>>('checklist')
  const cats = sortByOrder(data)
  const [addCat, setAddCat] = useState('')
  const [addText, setAddText] = useState('')

  const allItems = cats.flatMap(([, cat]) => Object.values(cat.items ?? {}))

  function addItem(e: FormEvent) {
    e.preventDefault()
    const catId = addCat || cats[0]?.[0]
    const t = addText.trim()
    if (!catId || !t) return
    const items = Object.values(data?.[catId]?.items ?? {})
    const maxOrder = items.reduce((m, it) => Math.max(m, it.order ?? 0), -1)
    push(ref(db, `checklist/${catId}/items`), {
      text: t,
      checked: false,
      order: maxOrder + 1,
      by: { kc: false, yb: false },
    })
    setAddText('')
  }
  const total = allItems.length
  const doneBy = (p: PersonKey) => allItems.filter(it => isDone(it, p)).length
  const allDone = total > 0 && PEOPLE.every(p => doneBy(p.key) === total)

  return (
    <PrepCard title="준비물 챙기기" sub="Packing" checked={allDone}>
      {!cats.length ? (
        <p className="py-3 text-center text-[12px] text-sub">준비물을 불러오는 중...</p>
      ) : (
        <>
          <p className="mb-2 text-[11px] text-sub">옷 · 멀티탭 · 돼지코 · 충전기 등 — 경찬/예빈 각자 체크</p>
          {/* 사람별 진행 바 */}
          <div className="mb-3 space-y-1.5">
            {PEOPLE.map(p => {
              const done = doneBy(p.key)
              const color = p.key === 'kc' ? 'var(--color-accent)' : 'var(--color-indigo)'
              return (
                <div key={p.key} className="flex items-center gap-2">
                  <span className="w-8 shrink-0 text-[11.5px] font-semibold" style={{ color }}>
                    {p.name}
                  </span>
                  <div className="h-[3px] flex-1 bg-line">
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: total ? `${(done / total) * 100}%` : '0%', background: color }}
                    />
                  </div>
                  <span className="font-display w-10 shrink-0 text-right text-[11px] text-sub">
                    {done}/{total}
                  </span>
                </div>
              )
            })}
          </div>
          {/* 체크 컬럼 헤더 */}
          <div className="flex items-center justify-end gap-0 pr-6">
            {PEOPLE.map(p => (
              <span key={p.key} className="w-9 text-center text-[10px] font-semibold text-sub">
                {p.name}
              </span>
            ))}
          </div>
          <div className="space-y-3">
            {cats
              .filter(([, cat]) => Object.keys(cat.items ?? {}).length > 0)
              .map(([catId, cat]) => (
                <CategoryBlock key={catId} catId={catId} cat={cat} />
              ))}
          </div>
          {/* 항목 추가 — 카드 전체에 하나 */}
          <form onSubmit={addItem} className="mt-3 flex gap-1.5 border-t border-dashed border-line pt-2.5">
            <select
              value={addCat || cats[0]?.[0] || ''}
              onChange={e => setAddCat(e.target.value)}
              className="field w-[92px] flex-none !px-1.5 !py-1.5 text-[12px]"
            >
              {cats.map(([id, c]) => (
                <option key={id} value={id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              value={addText}
              onChange={e => setAddText(e.target.value)}
              placeholder="항목 추가"
              className="field flex-1 !py-1.5 text-[12.5px]"
            />
            <button type="submit" className="btn-soft shrink-0 px-3 text-[12px]">
              추가
            </button>
          </form>
        </>
      )}
    </PrepCard>
  )
}

function CategoryBlock({ catId, cat }: { catId: string; cat: ChecklistCategory }) {
  const items = sortByOrder(cat.items)

  return (
    <div>
      <p className="font-display mb-0.5 text-[12.5px] tracking-wide text-indigo">{cat.name}</p>
      {items.map(([itemId, it]) => {
        const bothDone = PEOPLE.every(p => isDone(it, p.key))
        return (
          <div key={itemId} className="flex items-center border-b border-dashed border-line/60 py-1.5 last:border-b-0">
            <span className={`flex-1 text-[13.5px] ${bothDone ? 'text-sub/70 line-through decoration-accent/50' : ''}`}>
              {it.text}
            </span>
            {PEOPLE.map(p => (
              <span key={p.key} className="flex w-9 justify-center">
                <input
                  type="checkbox"
                  checked={isDone(it, p.key)}
                  onChange={e =>
                    update(ref(db, `checklist/${catId}/items/${itemId}/by`), { [p.key]: e.target.checked })
                  }
                  className={`stamp-check !size-[17px] ${p.key === 'yb' ? 'check-yb' : ''}`}
                  aria-label={`${p.name} 체크`}
                />
              </span>
            ))}
            <button
              onClick={() => remove(ref(db, `checklist/${catId}/items/${itemId}`))}
              className="w-6 text-center text-[13px] text-sub/50 transition-colors hover:text-accent"
              aria-label="삭제"
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
