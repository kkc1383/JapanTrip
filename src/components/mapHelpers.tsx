import L from 'leaflet'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export const TOKYO: [number, number] = [35.681, 139.767]

export function FitBounds({ points }: { points: [number, number][] }) {
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

/** 컨테이너 높이 변경 후 지도 타일 재계산 */
export function Revalidate({ dep }: { dep: unknown }) {
  const map = useMap()
  useEffect(() => {
    const id = setTimeout(() => map.invalidateSize(), 320)
    return () => clearTimeout(id)
  }, [map, dep])
  return null
}
