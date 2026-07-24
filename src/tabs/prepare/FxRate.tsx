import { useEffect, useState } from 'react'

export default function FxRate() {
  const [per100, setPer100] = useState<number | null>(null)
  const [updated, setUpdated] = useState('')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/JPY')
      .then(r => r.json())
      .then((d: { result: string; rates?: { KRW?: number }; time_last_update_utc?: string }) => {
        if (d.result !== 'success' || !d.rates?.KRW) throw new Error('bad response')
        setPer100(d.rates.KRW * 100)
        if (d.time_last_update_utc) {
          setUpdated(new Date(d.time_last_update_utc).toLocaleDateString('ko-KR'))
        }
      })
      .catch(() => setFailed(true))
  }, [])

  if (failed) return null
  return (
    <div className="flex items-center justify-between rounded-xl border border-line bg-card px-4 py-3.5">
      <div>
        <div className="text-[13px] text-sub">엔화 환율 (참고용)</div>
        <div className="text-xl font-bold">
          {per100 === null ? '불러오는 중...' : `100엔 = ${per100.toFixed(1)}원`}
        </div>
      </div>
      {updated && <div className="text-[12px] text-sub">{updated} 기준</div>}
    </div>
  )
}
