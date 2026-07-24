import { useConnected } from '../hooks/useRtdb'

export default function OfflineBanner() {
  const connected = useConnected()
  if (connected) return null
  return (
    <div className="font-display sticky top-0 z-30 bg-ink py-2 text-center text-sm tracking-widest text-[#fff6e9]">
      오프라인 — 변경사항이 저장되지 않습니다
    </div>
  )
}
