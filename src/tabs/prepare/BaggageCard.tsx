import { ref, update } from 'firebase/database'
import { useState } from 'react'
import { db } from '../../lib/firebase'
import { useRtdbValue } from '../../hooks/useRtdb'
import { searchBaggage, VERDICT_LABEL, type BagRule, type BagVerdict } from '../../lib/baggageRules'
import PrepCard, { type ByState } from './PrepCard'

const VERDICT_STYLE: Record<BagVerdict, string> = {
  'cabin-ok': 'bg-indigo/10 text-indigo border-indigo/40',
  'cabin-only': 'bg-indigo/10 text-indigo border-indigo/40',
  'checked-only': 'bg-gold/10 text-gold border-gold/40',
  limited: 'bg-gold/10 text-gold border-gold/40',
  forbidden: 'bg-accent-soft text-accent border-accent/40',
}

type AiState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; verdict: string }
  | { status: 'error' }

const AI_VERDICT_STYLE: Record<string, string> = {
  '기내, 수하 가능': 'bg-indigo/10 text-indigo border-indigo/40',
  '기내만 가능': 'bg-indigo/10 text-indigo border-indigo/40',
  '수하만 가능': 'bg-gold/10 text-gold border-gold/40',
  불가능: 'bg-accent-soft text-accent border-accent/40',
}

export default function BaggageCard() {
  const data = useRtdbValue<{ checked?: boolean; by?: ByState }>('prep/baggage')
  const by: ByState = data?.by ?? (data?.checked ? { kc: true, yb: true } : {})
  const [q, setQ] = useState('')
  const [results, setResults] = useState<BagRule[] | null>(null)
  const [ai, setAi] = useState<AiState>({ status: 'idle' })

  function doSearch(text: string) {
    setQ(text)
    setResults(text.trim() ? searchBaggage(text) : null)
    setAi({ status: 'idle' })
  }

  async function askAi() {
    const item = q.trim()
    if (!item || ai.status === 'loading') return
    setAi({ status: 'loading' })
    try {
      const r = await fetch('/api/baggage-check', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ item }),
      })
      const d = (await r.json()) as { verdict?: string }
      if (!r.ok || !d.verdict) throw new Error('bad response')
      setAi({ status: 'done', verdict: d.verdict })
    } catch {
      setAi({ status: 'error' })
    }
  }

  return (
    <PrepCard
      title="수하물 제한 확인"
      sub="Baggage"
      by={by}
      onCheckPerson={(p, v) => update(ref(db, 'prep/baggage/by'), { ...by, [p]: v })}
    >
      <ul className="space-y-0.5 text-[12.5px] leading-relaxed text-ink/80">
        <li>· <b>제주항공 기내: 10kg</b> — 세 변 합 115cm 이내 (예: 55×40×20cm)</li>
        <li>· <b>제주항공 위탁: 15kg</b> — 초과 시 kg당 추가 요금</li>
        <li>· 기내 액체류: 개당 100ml 이하, 1L 지퍼백 1개</li>
        <li>· 보조배터리·전자담배: <b className="text-accent">위탁 금지, 기내만</b></li>
        <li>· 칼·가위 등 날붙이: 위탁수하물로</li>
        <li>· 일본 검역: <b className="text-accent">육류(육포·햄)·생과일 반입 금지</b></li>
      </ul>

      {/* 반입 가능 여부 검색 */}
      <div className="mt-3 rounded-sm border border-dashed border-ink/25 bg-bg/60 p-2.5">
        <p className="font-display mb-1.5 text-[12px] tracking-wide">이거 들고 탈 수 있나요? 🔍</p>
        <input
          value={q}
          onChange={e => doSearch(e.target.value)}
          placeholder="예: 보조배터리, 육포, 고데기..."
          className="field !py-2 text-[13px]"
        />
        {results !== null && (
          <div className="mt-2 space-y-1.5">
            {results.length === 0 && (
              <p className="text-[11.5px] leading-relaxed text-sub">
                목록에 없는 품목이에요 — 아래 AI 판정을 써보거나{' '}
                <a
                  href="https://www.avsec365.or.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo underline underline-offset-2"
                >
                  항공보안365에서 검색 ↗
                </a>
              </p>
            )}
            {results.map(r => (
              <div key={r.name} className="flex items-start gap-2 text-[12px]">
                <span className={`mt-0.5 shrink-0 rounded-sm border px-1.5 py-0.5 text-[10px] font-bold ${VERDICT_STYLE[r.verdict]}`}>
                  {VERDICT_LABEL[r.verdict]}
                </span>
                <span>
                  <b>{r.name}</b> — <span className="text-ink/75">{r.note}</span>
                </span>
              </div>
            ))}
          </div>
        )}
        {/* AI 판정 */}
        {q.trim() && (
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={askAi}
              disabled={ai.status === 'loading'}
              className="btn-soft px-2.5 py-1 text-[11.5px] disabled:opacity-50"
            >
              {ai.status === 'loading' ? '🤖 판정 중...' : '🤖 AI 판정'}
            </button>
            {ai.status === 'done' && (
              <span className={`rounded-sm border px-2 py-0.5 text-[11px] font-bold ${AI_VERDICT_STYLE[ai.verdict] ?? ''}`}>
                {ai.verdict}
              </span>
            )}
            {ai.status === 'error' && (
              <span className="text-[11px] text-sub">판정 실패 — 잠시 후 다시 시도</span>
            )}
          </div>
        )}
      </div>
    </PrepCard>
  )
}
