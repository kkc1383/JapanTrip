import { push, ref, remove, update } from 'firebase/database'
import { useState, type FormEvent } from 'react'
import DayTabs from '../../components/DayTabs'
import PlaceSearchInput, { type Coords } from '../../components/PlaceSearchInput'
import { db } from '../../lib/firebase'
import { placeSearchUrl } from '../../lib/googleMaps'
import { sortByOrder } from '../../lib/sort'
import { useRtdbValue } from '../../hooks/useRtdb'
import type { DayKey, ItineraryItem } from '../../types'

export default function ItinerarySection() {
  const data = useRtdbValue<Partial<Record<DayKey, Record<string, ItineraryItem>>>>('itinerary')
  const [day, setDay] = useState<DayKey>('day1')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [time, setTime] = useState('')
  const [title, setTitle] = useState('')
  const [place, setPlace] = useState('')
  const [memo, setMemo] = useState('')
  const [coords, setCoords] = useState<Coords>(null)

  const items = sortByOrder(data?.[day])

  function resetForm() {
    setEditingId(null)
    setTime('')
    setTitle('')
    setPlace('')
    setMemo('')
    setCoords(null)
  }

  function startEdit(id: string, it: ItineraryItem) {
    setEditingId(id)
    setTime(it.time ?? '')
    setTitle(it.title)
    setPlace(it.place ?? '')
    setMemo(it.memo ?? '')
    setCoords(it.lat != null && it.lng != null ? { lat: it.lat, lng: it.lng } : null)
  }

  function swapOrder(i: number, j: number) {
    const [idA, a] = items[i]
    const [idB, b] = items[j]
    update(ref(db, `itinerary/${day}`), {
      [`${idA}/order`]: b.order ?? j,
      [`${idB}/order`]: a.order ?? i,
    })
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    const item = {
      time,
      title: t,
      place: place.trim(),
      memo: memo.trim(),
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
    }
    if (editingId) {
      update(ref(db, `itinerary/${day}/${editingId}`), item)
    } else {
      const maxOrder = items.reduce((m, [, it]) => Math.max(m, it.order ?? 0), -1)
      push(ref(db, `itinerary/${day}`), { ...item, order: maxOrder + 1 })
    }
    resetForm()
  }

  return (
    <div className="space-y-3">
      <DayTabs day={day} onChange={d => { setDay(d); resetForm() }} />
      {!items.length && (
        <p className="py-8 text-center text-sm text-sub">아직 일정이 없어요. 아래에서 추가해 보세요!</p>
      )}
      {items.map(([id, it], idx) => (
        <div key={id} className="flex items-start gap-3 rounded-xl border border-line bg-card px-4 py-3.5">
          <div className="min-w-12 pt-0.5 text-sm font-bold text-accent">{it.time || '—'}</div>
          <div className="flex-1">
            <div className="font-semibold">{it.title}</div>
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
          <div className="flex flex-col gap-0.5 text-[13px] text-sub">
            <button disabled={idx === 0} onClick={() => swapOrder(idx, idx - 1)} className="disabled:opacity-30">▲</button>
            <button disabled={idx === items.length - 1} onClick={() => swapOrder(idx, idx + 1)} className="disabled:opacity-30">▼</button>
            <button onClick={() => startEdit(id, it)} className="hover:text-accent">수정</button>
            <button
              onClick={() => {
                remove(ref(db, `itinerary/${day}/${id}`))
                if (editingId === id) resetForm()
              }}
              className="hover:text-accent"
            >
              삭제
            </button>
          </div>
        </div>
      ))}
      <form onSubmit={submit} className="grid gap-2">
        <input type="time" value={time} onChange={e => setTime(e.target.value)}
          className="rounded-lg border border-line bg-card px-3 py-2.5 text-sm" />
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="일정 제목 (필수)" required
          className="rounded-lg border border-line bg-card px-3 py-2.5 text-sm" />
        <PlaceSearchInput value={place} coords={coords} onChange={setPlace} onCoords={setCoords} />
        <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="메모" rows={2}
          className="rounded-lg border border-line bg-card px-3 py-2.5 text-sm" />
        <button type="submit" className="rounded-lg bg-accent py-2.5 text-[15px] font-semibold text-white">
          {editingId ? '일정 수정' : '일정 추가'}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} className="text-[13px] text-sub">수정 취소</button>
        )}
      </form>
    </div>
  )
}
