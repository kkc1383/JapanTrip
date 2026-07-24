export type TabKey = 'prepare' | 'plan' | 'during'

const TABS: { key: TabKey; label: string; jp: string; icon: string }[] = [
  { key: 'prepare', label: '여행 준비', jp: '準備', icon: '🧳' },
  { key: 'plan', label: '여행 계획', jp: '計画', icon: '🗓️' },
  { key: 'during', label: '여행 중', jp: '旅中', icon: '🗾' },
]

export default function TabBar({
  tab,
  onChange,
}: {
  tab: TabKey
  onChange: (t: TabKey) => void
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-ink/70 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-xl">
        {TABS.map(t => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className="relative flex flex-1 flex-col items-center gap-0.5 pt-3 pb-2.5"
            >
              {/* 노선도식 활성 인디케이터 */}
              <span
                className={`absolute top-0 left-1/2 h-[3px] -translate-x-1/2 bg-accent transition-all duration-200 ${
                  active ? 'w-12 opacity-100' : 'w-0 opacity-0'
                }`}
              />
              <span
                className={`text-xl transition-transform duration-200 ${
                  active ? '-translate-y-0.5' : 'grayscale-[0.4] opacity-75'
                }`}
              >
                {t.icon}
              </span>
              <span
                className={`font-display text-[12px] tracking-wider ${
                  active ? 'text-accent' : 'text-sub'
                }`}
              >
                {t.label}
                <span className="ml-1 text-[9px] tracking-[0.2em] opacity-60">{t.jp}</span>
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
