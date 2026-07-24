import { DAYS } from '../lib/dates'
import type { DayKey } from '../types'

export default function DayTabs({
  day,
  onChange,
}: {
  day: DayKey
  onChange: (d: DayKey) => void
}) {
  return (
    <div className="flex gap-1.5">
      {DAYS.map(d => (
        <button
          key={d.key}
          type="button"
          onClick={() => onChange(d.key)}
          className={`flex-1 rounded-lg border py-2 text-sm ${
            day === d.key
              ? 'border-accent bg-accent-soft font-semibold text-accent'
              : 'border-line bg-card text-sub'
          }`}
        >
          {d.label}
        </button>
      ))}
    </div>
  )
}
