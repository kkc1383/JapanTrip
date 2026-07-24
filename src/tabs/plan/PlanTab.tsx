import ItinerarySection from './ItinerarySection'

export default function PlanTab() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-2 text-lg font-bold">날짜별 일정</h2>
        <ItinerarySection />
      </section>
    </div>
  )
}
