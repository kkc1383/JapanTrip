import BaggageCard from './BaggageCard'
import CheckinCard from './CheckinCard'
import FxSection from './FxSection'
import InfoCards from './InfoCards'
import PackingCard from './PackingCard'
import PassportCard from './PassportCard'
import VisitJapanCard from './VisitJapanCard'
import SectionTitle from '../../components/SectionTitle'

export default function PrepareTab() {
  return (
    <div className="stagger space-y-4">
      <FxSection />
      <VisitJapanCard />
      <BaggageCard />
      <PackingCard />
      <PassportCard />
      <CheckinCard />
      <section className="pt-2">
        <SectionTitle ko="여행 메모" sub="Notes" />
        <InfoCards />
      </section>
    </div>
  )
}
