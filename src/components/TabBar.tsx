export type TabKey = 'prepare' | 'plan' | 'during'

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'prepare', label: '여행 준비', icon: '🧳' },
  { key: 'plan', label: '여행 계획', icon: '🗓️' },
  { key: 'during', label: '여행 중', icon: '🗾' },
]

export default function TabBar({
  tab,
  onChange,
}: {
  tab: TabKey
  onChange: (t: TabKey) => void
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-xl">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${
              tab === t.key ? 'font-semibold text-accent' : 'text-sub'
            }`}
          >
            <span className="text-xl">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
