import { dDay } from '../../lib/dates'

export default function Dday() {
  const d = dDay()
  const stampBig = d > 0 ? `D-${d}` : d >= -2 ? '旅中' : '完'
  const stampSmall = d > 0 ? '출발까지' : d >= -2 ? '여행 중!' : '다녀왔어요'
  return (
    <div className="card flex items-center justify-between overflow-hidden px-5 py-4">
      <div className="seigaiha pointer-events-none absolute inset-0 opacity-[0.06]" />
      <div className="relative">
        <p className="text-[10px] font-semibold tracking-[0.35em] text-gold">DEPARTURE</p>
        <p className="font-display mt-1 text-xl">
          출발 <span className="text-accent">8월 20일</span> 목요일
        </p>
        <p className="mt-1 text-[12px] tracking-wide text-sub">
          {d > 0 ? `여행까지 ${d}일 남았어요` : d >= -2 ? '지금 일본에 있어요 🎌' : '즐거웠던 여행 ✈️'}
        </p>
      </div>
      <div className="hanko relative flex size-[92px] shrink-0 flex-col items-center justify-center">
        <span className="text-[9px] tracking-[0.25em]">{stampSmall}</span>
        <span className="text-[26px] leading-none">{stampBig}</span>
        <span className="mt-0.5 text-[8px] tracking-[0.2em] opacity-70">2026.08.20</span>
      </div>
    </div>
  )
}
