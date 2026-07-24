export type BagVerdict = 'cabin-ok' | 'checked-only' | 'cabin-only' | 'limited' | 'forbidden'

export type BagRule = {
  keywords: string[]
  name: string
  verdict: BagVerdict
  note: string
}

export const VERDICT_LABEL: Record<BagVerdict, string> = {
  'cabin-ok': '기내 OK',
  'checked-only': '위탁만',
  'cabin-only': '기내만',
  limited: '조건부',
  forbidden: '반입 금지',
}

export const BAG_RULES: BagRule[] = [
  { keywords: ['보조배터리', '배터리', '파워뱅크', '보조 배터리'], name: '보조배터리', verdict: 'cabin-only', note: '위탁수하물 금지 — 반드시 기내로. 100Wh(약 27,000mAh) 이하만 가능' },
  { keywords: ['라이터'], name: '라이터', verdict: 'limited', note: '1인 1개, 몸에 소지한 채 기내 탑승 (위탁·기내 가방 안 넣기 금지)' },
  { keywords: ['성냥'], name: '성냥', verdict: 'limited', note: '안전성냥 1개만 몸에 소지 가능' },
  { keywords: ['가위'], name: '가위', verdict: 'limited', note: '날 6cm 이하 소형(눈썹가위 등)은 기내 가능, 그 외에는 위탁' },
  { keywords: ['칼', '맥가이버', '커터', '과도'], name: '칼류', verdict: 'checked-only', note: '모든 칼은 위탁수하물로만' },
  { keywords: ['손톱깎이', '손톱깍기'], name: '손톱깎이', verdict: 'cabin-ok', note: '기내 반입 가능' },
  { keywords: ['면도기'], name: '면도기', verdict: 'limited', note: '일회용·전기면도기는 기내 OK, 날 교체형(양날)은 위탁' },
  { keywords: ['물', '생수', '음료', '음료수', '커피'], name: '음료류', verdict: 'limited', note: '보안검색 전 100ml 초과 액체 불가. 면세구역 구매분은 기내 OK' },
  { keywords: ['화장품', '스킨', '로션', '토너', '에센스', '크림'], name: '화장품(액체)', verdict: 'limited', note: '개당 100ml 이하, 1L 투명 지퍼백 1개에 담아 기내 반입' },
  { keywords: ['향수'], name: '향수', verdict: 'limited', note: '100ml 이하 지퍼백 규정 적용' },
  { keywords: ['선크림', '썬크림'], name: '선크림', verdict: 'limited', note: '액체류 취급 — 100ml 이하만 기내' },
  { keywords: ['치약'], name: '치약', verdict: 'limited', note: '액체류 취급 — 100ml 이하만 기내' },
  { keywords: ['손소독제', '소독제'], name: '손소독제', verdict: 'limited', note: '100ml 이하 기내 가능' },
  { keywords: ['스프레이', '헤어스프레이', '미스트'], name: '스프레이', verdict: 'limited', note: '인화성 표시 없으면 100ml 이하 기내, 대용량은 위탁' },
  { keywords: ['고데기', '고대기', '봉고데기'], name: '고데기', verdict: 'limited', note: '유선 고데기 OK. 무선(배터리형)은 배터리 분리 후 기내만' },
  { keywords: ['전자담배', '액상'], name: '전자담배', verdict: 'cabin-only', note: '위탁 금지 — 기내 소지만 가능 (기내 사용은 불가)' },
  { keywords: ['담배'], name: '담배', verdict: 'cabin-ok', note: '기내 반입 가능. 일본 면세 한도 지정수량 확인' },
  { keywords: ['노트북', '태블릿', '아이패드', '패드'], name: '노트북/태블릿', verdict: 'cabin-ok', note: '기내 권장 (리튬배터리 내장 기기는 위탁 비권장)' },
  { keywords: ['카메라'], name: '카메라', verdict: 'cabin-ok', note: '기내 반입 가능' },
  { keywords: ['드론'], name: '드론', verdict: 'limited', note: '배터리는 기내로. 일본 내 비행은 규제 심함 — 사전 확인' },
  { keywords: ['삼각대', '셀카봉'], name: '삼각대/셀카봉', verdict: 'limited', note: '접었을 때 30cm 이하만 기내, 초과 시 위탁' },
  { keywords: ['우산'], name: '우산', verdict: 'cabin-ok', note: '접이식 우산 기내 가능 (끝이 뾰족한 장우산은 위탁 권장)' },
  { keywords: ['멀티탭', '멀티 탭'], name: '멀티탭', verdict: 'cabin-ok', note: '기내·위탁 모두 가능' },
  { keywords: ['돼지코', '어댑터', '변환플러그', '변환 플러그'], name: '변환 어댑터(돼지코)', verdict: 'cabin-ok', note: '기내·위탁 모두 가능. 일본은 110V A타입' },
  { keywords: ['충전기', '케이블'], name: '충전기/케이블', verdict: 'cabin-ok', note: '기내·위탁 모두 가능' },
  { keywords: ['즉석밥', '햇반'], name: '즉석밥', verdict: 'cabin-ok', note: '반입 가능 (쌀 가공식품 OK)' },
  { keywords: ['라면', '컵라면'], name: '라면', verdict: 'limited', note: '반입 가능하나 고기 스프 포함 제품은 일본 검역상 원칙적 금지' },
  { keywords: ['김'], name: '김/건조 해조류', verdict: 'cabin-ok', note: '반입 가능' },
  { keywords: ['고추장', '된장', '쌈장', '장류'], name: '장류', verdict: 'limited', note: '액체류 취급 — 기내는 100ml 제한, 위탁은 OK' },
  { keywords: ['김치'], name: '김치', verdict: 'limited', note: '액체류 취급 — 위탁으로. 밀봉 필수' },
  { keywords: ['과일', '사과', '귤', '포도'], name: '생과일', verdict: 'forbidden', note: '일본 식물검역 — 생과일·채소 반입 금지' },
  { keywords: ['육포', '소시지', '햄', '육류', '고기', '삼겹살', '만두'], name: '육류·육가공품', verdict: 'forbidden', note: '일본 동물검역 — 육류·육가공품 반입 금지 (적발 시 벌금)' },
  { keywords: ['계란', '달걀'], name: '계란 제품', verdict: 'limited', note: '가공 정도에 따라 다름 — 반입 비권장' },
  { keywords: ['술', '소주', '와인', '위스키', '맥주', '주류'], name: '주류', verdict: 'limited', note: '기내는 면세구역 구매만. 위탁: 24~70도는 1인 5L 제한. 일본 면세 3병(760ml)' },
  { keywords: ['약', '상비약', '진통제', '소화제', '처방약'], name: '의약품', verdict: 'cabin-ok', note: '개인 사용량 기내 OK. 처방약은 처방전 지참 권장' },
  { keywords: ['눈썹칼'], name: '눈썹칼', verdict: 'checked-only', note: '날붙이 취급 — 위탁 권장' },
  { keywords: ['헤어왁스', '왁스', '젤'], name: '헤어왁스/젤', verdict: 'limited', note: '겔류도 액체 취급 — 100ml 이하만 기내' },
  { keywords: ['보온병', '텀블러'], name: '텀블러/보온병', verdict: 'cabin-ok', note: '빈 상태로 기내 OK (내용물은 액체 규정 적용)' },
]

function norm(s: string): string {
  return s.replace(/\s+/g, '').toLowerCase()
}

export function searchBaggage(q: string): BagRule[] {
  const n = norm(q)
  if (!n) return []
  return BAG_RULES.filter(r =>
    r.keywords.some(k => {
      const nk = norm(k)
      return n.includes(nk) || nk.includes(n)
    }),
  ).slice(0, 5)
}
