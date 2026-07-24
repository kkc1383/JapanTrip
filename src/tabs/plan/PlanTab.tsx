import ItinerarySection from './ItinerarySection'
import Wishlist from './Wishlist'
import SectionTitle from '../../components/SectionTitle'

export default function PlanTab() {
  return (
    <div className="stagger space-y-7">
      <section>
        <SectionTitle ko="날짜별 일정" sub="Itinerary" />
        <ItinerarySection />
      </section>
      <section>
        <SectionTitle ko="가고 싶은 곳" sub="Wishlist" />
        <Wishlist />
      </section>
    </div>
  )
}
