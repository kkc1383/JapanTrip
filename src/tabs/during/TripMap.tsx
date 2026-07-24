import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
import { useEffect, useState } from 'react'
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { directionsUrl } from '../../lib/googleMaps'
import type { ItineraryItem } from '../../types'

L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

const TOKYO: [number, number] = [35.681, 139.767]

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 })
    } else {
      map.setView(TOKYO, 12)
    }
  }, [map, JSON.stringify(points)])
  return null
}

export default function TripMap({ items }: { items: [string, ItineraryItem][] }) {
  const [myPos, setMyPos] = useState<[number, number] | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) return
    const id = navigator.geolocation.watchPosition(
      p => setMyPos([p.coords.latitude, p.coords.longitude]),
      () => setMyPos(null),
      { enableHighAccuracy: true, maximumAge: 10000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [])

  const markers = items.filter(([, it]) => it.lat != null && it.lng != null)
  const points = markers.map(([, it]) => [it.lat!, it.lng!] as [number, number])

  return (
    <div className="card relative z-0 overflow-hidden !p-0">
      {/* 지도 상단 라벨 */}
      <div className="flex items-center justify-between border-b border-dashed border-line bg-card px-3 py-1.5">
        <span className="font-display text-[12px] tracking-[0.25em] text-indigo">旅程地圖 · MAP</span>
        <span className="text-[10px] tracking-wider text-sub">{markers.length}곳 표시됨</span>
      </div>
      <div className="relative h-72">
        <MapContainer center={TOKYO} zoom={12} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={points} />
          {markers.map(([id, it]) => (
            <Marker key={id} position={[it.lat!, it.lng!]}>
              <Popup>
                <div className="text-sm font-semibold">{it.time ? `${it.time} · ` : ''}{it.title}</div>
                {it.place && <div className="text-xs">{it.place}</div>}
                <a
                  href={directionsUrl(it.lat!, it.lng!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline"
                >
                  구글맵 길찾기
                </a>
              </Popup>
            </Marker>
          ))}
          {myPos && (
            <CircleMarker
              center={myPos}
              radius={8}
              pathOptions={{ color: '#33557e', fillColor: '#33557e', fillOpacity: 0.85 }}
            >
              <Popup>내 위치</Popup>
            </CircleMarker>
          )}
        </MapContainer>
        {!markers.length && (
          <div className="pointer-events-none absolute inset-x-0 top-2 z-[500] text-center">
            <span className="rounded-sm border border-dashed border-ink/30 bg-card/95 px-3 py-1 text-[11px] tracking-wide text-sub">
              좌표가 등록된 일정이 없어요 — 여행 계획 탭에서 좌표 검색으로 추가하세요
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
