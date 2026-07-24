export default function SectionTitle({ ko, sub }: { ko: string; sub: string }) {
  return (
    <div className="mb-3 flex items-baseline gap-2.5">
      <span className="inline-block size-2.5 shrink-0 translate-y-[-1px] rotate-45 bg-accent" />
      <h2 className="font-display text-lg tracking-wide">{ko}</h2>
      <span className="text-[10px] font-semibold tracking-[0.3em] text-gold uppercase">{sub}</span>
      <span className="ml-1 h-px flex-1 bg-line" />
    </div>
  )
}
