import { useState } from 'react'
import { dDay } from './lib/dates'
import ChatBot from './components/ChatBot'
import OfflineBanner from './components/OfflineBanner'
import TabBar, { type TabKey } from './components/TabBar'
import PrepareTab from './tabs/prepare/PrepareTab'
import PlanTab from './tabs/plan/PlanTab'
import DuringTab from './tabs/during/DuringTab'

export default function App() {
  const [tab, setTab] = useState<TabKey>('prepare')
  const d = dDay()
  return (
    <div className="mx-auto min-h-dvh max-w-xl pb-28">
      <OfflineBanner />

      <header className="relative overflow-hidden px-5 pt-7 pb-6">
        <div className="seigaiha pointer-events-none absolute inset-x-0 top-0 h-24 opacity-[0.13]" />
        {/* D-day 한코 스탬프 */}
        <div className="hanko absolute top-7 right-5 flex size-[72px] flex-col items-center justify-center">
          <span className="text-[8px] tracking-[0.15em]">{d > 0 ? '출발까지' : d >= -2 ? '여행 중' : '완주'}</span>
          <span className="text-[19px] leading-tight font-bold">{d > 0 ? `D-${d}` : d >= -2 ? '旅中' : '完'}</span>
        </div>
        <p className="relative text-[10px] font-semibold tracking-[0.42em] text-indigo">
          SUMMER TRIP · JAPAN
        </p>
        <h1 className="font-display relative mt-1.5 text-[34px] leading-tight tracking-tight">
          일본<span className="text-accent">여행</span>
          <span className="ml-2 align-middle text-sm tracking-[0.35em] text-sub">日本旅行</span>
        </h1>
        <div className="relative mt-3 inline-flex items-center gap-2 border border-dashed border-ink/35 bg-card/70 px-3 py-1.5 text-[12px] tracking-wider text-ink/80">
          <span className="text-accent">✂</span>
          2026.08.20 <span className="text-sub">목</span> → 08.22 <span className="text-sub">토</span>
          <span className="text-sub">·</span> 2박 3일
        </div>
      </header>

      <main key={tab} className="tab-in px-5">
        {tab === 'prepare' && <PrepareTab />}
        {tab === 'plan' && <PlanTab />}
        {tab === 'during' && <DuringTab />}
      </main>

      <TabBar tab={tab} onChange={setTab} />
      <ChatBot />
    </div>
  )
}
