import type { DayKey } from '../types'

export const DAYS: { key: DayKey; label: string; date: string }[] = [
  { key: 'day1', label: '8/20 (목)', date: '2026-08-20' },
  { key: 'day2', label: '8/21 (금)', date: '2026-08-21' },
  { key: 'day3', label: '8/22 (토)', date: '2026-08-22' },
]

function localDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function todayKey(): DayKey | null {
  const today = localDateString(new Date())
  return DAYS.find(d => d.date === today)?.key ?? null
}

/** 출발일까지 남은 일수. 0=출발일, 음수=출발 후 */
export function dDay(): number {
  const now = new Date()
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const start = new Date(2026, 7, 20)
  return Math.round((start.getTime() - todayMid.getTime()) / 86400000)
}
