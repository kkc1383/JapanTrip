export function placeSearchUrl(place: string, lat?: number, lng?: number): string {
  return lat != null && lng != null
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`
}

/** 구글맵 길찾기 — 출발지는 구글맵이 현재 위치로 자동 설정, 도쿄는 대중교통 기본 */
export function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`
}
