import { lazy, Suspense, useState } from 'react'
import ItinerarySection from './ItinerarySection'
import Wishlist from './Wishlist'

// Leaflet 번들이 커서 지도는 필요할 때만 로드
const PlanMap = lazy(() => import('./PlanMap'))

export default function PlanTab() {
  const [seg, setSeg] = useState<'itinerary' | 'wishlist'>('itinerary')
  return (
    <div className="stagger space-y-4">
      <Suspense fallback={<div className="card flex h-52 items-center justify-center text-[12px] text-sub">지도 불러오는 중...</div>}>
        <PlanMap />
      </Suspense>
      <div className="segment">
        <button
          type="button"
          className={seg === 'itinerary' ? 'seg-active' : ''}
          onClick={() => setSeg('itinerary')}
        >
          날짜별 일정
        </button>
        <button
          type="button"
          className={seg === 'wishlist' ? 'seg-active' : ''}
          onClick={() => setSeg('wishlist')}
        >
          가고 싶은 곳
        </button>
      </div>
      {seg === 'itinerary' ? <ItinerarySection /> : <Wishlist />}
    </div>
  )
}
