import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'

type Msg = { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  '공항에서 숙소까지 어떻게 가?',
  '료고쿠 숙소 근처 맛집 알려줘',
  '2일차 코스 추천해줘',
  '8월 도쿄, 뭐 입고 가지?',
]

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 모바일(전체 화면)일 때만 뒤 화면 스크롤 잠금
  useEffect(() => {
    if (!open || !window.matchMedia('(max-width: 639px)').matches) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // 새 내용이 생기면 맨 아래로
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, open])

  async function send(text: string) {
    const q = text.trim()
    if (!q || streaming) return
    setInput('')
    setStreaming(true)
    const history: Msg[] = [...messages, { role: 'user', content: q }]
    // 유저 메시지 + 빈 어시스턴트 자리 추가
    setMessages([...history, { role: 'assistant', content: '' }])

    function patchLast(updater: (prev: string) => string) {
      setMessages(ms => {
        const next = [...ms]
        const last = next[next.length - 1]
        next[next.length - 1] = { ...last, content: updater(last.content) }
        return next
      })
    }

    try {
      const res = await fetch('/api/travel-chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-20) }),
      })
      if (!res.ok || !res.body) throw new Error('bad response')
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let got = false
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = dec.decode(value, { stream: true })
        if (chunk) {
          got = true
          patchLast(prev => prev + chunk)
        }
      }
      if (!got) throw new Error('empty')
    } catch {
      patchLast(prev => prev || '답변을 불러오지 못했어요 — 네트워크 확인 후 다시 시도해 주세요.')
    } finally {
      setStreaming(false)
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    send(input)
  }

  return createPortal(
    <>
      {/* 플로팅 버튼 — 하단 탭바 위 */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="여행 도우미 챗봇 열기"
          className="fixed right-4 bottom-[calc(84px+env(safe-area-inset-bottom))] z-30 flex size-[52px] items-center justify-center rounded-full border-2 border-accent bg-accent text-[22px] shadow-[3px_3px_0_rgba(38,48,60,0.25)] transition-transform active:scale-95"
        >
          <span className="font-display -rotate-6 text-[15px] leading-none text-[#fff6e9]">相談</span>
        </button>
      )}

      {/* 채팅 패널: 모바일 전체 화면 / sm 이상 우하단 플로팅 */}
      {open && (
        <div className="fixed inset-0 z-40 flex flex-col bg-bg sm:inset-auto sm:right-5 sm:bottom-5 sm:h-[min(640px,85dvh)] sm:w-[400px] sm:overflow-hidden sm:rounded-lg sm:border-2 sm:border-ink/40 sm:shadow-[6px_6px_0_rgba(38,48,60,0.2)]">
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b-2 border-ink/30 bg-card px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-[#fff6e9]">旅</span>
              <div>
                <p className="font-display text-[14px] leading-tight tracking-wide">여행 도우미</p>
                <p className="text-[9.5px] tracking-[0.2em] text-sub uppercase">Claude · Japan Trip</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-2 py-1 text-sm text-sub transition-colors hover:text-accent"
            >
              닫기 ✕
            </button>
          </div>

          {/* 메시지 영역 */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {!messages.length && (
              <div className="pt-2">
                <div className="card px-3.5 py-3 text-[13px] leading-relaxed">
                  안녕하세요! 도쿄 여행 도우미예요 🗾
                  <br />
                  일정·맛집·교통·날씨·일본어 표현 등 이번 여행에 관한 건 뭐든 물어보세요.
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-full border border-line bg-card px-3 py-1.5 text-[12px] text-ink/80 transition-colors hover:border-accent hover:text-accent"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => {
              const isLast = i === messages.length - 1
              return m.role === 'user' ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] rounded-lg rounded-br-sm bg-accent px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap text-[#fff6e9]">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex justify-start">
                  <div className="card max-w-[88%] px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap">
                    {m.content}
                    {streaming && isLast && <span className="ml-0.5 inline-block w-2 animate-pulse bg-accent/70">&#8203;</span>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* 입력 영역 */}
          <form
            onSubmit={submit}
            className="flex gap-2 border-t-2 border-ink/30 bg-card px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:pb-2.5"
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="일본 여행, 뭐든 물어보세요"
              className="field flex-1 !py-2.5 text-[14px]"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="btn-primary shrink-0 !px-4 !py-0 text-[14px] disabled:opacity-40"
            >
              {streaming ? '···' : '전송'}
            </button>
          </form>
        </div>
      )}
    </>,
    document.body,
  )
}
