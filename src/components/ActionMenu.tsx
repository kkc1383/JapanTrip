import { useState } from 'react'

export type Action = {
  label: string
  onClick: () => void
  danger?: boolean
  disabled?: boolean
}

export default function ActionMenu({ actions }: { actions: Action[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        aria-label="더보기"
        onClick={() => setOpen(o => !o)}
        className="px-2 py-1 text-[16px] leading-none text-sub/70 transition-colors hover:text-accent"
      >
        ⋯
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="card absolute right-0 z-20 mt-1 w-[120px] overflow-hidden py-1 text-[13px]">
            {actions.map((a, i) => (
              <button
                key={i}
                type="button"
                disabled={a.disabled}
                onClick={() => {
                  setOpen(false)
                  a.onClick()
                }}
                className={`block w-full px-3.5 py-2 text-left transition-colors hover:bg-accent-soft disabled:opacity-30 ${
                  a.danger ? 'text-accent' : ''
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
