import { push, ref, remove, update } from 'firebase/database'
import { useState, type FormEvent } from 'react'
import { db } from '../../lib/firebase'
import { sortByOrder } from '../../lib/sort'
import { useRtdbValue } from '../../hooks/useRtdb'
import type { ChecklistCategory } from '../../types'

export default function Checklist() {
  const data = useRtdbValue<Record<string, ChecklistCategory>>('checklist')
  const cats = sortByOrder(data)
  if (!cats.length) return <p className="py-8 text-center text-sm text-sub">체크리스트를 불러오는 중...</p>
  return (
    <div className="space-y-3">
      {cats.map(([catId, cat]) => (
        <Category key={catId} catId={catId} cat={cat} />
      ))}
    </div>
  )
}

function Category({ catId, cat }: { catId: string; cat: ChecklistCategory }) {
  const [text, setText] = useState('')
  const items = sortByOrder(cat.items)
  const done = items.filter(([, it]) => it.checked).length

  function addItem(e: FormEvent) {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    const maxOrder = items.reduce((m, [, it]) => Math.max(m, it.order ?? 0), -1)
    push(ref(db, `checklist/${catId}/items`), { text: t, checked: false, order: maxOrder + 1 })
    setText('')
  }

  return (
    <section className="rounded-xl border border-line bg-card px-4 py-3.5">
      <h2 className="text-base font-semibold">
        {cat.name} <span className="ml-1 text-[13px] font-normal text-sub">{done}/{items.length}</span>
      </h2>
      <div className="mt-1">
        {items.map(([itemId, it]) => (
          <div key={itemId} className="flex items-center gap-2.5 py-1.5">
            <input
              type="checkbox"
              checked={it.checked}
              onChange={e => update(ref(db, `checklist/${catId}/items/${itemId}`), { checked: e.target.checked })}
              className="size-5 accent-accent"
            />
            <span className={`flex-1 text-[15px] ${it.checked ? 'text-sub line-through' : ''}`}>{it.text}</span>
            <button
              onClick={() => remove(ref(db, `checklist/${catId}/items/${itemId}`))}
              className="text-[13px] text-sub hover:text-accent"
            >
              삭제
            </button>
          </div>
        ))}
      </div>
      <form onSubmit={addItem} className="mt-2 flex gap-1.5">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="항목 추가"
          className="min-w-0 flex-1 rounded-lg border border-line px-2.5 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-accent-soft px-3.5 font-semibold text-accent">
          추가
        </button>
      </form>
    </section>
  )
}
