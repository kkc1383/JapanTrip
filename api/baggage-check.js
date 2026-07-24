import Anthropic from '@anthropic-ai/sdk'

const VERDICTS = ['기내, 수하 가능', '기내만 가능', '수하만 가능', '불가능']

const SYSTEM = `너는 한국(인천)→일본(도쿄) 국제선 항공편(제주항공)의 수하물 규정 판정기다.
사용자가 준 물품 하나에 대해 verdict를 정확히 하나 고른다.

verdict 정의:
- "기내, 수하 가능": 기내 반입과 위탁 수하물 둘 다 가능
- "기내만 가능": 위탁 금지, 기내 반입만 가능
- "수하만 가능": 기내 반입 금지, 위탁 수하물만 가능
- "불가능": 둘 다 금지이거나 일본 입국 자체가 금지

핵심 규칙 (반드시 적용):
1. 리튬배터리 내장·단독 물품(보조배터리, 전자담배, 무선 고데기 배터리) → 위탁 금지 → "기내만 가능"
2. 날붙이(칼, 큰 가위, 커터)와 100ml 초과 액체(와인·술병, 대용량 화장품, 잼) → 기내 금지 → "수하만 가능"
3. 일본 동식물 검역: 육류·육가공품(육포, 햄, 소시지, 만두), 생과일·생채소 → "불가능"
4. 인화성·폭발성 물질(부탄가스, 폭죽, 페인트) → "불가능"
5. 그 외 일반 물품(옷, 충전기, 우산, 책, 과자 등) → "기내, 수하 가능"
6. 100ml 이하 액체는 기내 가능 → 용량 불명확한 액체류는 보수적으로 "수하만 가능"`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }
  const item = String((req.body && req.body.item) || '')
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
      max_tokens: 2048,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'high',
        format: {
          type: 'json_schema',
          schema: {
            type: 'object',
            properties: { verdict: { type: 'string', enum: VERDICTS } },
            required: ['verdict'],
            additionalProperties: false,
          },
        },
      },
      system: SYSTEM,
      messages: [
        { role: 'user', content: '보조배터리' },
        { role: 'assistant', content: '{"verdict":"기내만 가능"}' },
        { role: 'user', content: '와인 한 병' },
        { role: 'assistant', content: '{"verdict":"수하만 가능"}' },
        { role: 'user', content: item },
      ],
    })

    if (response.stop_reason === 'refusal') {
      res.status(502).json({ error: 'ai_refused' })
      return
    }
    const block = response.content.find(b => b.type === 'text')
    const verdict = block ? JSON.parse(block.text).verdict : null
    if (!verdict || !VERDICTS.includes(verdict)) {
      res.status(502).json({ error: 'bad_verdict' })
      return
    }
    res.status(200).json({ verdict })
  } catch {
    res.status(502).json({ error: 'ai_failed' })
  }
}
