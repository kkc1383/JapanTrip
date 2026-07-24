import type { ReactNode } from 'react'

/**
 * 준비 항목 카드 껍데기.
 * onCheck가 있으면 우측에 체크박스, checked면 完了 도장.
 * onCheck 없이 checked만 주면(파생 완료) 도장만 표시.
 */
export default function PrepCard({
  title,
  sub,
  checked,
  onCheck,
  children,
}: {
  title: string
  sub?: string
  checked: boolean
  onCheck?: (v: boolean) => void
  children: ReactNode
}) {
  return (
    <section className={`card px-4 py-3.5 transition-opacity ${checked ? 'opacity-75' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display flex items-center gap-2 text-[15px]">
          {title}
          {sub && <span className="text-[9px] font-semibold tracking-[0.25em] text-gold uppercase">{sub}</span>}
        </h3>
        <div className="flex items-center gap-2">
          {checked && <span className="badge-hanko">完了</span>}
          {onCheck && (
            <input
              type="checkbox"
              checked={checked}
              onChange={e => onCheck(e.target.checked)}
              className="stamp-check"
            />
          )}
        </div>
      </div>
      <div className="mt-2.5">{children}</div>
    </section>
  )
}
