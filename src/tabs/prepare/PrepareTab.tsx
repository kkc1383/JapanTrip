import Dday from './Dday'
import FxRate from './FxRate'
import Checklist from './Checklist'
import InfoCards from './InfoCards'

export default function PrepareTab() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Dday />
        <FxRate />
      </div>
      <section>
        <h2 className="mb-2 text-lg font-bold">준비물 체크리스트</h2>
        <Checklist />
      </section>
      <section>
        <h2 className="mb-2 text-lg font-bold">준비 정보</h2>
        <InfoCards />
      </section>
    </div>
  )
}
