import { get, push, ref, remove } from 'firebase/database'
import { useState, type FormEvent } from 'react'
import ActionMenu from '../../components/ActionMenu'
import BottomSheet from '../../components/BottomSheet'
import PlaceSearchInput, { type Coords } from '../../components/PlaceSearchInput'
import DiscoverFeed from './DiscoverFeed'
import { DAYS } from '../../lib/dates'
import { db } from '../../lib/firebase'
import { placeSearchUrl } from '../../lib/googleMaps'
import { sortByOrder } from '../../lib/sort'
import { useRtdbValue } from '../../hooks/useRtdb'
import type { DayKey, ItineraryItem, WishlistItem } from '../../types'

export default function Wishlist() {
  const data = useRtdbValue<Record<string, WishlistItem>>('wishlist')
  const items = sortByOrder(data)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [place, setPlace] = useState('')
  const [memo, setMemo] = useState('')
  const [coords, setCoords] = useState<Coords>(null)
  const [movingId, setMovingId] = useState<string | null>(null)
  const [moving, setMoving] = useState(false)
  const [formEpoch, setFormEpoch] = useState(0)

  function closeSheet() {
    setSheetOpen(false)
    setTitle(''); setPlace(''); setMemo(''); setCoords(null); setFormEpoch(e => e + 1)
  }

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
    closeSheet()
  }

  async function moveToDay(id: string, it: WishlistItem, day: DayKey) {
    if (moving) return
    setMoving(true)
    try {
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
    } finally {
      setMoving(false)
      setMovingId(null)
    }
  }

  return (
    <div className="space-y-3.5">
      {!items.length && (
        <p className="empty-box">가보고 싶은 곳을 모아두고, 정해지면 일정으로 옮기세요!</p>
      )}
      {items.map(([id, it]) => (
        <div key={id} className="card px-4 py-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="font-display text-[15px] tracking-wide">{it.title}</div>
            <ActionMenu
              actions={[{ label: '삭제', danger: true, onClick: () => remove(ref(db, `wishlist/${id}`)) }]}
            />
          </div>
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
          <div className="mt-2.5 flex items-center justify-end gap-3 border-t border-dashed border-line/70 pt-2 text-[12px] text-sub">
            {movingId === id ? (
              <>
                <span className="font-display tracking-wider">어느 날로?</span>
                {DAYS.map(d => (
                  <button
                    key={d.key}
                    onClick={() => moveToDay(id, it, d.key)}
                    disabled={moving}
                    className="font-display text-accent underline underline-offset-2 disabled:opacity-50"
                  >
                    {d.label}
                  </button>
                ))}
                <button onClick={() => setMovingId(null)} className="hover:text-accent">취소</button>
              </>
            ) : (
              <button onClick={() => setMovingId(id)} className="font-display tracking-wider text-accent">
                → 일정으로 옮기기
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="empty-box w-full !py-3 transition-colors hover:border-accent hover:text-accent"
      >
        ＋ 후보 추가
      </button>

      {/* 샤오홍슈 스타일 도쿄 여행 아이디어 피드 */}
      <div className="pt-2">
        <div className="mb-2 flex items-baseline gap-2">
          <span className="inline-block size-2 shrink-0 rotate-45 bg-accent" />
          <h3 className="font-display text-[15px]">도쿄 여행 아이디어</h3>
          <span className="text-[9px] font-semibold tracking-[0.25em] text-gold uppercase">Feed</span>
          <span className="ml-1 h-px flex-1 bg-line" />
        </div>
        <DiscoverFeed />
      </div>

      <BottomSheet open={sheetOpen} title="가고 싶은 곳 추가" onClose={closeSheet}>
        <form onSubmit={submit} className="grid gap-2.5">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="가고 싶은 곳 (필수)" required className="field" />
          <PlaceSearchInput key={formEpoch} value={place} coords={coords} onChange={setPlace} onCoords={setCoords} />
          <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="메모 (왜 가고 싶은지 등)" rows={2} className="field" />
          <button type="submit" className="btn-primary">후보 추가</button>
        </form>
      </BottomSheet>
    </div>
  )
}
