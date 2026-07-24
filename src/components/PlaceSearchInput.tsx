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
      <div className="flex gap-2">
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              search()
            }
          }}
          placeholder="장소"
          className="field flex-1"
        />
        <button
          type="button"
          onClick={search}
          disabled={searching}
          className="btn-soft shrink-0 px-3 text-sm disabled:opacity-50"
        >
          {searching ? '검색 중' : '좌표 검색'}
        </button>
      </div>
      {coords && (
        <div className="flex items-center gap-2 text-[12px] text-indigo">
          <span className="badge-hanko !rotate-0 !border-indigo !text-indigo">📍 좌표 설정됨</span>
          <button type="button" onClick={() => onCoords(null)} className="text-sub underline underline-offset-2">
            해제
          </button>
        </div>
      )}
      {results !== null && (
        <div className="card overflow-hidden !shadow-none">
          {results.length === 0 && (
            <p className="px-3 py-2.5 text-[12px] text-sub">
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
              className="block w-full border-b border-dashed border-line px-3 py-2.5 text-left text-[12px] transition-colors last:border-b-0 hover:bg-accent-soft"
            >
              <span className="mr-1.5 text-accent">▸</span>
              {r.displayName}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
