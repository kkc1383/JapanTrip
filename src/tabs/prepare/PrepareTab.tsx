import Dday from './Dday'
import FxRate from './FxRate'
import Checklist from './Checklist'
import InfoCards from './InfoCards'
import SectionTitle from '../../components/SectionTitle'

export default function PrepareTab() {
  return (
    <div className="stagger space-y-7">
      <div className="space-y-3">
        <Dday />
        <FxRate />
      </div>
      <section>
        <SectionTitle ko="준비물 체크리스트" sub="Checklist" />
        <Checklist />
      </section>
      <section>
        <SectionTitle ko="준비 정보" sub="Notes" />
        <InfoCards />
      </section>
    </div>
  )
}
