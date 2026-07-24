import type { ReactNode } from 'react'
import { PEOPLE, type PersonKey } from '../../lib/people'

export type ByState = { kc?: boolean; yb?: boolean }

/**
 * 준비 항목 카드 껍데기.
 * - onCheckPerson이 있으면 우측에 경찬/예빈 개인 체크 2칸 — 둘 다 체크 시 完了
 * - 없으면 checked(파생 완료)로 도장만 표시
 */
export default function PrepCard({
  title,
  sub,
  checked,
  by,
  onCheckPerson,
  children,
}: {
  title: string
  sub?: string
  checked?: boolean
  by?: ByState
  onCheckPerson?: (p: PersonKey, v: boolean) => void
  children: ReactNode
}) {
  const done = onCheckPerson
    ? PEOPLE.every(p => by?.[p.key] ?? false)
    : (checked ?? false)

  return (
    <section className={`card px-4 py-3.5 transition-opacity ${done ? 'opacity-75' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display flex items-center gap-2 text-[15px]">
          {title}
          {sub && <span className="text-[9px] font-semibold tracking-[0.25em] text-gold uppercase">{sub}</span>}
        </h3>
        <div className="flex items-center gap-2.5">
          {done && <span className="badge-hanko">完了</span>}
          {onCheckPerson &&
            PEOPLE.map(p => (
              <label key={p.key} className="flex flex-col items-center gap-0.5">
                <span
                  className="text-[9px] leading-none font-semibold"
                  style={{ color: p.key === 'kc' ? 'var(--color-accent)' : 'var(--color-indigo)' }}
                >
                  {p.name}
                </span>
                <input
                  type="checkbox"
                  checked={by?.[p.key] ?? false}
                  onChange={e => onCheckPerson(p.key, e.target.checked)}
                  className={`stamp-check !size-[17px] ${p.key === 'yb' ? 'check-yb' : ''}`}
                  aria-label={`${p.name} 완료 체크`}
                />
              </label>
            ))}
        </div>
      </div>
      <div className="mt-2.5">{children}</div>
    </section>
  )
}
