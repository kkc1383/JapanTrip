import { push, ref, remove, update } from 'firebase/database'
import { useState, type FormEvent } from 'react'
import ActionMenu from '../../components/ActionMenu'
import BottomSheet from '../../components/BottomSheet'
import { db } from '../../lib/firebase'
import { sortByOrder } from '../../lib/sort'
import { useRtdbValue } from '../../hooks/useRtdb'
import type { InfoCard } from '../../types'

function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g)
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="text-indigo underline decoration-indigo/40 underline-offset-2">
            {p}
          </a>
        ) : (
          p
        ),
      )}
    </>
  )
}

export default function InfoCards() {
  const data = useRtdbValue<Record<string, InfoCard>>('info')
  const cards = sortByOrder(data)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  function closeSheet() {
    setSheetOpen(false)
    setEditingId(null)
    setTitle('')
    setContent('')
  }

  function openAdd() {
    setEditingId(null)
    setTitle('')
    setContent('')
    setSheetOpen(true)
  }

  function openEdit(id: string, c: InfoCard) {
    setEditingId(id)
    setTitle(c.title)
    setContent(c.content)
    setSheetOpen(true)
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    const card = { title: title.trim(), content: content.trim() }
    if (!card.title || !card.content) return
    if (editingId) {
      update(ref(db, `info/${editingId}`), card)
    } else {
      const maxOrder = cards.reduce((m, [, c]) => Math.max(m, c.order ?? 0), -1)
      push(ref(db, 'info'), { ...card, order: maxOrder + 1 })
    }
    closeSheet()
  }

  return (
    <div className="space-y-3.5">
      {cards.map(([id, c]) => (
        <section key={id} className="card overflow-hidden px-4 py-3.5">
          <span className="absolute top-0 left-0 h-full w-1 bg-gold/60" />
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-[15px] tracking-wide">{c.title}</h3>
            <ActionMenu
              actions={[
                { label: '수정', onClick: () => openEdit(id, c) },
                {
                  label: '삭제',
                  danger: true,
                  onClick: () => {
                    remove(ref(db, `info/${id}`))
                    if (editingId === id) closeSheet()
                  },
                },
              ]}
            />
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed break-all whitespace-pre-wrap text-ink/85">
            <Linkified text={c.content} />
          </p>
        </section>
      ))}

      <button type="button" onClick={openAdd} className="empty-box w-full transition-colors hover:border-accent hover:text-accent">
        ＋ 정보 카드 추가
      </button>

      <BottomSheet open={sheetOpen} title={editingId ? '정보 카드 수정' : '정보 카드 추가'} onClose={closeSheet}>
        <form onSubmit={submit} className="grid gap-2.5">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="카드 제목 (필수)"
            required
            className="field"
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="내용 (URL은 자동으로 링크가 됩니다)"
            rows={5}
            required
            className="field"
          />
          <button type="submit" className="btn-primary">
            {editingId ? '카드 수정' : '정보 카드 추가'}
          </button>
        </form>
      </BottomSheet>
    </div>
  )
}
