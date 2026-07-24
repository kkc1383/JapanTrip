import { ref, update } from 'firebase/database'
import { db } from '../../lib/firebase'
import { useRtdbValue } from '../../hooks/useRtdb'
import PrepCard, { type ByState } from './PrepCard'

export default function VisitJapanCard() {
  const data = useRtdbValue<{ checked?: boolean; by?: ByState }>('prep/vjw')
  // 사람별 체크 도입 이전의 공용 체크는 두 사람 모두에게 이어받음
  const by: ByState = data?.by ?? (data?.checked ? { kc: true, yb: true } : {})
  return (
    <PrepCard
      title="Visit Japan Web 등록"
      sub="입국 수속"
      by={by}
      onCheckPerson={(p, v) => update(ref(db, 'prep/vjw/by'), { ...by, [p]: v })}
    >
      <ol className="list-decimal space-y-0.5 pl-4 text-[12.5px] leading-relaxed text-ink/80">
        <li>계정 생성 후 여권·항공편(8/20 출국편) 정보 입력</li>
        <li>세관 신고 작성 → QR 코드 발급</li>
        <li>QR 스크린샷 저장 — 공항에서 바로 제시</li>
      </ol>
      <a
        href="https://www.vjw.digital.go.jp/main/#/vjwplo001"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-soft mt-2.5 inline-block px-3 py-1.5 text-[12px]"
      >
        Visit Japan Web 열기 ↗
      </a>
      <p className="mt-2 text-[11px] text-sub">출발 전날까지 등록 권장 · 두 사람 각자 등록해야 해요</p>
    </PrepCard>
  )
}
