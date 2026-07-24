export type GeocodeResult = { displayName: string; lat: number; lng: number }

export async function geocode(query: string): Promise<GeocodeResult[]> {
  const url =
    'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=ko&q=' +
    encodeURIComponent(query)
  const res = await fetch(url)
  if (!res.ok) return []
  const data: { display_name: string; lat: string; lon: string }[] = await res.json()
  return data.map(d => ({
    displayName: d.display_name,
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lon),
  }))
}
