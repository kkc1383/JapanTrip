import { ref, update } from 'firebase/database'
import { db } from '../../lib/firebase'
import { useRtdbValue } from '../../hooks/useRtdb'
import PrepCard, { type ByState } from './PrepCard'

const SHOPS: { name: string; desc: string; url: string }[] = [
  { name: '유심사', desc: '일본 eSIM/유심 특가', url: 'https://www.usimsa.com' },
  { name: '도시락eSIM', desc: '와이드모바일 운영, 앱 설치 간편', url: 'https://www.dosirakesim.com' },
  { name: '말톡', desc: '일본 도코모/소프트뱅크 회선', url: 'https://shop.maaltalk.com' },
  { name: 'Airalo', desc: '글로벌 eSIM, 일본 무제한 팩', url: 'https://www.airalo.com/ko/japan-esim' },
]

export default function EsimCard() {
  const data = useRtdbValue<{ by?: ByState }>('prep/esim')
  const by: ByState = data?.by ?? {}
  return (
    <PrepCard
      title="유심 / eSIM 구매"
      sub="Data"
      by={by}
      onCheckPerson={(p, v) => update(ref(db, 'prep/esim/by'), { ...by, [p]: v })}
    >
      <ul className="space-y-0.5 text-[12.5px] leading-relaxed text-ink/80">
        <li>· 2박 3일이면 <b>eSIM이 제일 간편</b></li>
        <li>· eSIM 지원 기종 확인: 아이폰 XS 이후, 갤럭시 S23 이후 대부분 OK</li>
        <li>· 출국 전 설치해두고, <b>일본 도착 후 활성화</b></li>
        <li>· 미지원 폰이면 실물 유심 배송 또는 공항 수령으로</li>
      </ul>

      {/* 로밍망 vs 로컬망 */}
      <div className="mt-2.5 rounded-sm border border-dashed border-ink/25 bg-bg/60 p-2.5 text-[12px] leading-relaxed">
        <p className="font-display mb-1 text-[12px] tracking-wide">로컬망 vs 로밍망, 뭐가 달라요?</p>
        <p>
          <b className="text-indigo">로컬망</b> — 일본 통신사(도코모·소프트뱅크·KDDI) 회선을 직접 사용.
          속도·안정성이 가장 좋고 값도 싼 편. 대부분 데이터 전용(전화번호 없음).
        </p>
        <p className="mt-1">
          <b className="text-gold">로밍망</b> — 글로벌 사업자 회선을 경유(Airalo 등).
          설치·개통이 간편하고 여러 나라 겸용이지만, 우회 경로라 지연이 있거나 혼잡 시 느려질 수 있고 보통 더 비쌈.
        </p>
        <p className="mt-1 text-sub">→ 일본만 3일이면 <b className="text-ink/80">로컬망 상품이 가성비·품질 모두 유리</b></p>
      </div>

      {/* 3일 기준 가격대 */}
      <div className="mt-2 overflow-hidden rounded-sm border border-line">
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="bg-accent-soft/50 text-left">
              <th className="px-2 py-1.5 font-semibold">상품 유형 (3일)</th>
              <th className="px-2 py-1.5 text-right font-semibold">가격대</th>
              <th className="px-2 py-1.5 font-semibold">이런 사람</th>
            </tr>
          </thead>
          <tbody className="text-ink/85">
            <tr className="border-t border-dashed border-line">
              <td className="px-2 py-1.5">매일 1GB + 저속 무제한</td>
              <td className="px-2 py-1.5 text-right whitespace-nowrap">3~6천 원</td>
              <td className="px-2 py-1.5 text-sub">지도·카톡 위주</td>
            </tr>
            <tr className="border-t border-dashed border-line">
              <td className="px-2 py-1.5">매일 2~3GB</td>
              <td className="px-2 py-1.5 text-right whitespace-nowrap">5~9천 원</td>
              <td className="px-2 py-1.5 text-sub">사진 업로드·검색 넉넉</td>
            </tr>
            <tr className="border-t border-dashed border-line">
              <td className="px-2 py-1.5">완전 무제한 (로컬망)</td>
              <td className="px-2 py-1.5 text-right whitespace-nowrap">6천~1만 원</td>
              <td className="px-2 py-1.5 text-sub">영상·핫스팟까지</td>
            </tr>
            <tr className="border-t border-dashed border-line">
              <td className="px-2 py-1.5">글로벌 로밍형 무제한</td>
              <td className="px-2 py-1.5 text-right whitespace-nowrap">1.2~1.6만 원</td>
              <td className="px-2 py-1.5 text-sub">여러 나라 겸용</td>
            </tr>
          </tbody>
        </table>
        <p className="border-t border-dashed border-line bg-bg/60 px-2 py-1 text-[10px] text-sub">
          2026.7 확인 기준 대략 가격 — 세일에 따라 변동 (예: 도시락 3일 무제한 6,400원, Airalo 3일 $11.5)
        </p>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-1.5">
        {SHOPS.map(s => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card flex flex-col !rounded-[4px] px-2.5 py-2 !shadow-none transition-colors hover:border-accent"
          >
            <span className="font-display text-[12.5px] text-indigo">{s.name} ↗</span>
            <span className="mt-0.5 text-[10.5px] text-sub">{s.desc}</span>
          </a>
        ))}
      </div>
    </PrepCard>
  )
}
