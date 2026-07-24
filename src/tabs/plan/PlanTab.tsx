import { useState } from 'react'
import ItinerarySection from './ItinerarySection'
import Wishlist from './Wishlist'

export default function PlanTab() {
  const [seg, setSeg] = useState<'itinerary' | 'wishlist'>('itinerary')
  return (
    <div className="stagger space-y-4">
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
