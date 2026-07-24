import { useState } from 'react'
import OfflineBanner from './components/OfflineBanner'
import TabBar, { type TabKey } from './components/TabBar'
import PrepareTab from './tabs/prepare/PrepareTab'
import PlanTab from './tabs/plan/PlanTab'
import DuringTab from './tabs/during/DuringTab'

export default function App() {
  const [tab, setTab] = useState<TabKey>('prepare')
  return (
    <div className="mx-auto min-h-dvh max-w-xl bg-bg pb-24 text-ink">
      <OfflineBanner />
      <header className="px-5 pt-7 pb-1">
        <h1 className="text-2xl font-bold">일본여행 🇯🇵</h1>
        <p className="mt-1 text-sm text-sub">2026.8.20(목) – 8.22(토) · 2박 3일</p>
      </header>
      <main className="px-5 py-3">
        {tab === 'prepare' && <PrepareTab />}
        {tab === 'plan' && <PlanTab />}
        {tab === 'during' && <DuringTab />}
      </main>
      <TabBar tab={tab} onChange={setTab} />
    </div>
  )
}
