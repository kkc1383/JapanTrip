import { push, ref, remove, update } from 'firebase/database'
import { useState, type FormEvent } from 'react'
import { db } from '../../lib/firebase'
import { sortByOrder } from '../../lib/sort'
import { useRtdbValue } from '../../hooks/useRtdb'
import type { ChecklistCategory } from '../../types'
import PrepCard from './PrepCard'

export default function PackingCard() {
  const data = useRtdbValue<Record<string, ChecklistCategory>>('checklist')
  const cats = sortByOrder(data)

  const allItems = cats.flatMap(([, cat]) => Object.values(cat.items ?? {}))
  const done = allItems.filter(it => it.checked).length
  const allDone = allItems.length > 0 && done === allItems.length

  return (
    <PrepCard title="준비물 챙기기" sub="Packing" checked={allDone}>
      {!cats.length ? (
        <p className="py-3 text-center text-[12px] text-sub">준비물을 불러오는 중...</p>
      ) : (
        <>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] text-sub">옷 · 멀티탭 · 돼지코 · 충전기 등 짐 싸기 체크</span>
            <span className="font-display text-[12px] text-sub">
              <span className="text-accent">{done}</span> / {allItems.length}
            </span>
          </div>
          <div className="mb-2 h-[3px] w-full bg-line">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: allItems.length ? `${(done / allItems.length) * 100}%` : '0%' }}
            />
          </div>
          <div className="space-y-3">
            {cats.map(([catId, cat]) => (
              <CategoryBlock key={catId} catId={catId} cat={cat} />
            ))}
          </div>
        </>
      )}
    </PrepCard>
  )
}

function CategoryBlock({ catId, cat }: { catId: string; cat: ChecklistCategory }) {
  const [text, setText] = useState('')
  const items = sortByOrder(cat.items)

  function addItem(e: FormEvent) {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    const maxOrder = items.reduce((m, [, it]) => Math.max(m, it.order ?? 0), -1)
    push(ref(db, `checklist/${catId}/items`), { text: t, checked: false, order: maxOrder + 1 })
    setText('')
  }

  return (
    <div>
      <p className="font-display mb-0.5 text-[12.5px] tracking-wide text-indigo">{cat.name}</p>
      {items.map(([itemId, it]) => (
        <div key={itemId} className="flex items-center gap-2.5 border-b border-dashed border-line/60 py-1.5 last:border-b-0">
          <input
            type="checkbox"
            checked={it.checked}
            onChange={e => update(ref(db, `checklist/${catId}/items/${itemId}`), { checked: e.target.checked })}
            className="stamp-check !size-[17px]"
          />
          <span className={`flex-1 text-[13.5px] ${it.checked ? 'text-sub/70 line-through decoration-accent/50' : ''}`}>
            {it.text}
          </span>
          <button
            onClick={() => remove(ref(db, `checklist/${catId}/items/${itemId}`))}
            className="text-[13px] text-sub/50 transition-colors hover:text-accent"
            aria-label="삭제"
          >
            ✕
          </button>
        </div>
      ))}
      <form onSubmit={addItem} className="mt-1.5 flex gap-1.5">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="항목 추가"
          className="field flex-1 !py-1.5 text-[12.5px]"
        />
        <button type="submit" className="btn-soft shrink-0 px-3 text-[12px]">
          추가
        </button>
      </form>
    </div>
  )
}
