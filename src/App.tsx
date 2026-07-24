import { useState } from 'react'
import OfflineBanner from './components/OfflineBanner'
import TabBar, { type TabKey } from './components/TabBar'
import PrepareTab from './tabs/prepare/PrepareTab'
import PlanTab from './tabs/plan/PlanTab'
import DuringTab from './tabs/during/DuringTab'

export default function App() {
  const [tab, setTab] = useState<TabKey>('prepare')
  return (
    <div className="mx-auto min-h-dvh max-w-xl pb-28">
      <OfflineBanner />

      <header className="relative overflow-hidden px-5 pt-7 pb-6">
        <div className="seigaiha pointer-events-none absolute inset-x-0 top-0 h-24 opacity-[0.13]" />
        {/* 붉은 태양 */}
        <div className="pointer-events-none absolute top-7 right-6 size-20 rounded-full bg-accent opacity-[0.16]" />
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
    </div>
  )
}
