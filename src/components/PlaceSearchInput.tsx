import { useState } from 'react'
import { geocode, type GeocodeResult } from '../lib/geocode'

export type Coords = { lat: number; lng: number } | null

export default function PlaceSearchInput({
  value,
  coords,
  onChange,
  onCoords,
}: {
  value: string
  coords: Coords
  onChange: (place: string) => void
  onCoords: (c: Coords) => void
}) {
  const [results, setResults] = useState<GeocodeResult[] | null>(null)
  const [searching, setSearching] = useState(false)

  async function search() {
    const q = value.trim()
    if (!q || searching) return
    setSearching(true)
    try {
      setResults(await geocode(q))
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5">
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="장소"
          className="min-w-0 flex-1 rounded-lg border border-line bg-card px-3 py-2.5 text-sm"
        />
        <button
          type="button"
          onClick={search}
          disabled={searching}
          className="shrink-0 rounded-lg bg-accent-soft px-3 text-sm font-semibold text-accent disabled:opacity-50"
        >
          {searching ? '검색 중' : '좌표 검색'}
        </button>
      </div>
      {coords && (
        <div className="flex items-center gap-2 text-[13px] text-sub">
          <span>📍 좌표 설정됨</span>
          <button type="button" onClick={() => onCoords(null)} className="underline">
            해제
          </button>
        </div>
      )}
      {results !== null && (
        <div className="overflow-hidden rounded-lg border border-line bg-card">
          {results.length === 0 && (
            <p className="px-3 py-2 text-[13px] text-sub">
              결과가 없어요 — 다른 이름으로 검색하거나 좌표 없이 저장하세요
            </p>
          )}
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onCoords({ lat: r.lat, lng: r.lng })
                setResults(null)
              }}
              className="block w-full border-b border-line px-3 py-2 text-left text-[13px] last:border-b-0 hover:bg-accent-soft"
            >
              {r.displayName}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
