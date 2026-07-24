import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export default function BottomSheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null
  // 포털로 body에 직접 렌더 — 조상 transform/overflow에 영향받지 않게
  return createPortal(
    <div className="fixed inset-0 z-40">
      <div className="dim absolute inset-0 bg-ink/45" onClick={onClose} />
      <div className="sheet absolute inset-x-0 bottom-0 mx-auto max-h-[85dvh] max-w-xl overflow-y-auto rounded-t-xl border-x border-t-2 border-ink/30 bg-bg px-5 pt-3 pb-8">
        {/* 절취선 핸들 */}
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-ink/20" />
        <div className="mb-4 flex items-center justify-between border-b border-dashed border-line pb-2.5">
          <h3 className="font-display text-[16px] tracking-wide">
            <span className="mr-2 inline-block size-2 rotate-45 bg-accent align-middle" />
            {title}
          </h3>
          <button onClick={onClose} className="text-sm text-sub transition-colors hover:text-accent">
            닫기 ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
