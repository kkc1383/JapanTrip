import { ref, update } from 'firebase/database'
import { db } from '../../lib/firebase'
import { useRtdbValue } from '../../hooks/useRtdb'
import PrepCard, { type ByState } from './PrepCard'

export default function PassportCard() {
  const data = useRtdbValue<{ by?: ByState }>('prep/passport')
  const by: ByState = data?.by ?? {}
  return (
    <PrepCard
      title="여권 만료일 확인했나요?"
      sub="Passport"
      by={by}
      onCheckPerson={(p, v) => update(ref(db, 'prep/passport/by'), { ...by, [p]: v })}
    >
      <p className="text-[12.5px] leading-relaxed text-ink/80">
        일본은 체류일 이상 유효하면 입국 가능하지만, <b>6개월 미만이면 갱신을 권장</b>해요.
        여권 사진면에서 만료일을 확인하고 각자 체크!
      </p>
    </PrepCard>
  )
}
