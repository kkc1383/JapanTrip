import { DAYS } from '../lib/dates'
import type { DayKey } from '../types'

const JP_DAY = ['一日目', '二日目', '三日目']

export default function DayTabs({
  day,
  onChange,
}: {
  day: DayKey
  onChange: (d: DayKey) => void
}) {
  return (
    <div className="flex gap-2.5">
      {DAYS.map((d, i) => {
        const active = day === d.key
        return (
          <button
            key={d.key}
            type="button"
            onClick={() => onChange(d.key)}
            className={`stub flex-1 py-2 text-center ${active ? 'stub-active' : 'text-sub'}`}
          >
            <span className="font-display block text-[13px] tracking-wide">{d.label}</span>
            <span className={`block text-[9px] tracking-[0.3em] ${active ? 'opacity-80' : 'opacity-50'}`}>
              {JP_DAY[i]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
