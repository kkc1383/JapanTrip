import { push, ref, remove, update } from 'firebase/database'
import { useState, type FormEvent } from 'react'
import { db } from '../../lib/firebase'
import { sortByOrder } from '../../lib/sort'
import { useRtdbValue } from '../../hooks/useRtdb'
import type { ChecklistCategory } from '../../types'

export default function Checklist() {
  const data = useRtdbValue<Record<string, ChecklistCategory>>('checklist')
  const cats = sortByOrder(data)
  if (!cats.length) return <p className="empty-box">체크리스트를 불러오는 중...</p>
  return (
    <div className="space-y-3.5">
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
  const allDone = items.length > 0 && done === items.length

  function addItem(e: FormEvent) {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    const maxOrder = items.reduce((m, [, it]) => Math.max(m, it.order ?? 0), -1)
    push(ref(db, `checklist/${catId}/items`), { text: t, checked: false, order: maxOrder + 1 })
    setText('')
  }

  return (
    <section className="card px-4 py-3.5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[16px] tracking-wide">
          {cat.name}
          {allDone && <span className="badge-hanko ml-2">完了</span>}
        </h3>
        <span className="font-display text-[12px] text-sub">
          <span className="text-accent">{done}</span> / {items.length}
        </span>
      </div>
      {/* 진행 바 */}
      <div className="mt-2 h-[3px] w-full bg-line">
        <div
          className="h-full bg-accent transition-all duration-500"
          style={{ width: items.length ? `${(done / items.length) * 100}%` : '0%' }}
        />
      </div>
      <div className="mt-2">
        {items.map(([itemId, it]) => (
          <div key={itemId} className="flex items-center gap-3 border-b border-dashed border-line/70 py-2 last:border-b-0">
            <input
              type="checkbox"
              checked={it.checked}
              onChange={e => update(ref(db, `checklist/${catId}/items/${itemId}`), { checked: e.target.checked })}
              className="stamp-check"
            />
            <span
              className={`flex-1 text-[14px] transition-colors ${
                it.checked ? 'text-sub/70 line-through decoration-accent/50' : ''
              }`}
            >
              {it.text}
            </span>
            <button
              onClick={() => remove(ref(db, `checklist/${catId}/items/${itemId}`))}
              className="text-[12px] text-sub/60 transition-colors hover:text-accent"
            >
              삭제
            </button>
          </div>
        ))}
      </div>
      <form onSubmit={addItem} className="mt-2.5 flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="항목 추가"
          className="field flex-1 !py-2"
        />
        <button type="submit" className="btn-soft shrink-0 px-4 text-sm">
          추가
        </button>
      </form>
    </section>
  )
}
