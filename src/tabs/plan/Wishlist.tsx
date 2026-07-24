import { get, push, ref, remove } from 'firebase/database'
import { useState, type FormEvent } from 'react'
import PlaceSearchInput, { type Coords } from '../../components/PlaceSearchInput'
import { DAYS } from '../../lib/dates'
import { db } from '../../lib/firebase'
import { placeSearchUrl } from '../../lib/googleMaps'
import { sortByOrder } from '../../lib/sort'
import { useRtdbValue } from '../../hooks/useRtdb'
import type { DayKey, ItineraryItem, WishlistItem } from '../../types'

export default function Wishlist() {
  const data = useRtdbValue<Record<string, WishlistItem>>('wishlist')
  const items = sortByOrder(data)
  const [title, setTitle] = useState('')
  const [place, setPlace] = useState('')
  const [memo, setMemo] = useState('')
  const [coords, setCoords] = useState<Coords>(null)
  const [movingId, setMovingId] = useState<string | null>(null)
  const [formEpoch, setFormEpoch] = useState(0)

  function submit(e: FormEvent) {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    const maxOrder = items.reduce((m, [, it]) => Math.max(m, it.order ?? 0), -1)
    push(ref(db, 'wishlist'), {
      title: t,
      place: place.trim(),
      memo: memo.trim(),
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      order: maxOrder + 1,
    })
    setTitle(''); setPlace(''); setMemo(''); setCoords(null); setFormEpoch(e => e + 1)
  }

  async function moveToDay(id: string, it: WishlistItem, day: DayKey) {
    const snap = await get(ref(db, `itinerary/${day}`))
    const existing = (snap.val() ?? {}) as Record<string, ItineraryItem>
    const maxOrder = Object.values(existing).reduce((m, i) => Math.max(m, i.order ?? 0), -1)
    await push(ref(db, `itinerary/${day}`), {
      time: '',
      title: it.title,
      place: it.place ?? '',
      memo: it.memo ?? '',
      lat: it.lat ?? null,
      lng: it.lng ?? null,
      order: maxOrder + 1,
    })
    await remove(ref(db, `wishlist/${id}`))
    setMovingId(null)
  }

  return (
    <div className="space-y-3">
      {!items.length && (
        <p className="py-6 text-center text-sm text-sub">
          가보고 싶은 곳을 모아두고, 정해지면 일정으로 옮기세요!
        </p>
      )}
      {items.map(([id, it]) => (
        <div key={id} className="rounded-xl border border-line bg-card px-4 py-3.5">
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
          <div className="mt-2 flex items-center justify-end gap-3 text-[13px] text-sub">
            {movingId === id ? (
              <>
                <span>어느 날로?</span>
                {DAYS.map(d => (
                  <button key={d.key} onClick={() => moveToDay(id, it, d.key)} className="font-semibold text-accent">
                    {d.label}
                  </button>
                ))}
                <button onClick={() => setMovingId(null)}>취소</button>
              </>
            ) : (
              <>
                <button onClick={() => setMovingId(id)} className="font-semibold text-accent">
                  일정으로 옮기기
                </button>
                <button onClick={() => remove(ref(db, `wishlist/${id}`))} className="hover:text-accent">
                  삭제
                </button>
              </>
            )}
          </div>
        </div>
      ))}
      <form onSubmit={submit} className="grid gap-2">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="가고 싶은 곳 (필수)" required
          className="rounded-lg border border-line bg-card px-3 py-2.5 text-sm" />
        <PlaceSearchInput key={formEpoch} value={place} coords={coords} onChange={setPlace} onCoords={setCoords} />
        <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="메모 (왜 가고 싶은지 등)" rows={2}
          className="rounded-lg border border-line bg-card px-3 py-2.5 text-sm" />
        <button type="submit" className="rounded-lg bg-accent-soft py-2.5 text-[15px] font-semibold text-accent">
          후보 추가
        </button>
      </form>
    </div>
  )
}
