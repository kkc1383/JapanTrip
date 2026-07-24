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
        <li>· 2박 3일이면 <b>eSIM이 제일 간편</b> — 일본 3일 무제한 5천 원 안팎</li>
        <li>· eSIM 지원 기종 확인: 아이폰 XS 이후, 갤럭시 S23 이후 대부분 OK</li>
        <li>· 출국 전 설치해두고, <b>일본 도착 후 활성화</b></li>
        <li>· 미지원 폰이면 실물 유심 배송 또는 공항 수령으로</li>
      </ul>
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
