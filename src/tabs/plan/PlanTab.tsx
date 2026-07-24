import ItinerarySection from './ItinerarySection'
import Wishlist from './Wishlist'

export default function PlanTab() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-2 text-lg font-bold">날짜별 일정</h2>
        <ItinerarySection />
      </section>
      <section>
        <h2 className="mb-2 text-lg font-bold">가고 싶은 곳</h2>
        <Wishlist />
      </section>
    </div>
  )
}
