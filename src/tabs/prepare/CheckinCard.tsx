import { ref, update } from 'firebase/database'
import { db } from '../../lib/firebase'
import { useRtdbValue } from '../../hooks/useRtdb'
import PrepCard from './PrepCard'

export default function CheckinCard() {
  const data = useRtdbValue<{ out?: boolean; back?: boolean }>('prep/checkin')
  const allDone = (data?.out ?? false) && (data?.back ?? false)

  const rows = [
    { key: 'out', label: '가는 편 체크인', date: '8/20 (목) 출국', checked: data?.out ?? false },
    { key: 'back', label: '오는 편 체크인', date: '8/22 (토) 귀국', checked: data?.back ?? false },
  ]

  return (
    <PrepCard title="항공권 체크인" sub="Check-in" checked={allDone}>
      {rows.map(r => (
        <div key={r.key} className="flex items-center gap-2.5 border-b border-dashed border-line/60 py-2 last:border-b-0">
          <input
            type="checkbox"
            checked={r.checked}
            onChange={e => update(ref(db, 'prep/checkin'), { [r.key]: e.target.checked })}
            className="stamp-check"
          />
          <span className={`flex-1 text-[13.5px] ${r.checked ? 'text-sub/70 line-through decoration-accent/50' : ''}`}>
            {r.label}
          </span>
          <span className="text-[11px] text-sub">{r.date}</span>
        </div>
      ))}
      <p className="mt-2 text-[11px] text-sub">온라인 체크인은 보통 출발 24~48시간 전에 열려요 · e-티켓 확인 필수</p>
    </PrepCard>
  )
}
