import { push, ref, remove, update } from 'firebase/database'
import { useState, type FormEvent } from 'react'
import ActionMenu from '../../components/ActionMenu'
import BottomSheet from '../../components/BottomSheet'
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
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [time, setTime] = useState('')
  const [title, setTitle] = useState('')
  const [place, setPlace] = useState('')
  const [memo, setMemo] = useState('')
  const [coords, setCoords] = useState<Coords>(null)
  const [formEpoch, setFormEpoch] = useState(0)

  const items = sortByOrder(data?.[day])

  function resetForm() {
    setEditingId(null)
    setTime('')
    setTitle('')
    setPlace('')
    setMemo('')
    setCoords(null)
    setFormEpoch(e => e + 1)
  }

  function closeSheet() {
    setSheetOpen(false)
    resetForm()
  }

  function openAdd() {
    resetForm()
    setSheetOpen(true)
  }

  function startEdit(id: string, it: ItineraryItem) {
    setEditingId(id)
    setTime(it.time ?? '')
    setTitle(it.title)
    setPlace(it.place ?? '')
    setMemo(it.memo ?? '')
    setCoords(it.lat != null && it.lng != null ? { lat: it.lat, lng: it.lng } : null)
    setSheetOpen(true)
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
    closeSheet()
  }

  return (
    <div className="space-y-3.5">
      <DayTabs day={day} onChange={d => { setDay(d); resetForm() }} />
      {!items.length && (
        <p className="empty-box">아직 일정이 없어요 — 아래 ＋ 버튼으로 추가해 보세요</p>
      )}
      {items.map(([id, it], idx) => (
        <div key={id} className="card flex items-stretch overflow-hidden">
          <div className="flex w-[64px] shrink-0 flex-col items-center justify-center border-r border-dashed border-line bg-accent-soft/40 py-3">
            <span className="font-display text-[15px] text-accent">{it.time || '—'}</span>
            <span className="mt-0.5 text-[9px] tracking-[0.25em] text-sub">No.{String(idx + 1).padStart(2, '0')}</span>
          </div>
          <div className="flex-1 px-3.5 py-3">
            <div className="font-display text-[15px] tracking-wide">{it.title}</div>
            {it.place && (
              <a
                href={placeSearchUrl(it.place, it.lat, it.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-[12px] text-indigo underline decoration-indigo/40 underline-offset-2"
              >
                📍 {it.place}
                {it.lat != null && <span className="text-[9px] text-gold">◆</span>}
              </a>
            )}
            {it.memo && <div className="mt-1.5 text-[12px] leading-relaxed whitespace-pre-wrap text-ink/75">{it.memo}</div>}
          </div>
          <div className="flex items-start pt-2 pr-1.5">
            <ActionMenu
              actions={[
                { label: '↑ 위로', onClick: () => swapOrder(idx, idx - 1), disabled: idx === 0 },
                { label: '↓ 아래로', onClick: () => swapOrder(idx, idx + 1), disabled: idx === items.length - 1 },
                { label: '수정', onClick: () => startEdit(id, it) },
                {
                  label: '삭제',
                  danger: true,
                  onClick: () => {
                    remove(ref(db, `itinerary/${day}/${id}`))
                    if (editingId === id) closeSheet()
                  },
                },
              ]}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={openAdd}
        className="empty-box w-full !py-3 transition-colors hover:border-accent hover:text-accent"
      >
        ＋ 일정 추가
      </button>

      <BottomSheet open={sheetOpen} title={editingId ? '일정 수정' : '새 일정'} onClose={closeSheet}>
        <form onSubmit={submit} className="grid gap-2.5">
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="field" />
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="일정 제목 (필수)" required className="field" />
          <PlaceSearchInput
            key={`${formEpoch}-${editingId ?? 'new'}`}
            value={place}
            coords={coords}
            onChange={setPlace}
            onCoords={setCoords}
          />
          <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="메모" rows={2} className="field" />
          <button type="submit" className="btn-primary">
            {editingId ? '일정 수정' : '일정 추가'}
          </button>
        </form>
      </BottomSheet>
    </div>
  )
}
