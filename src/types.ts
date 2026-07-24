export type DayKey = 'day1' | 'day2' | 'day3'

export type ItineraryItem = {
  time?: string
  title: string
  place?: string
  memo?: string
  order: number
  lat?: number
  lng?: number
}

export type ChecklistItem = {
  text: string
  /** 사람별 체크 도입 이전 데이터 호환용 */
  checked: boolean
  order: number
  /** 사람별 체크 상태 (경찬 kc / 예빈 yb) */
  by?: { kc?: boolean; yb?: boolean }
}
export type ChecklistCategory = {
  name: string
  order: number
  items?: Record<string, ChecklistItem>
}

export type InfoCard = { title: string; content: string; order: number }

/** wallet/log는 카드 통합 이전 데이터 호환용 */
export type PrepMoney = { card?: number; cash?: number; wallet?: number; log?: number }

export type PassportEntry = { name: string; expiry: string; checked: boolean }

export type WishlistItem = {
  title: string
  place?: string
  memo?: string
  lat?: number
  lng?: number
  order: number
}
