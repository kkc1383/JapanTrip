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
    <div className="card flex items-stretch overflow-hidden">
      <div className="flex items-center bg-indigo px-3">
        <span className="font-display text-[13px] tracking-[0.2em] text-[#fff6e9] [writing-mode:vertical-rl]">
          両替所
        </span>
      </div>
      <div className="flex flex-1 items-center justify-between px-4 py-3.5">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.3em] text-gold">JPY → KRW</p>
          <p className="font-display mt-0.5 text-[22px]">
            {per100 === null ? (
              <span className="text-sm text-sub">불러오는 중...</span>
            ) : (
              <>
                100엔 = <span className="text-accent">{per100.toFixed(1)}</span>원
              </>
            )}
          </p>
        </div>
        <div className="border-l border-dashed border-line pl-3 text-right text-[11px] leading-relaxed text-sub">
          참고용 환율
          {updated && (
            <>
              <br />
              {updated} 기준
            </>
          )}
        </div>
      </div>
    </div>
  )
}
