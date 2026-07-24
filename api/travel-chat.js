import Anthropic from '@anthropic-ai/sdk'

// Vercel Node 함수에서 res.write 청크가 버퍼링 없이 스트리밍되도록
export const config = { supportsResponseStreaming: true }

const RTDB = 'https://japantravel-d81cd-default-rtdb.asia-southeast1.firebasedatabase.app'

const SYSTEM_BASE = `너는 "일본여행 도우미" — 경찬·예빈 두 사람의 도쿄 여행 웹앱에 내장된 챗봇이다.

이번 여행 기본 정보:
- 기간: 2026년 8월 20일(목) ~ 8월 22일(토), 2박 3일
- 여행지: 도쿄 / 여행자: 경찬, 예빈 (2명)
- 항공: 제주항공 — 가는 편 7C1101 (인천 08:10 출발), 오는 편 7C1110 (나리타 19:50 출발)
- 숙소: A.P.B Ryogoku (도쿄 스미다구 료고쿠, 3-chōme-8-6 Chitose) — 체크인 16:00 이후, 체크아웃 10:00, 짐 보관은 정오부터 가능
- 수하물: 기내 10kg(세 변 합 115cm), 위탁 15kg

역할과 범위:
- 일본 여행(도쿄 관광지·맛집·카페·교통·환전·날씨·쇼핑·일본어 표현·매너·입국 절차 등)과 이번 여행 일정에 관한 질문에 답한다.
- 여행과 무관한 질문(코딩, 정치, 다른 주제)은 정중히 짧게 사양하고 여행 관련 질문을 유도한다.
- 아래에 현재 저장된 실제 일정/메모가 있으면 그것을 근거로 답한다. 없는 내용은 지어내지 말고 모른다고 한다.

답변 스타일:
- 한국어, 친근하고 간결하게. 핵심 먼저.
- 마크다운 헤딩(#)이나 표는 쓰지 말 것. 필요하면 "·" 불릿과 줄바꿈만 사용.
- 시간·가격 등 변동 가능한 정보는 "달라질 수 있으니 현지에서 확인" 한 줄을 덧붙인다.`

/** RTDB에서 실제 일정·메모를 읽어 시스템 프롬프트에 붙일 컨텍스트 생성 (실패해도 무시) */
async function tripContext() {
  try {
    const signal = AbortSignal.timeout(3000)
    const [itiRes, infoRes] = await Promise.all([
      fetch(`${RTDB}/itinerary.json`, { signal }),
      fetch(`${RTDB}/info.json`, { signal }),
    ])
    const iti = (await itiRes.json()) ?? {}
    const info = (await infoRes.json()) ?? {}

    const dayLabel = { day1: '1일차(8/20 목)', day2: '2일차(8/21 금)', day3: '3일차(8/22 토)' }
    const lines = []
    for (const key of ['day1', 'day2', 'day3']) {
      const items = Object.values(iti[key] ?? {}).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      const row = items
        .map(it => `${it.time || '시간미정'} ${it.title}${it.place ? `(${it.place})` : ''}`)
        .join(', ')
      lines.push(`- ${dayLabel[key]}: ${row || '아직 일정 없음'}`)
    }
    const notes = Object.values(info)
      .map(c => `- ${c.title}: ${String(c.content ?? '').replace(/\s+/g, ' ').slice(0, 200)}`)
      .join('\n')

    return `\n\n[현재 저장된 일정]\n${lines.join('\n')}${notes ? `\n\n[여행 메모]\n${notes}` : ''}`
  } catch {
    return ''
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  const raw = Array.isArray(req.body && req.body.messages) ? req.body.messages : null
  if (!raw || !raw.length) {
    res.status(400).json({ error: 'messages_required' })
    return
  }
  // 최근 20개만, 역할·내용 검증
  const messages = raw.slice(-20).flatMap(m => {
    const role = m && (m.role === 'user' || m.role === 'assistant') ? m.role : null
    const content = String((m && m.content) || '').trim().slice(0, 4000)
    return role && content ? [{ role, content }] : []
  })
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    res.status(400).json({ error: 'bad_messages' })
    return
  }

  try {
    const client = new Anthropic() // ANTHROPIC_API_KEY는 Vercel 환경변수에서
    const system = SYSTEM_BASE + (await tripContext())

    res.status(200)
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')

    const stream = client.messages.stream({
      model: 'claude-sonnet-5',
      max_tokens: 3000,
      thinking: { type: 'adaptive' },
      system,
      messages,
    })
    stream.on('text', t => res.write(t))
    const final = await stream.finalMessage()
    if (final.stop_reason === 'refusal') {
      res.write('죄송해요, 그 질문에는 답하기 어려워요. 여행 관련 질문을 해주세요!')
    }
    res.end()
  } catch {
    // 스트리밍 시작 전 실패면 JSON, 도중 실패면 그대로 종료
    if (!res.headersSent) res.status(502).json({ error: 'ai_failed' })
    else res.end()
  }
}
