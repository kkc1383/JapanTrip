export default function Fab({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="fab">
      <span className="text-lg leading-none">＋</span>
      {label}
    </button>
  )
}
