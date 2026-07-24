import Anthropic from '@anthropic-ai/sdk'

const VERDICTS = ['기내, 수하 가능', '기내만 가능', '수하만 가능', '불가능'] as const

const SYSTEM =
  '너는 한국(인천)→일본(도쿄) 국제선 항공편(제주항공)의 수하물 규정 판정기다. ' +
  '사용자가 준 물품이 기내 반입과 위탁 수하물로 각각 가능한지 판정한다. ' +
  '일본 입국 검역 금지품(육류·육가공품, 생과일·생채소 등)은 "불가능"으로 판정한다. ' +
  '판정 기준: "기내, 수하 가능"(둘 다 가능) | "기내만 가능"(위탁 금지, 기내는 가능 — 예: 보조배터리, 전자담배) | ' +
  '"수하만 가능"(기내 금지, 위탁은 가능 — 예: 칼, 100ml 초과 액체) | "불가능"(둘 다 금지 또는 일본 반입 금지). ' +
  '반드시 verdict 필드 하나만 반환한다.'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }
  const item = String(req.body?.item ?? '')
    .trim()
    .slice(0, 60)
  if (!item) {
    res.status(400).json({ error: 'item_required' })
    return
  }

  try {
    const client = new Anthropic() // ANTHROPIC_API_KEY는 Vercel 환경변수에서
    const response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 256,
      output_config: {
        effort: 'low',
        format: {
          type: 'json_schema',
          schema: {
            type: 'object',
            properties: { verdict: { type: 'string', enum: [...VERDICTS] } },
            required: ['verdict'],
            additionalProperties: false,
          },
        },
      },
      system: SYSTEM,
      messages: [{ role: 'user', content: item }],
    })

    if (response.stop_reason === 'refusal') {
      res.status(502).json({ error: 'ai_refused' })
      return
    }
    const block = response.content.find(b => b.type === 'text')
    const verdict = block && 'text' in block ? (JSON.parse(block.text).verdict as string) : null
    if (!verdict || !(VERDICTS as readonly string[]).includes(verdict)) {
      res.status(502).json({ error: 'bad_verdict' })
      return
    }
    res.status(200).json({ verdict })
  } catch {
    res.status(502).json({ error: 'ai_failed' })
  }
}
