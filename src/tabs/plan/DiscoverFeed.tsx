import { push, ref } from 'firebase/database'
import { useState } from 'react'
import { db } from '../../lib/firebase'
import { sortByOrder } from '../../lib/sort'
import { useRtdbValue } from '../../hooks/useRtdb'

type Post = {
  title: string
  image: string
  url: string
  source: string
  tag?: string
  order: number
}

/** 샤오홍슈 스타일 2열 폭포수 피드 — 실제 도쿄 여행 포스트 큐레이션 */
export default function DiscoverFeed() {
  const data = useRtdbValue<Record<string, Post>>('discover')
  const posts = sortByOrder(data)
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  if (!posts.length) return null

  function save(id: string, p: Post) {
    if (saved[id]) return
    push(ref(db, 'wishlist'), {
      title: p.title,
      place: '',
      memo: `📌 저장한 포스트 — ${p.source}\n${p.url}`,
      lat: null,
      lng: null,
      order: Date.now(),
    })
    setSaved(s => ({ ...s, [id]: true }))
  }

  return (
    <div className="columns-2 gap-2.5">
      {posts.map(([id, p]) => (
        <div key={id} className="card mb-2.5 overflow-hidden break-inside-avoid !p-0">
          <a href={p.url} target="_blank" rel="noopener noreferrer" className="block">
            <img
              src={p.image}
              alt={p.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full bg-line/40"
              onError={e => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <div className="px-2.5 pt-2">
              {p.tag && (
                <span className="mr-1 inline-block rounded-sm bg-accent-soft px-1 py-px text-[9.5px] font-bold text-accent">
                  {p.tag}
                </span>
              )}
              <span className="text-[12px] leading-snug font-medium break-keep text-ink/90">{p.title}</span>
            </div>
          </a>
          <div className="flex items-center justify-between px-2.5 py-1.5">
            <span className="text-[10px] text-sub">{p.source}</span>
            <button
              type="button"
              onClick={() => save(id, p)}
              disabled={!!saved[id]}
              className={`text-[11px] font-semibold ${saved[id] ? 'text-sub' : 'text-accent'}`}
            >
              {saved[id] ? '✓ 담음' : '＋ 후보에 담기'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
