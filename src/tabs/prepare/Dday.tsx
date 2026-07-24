import { dDay } from '../../lib/dates'

export default function Dday() {
  const d = dDay()
  let label: string
  if (d > 0) label = `D-${d}`
  else if (d >= -2) label = '여행 중! 🎌'
  else label = '다녀왔어요 ✈️'
  return (
    <div className="rounded-xl bg-accent px-4 py-4 text-center text-white">
      <div className="text-3xl font-bold">{label}</div>
      {d > 0 && <div className="mt-1 text-sm opacity-90">출발까지 {d}일 남았어요</div>}
    </div>
  )
}
