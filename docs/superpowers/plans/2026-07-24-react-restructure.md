# JapanTrip React 개편 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 바닐라 JS 여행 사이트를 Vite+React+TS+Tailwind 기반의 여행 준비/여행 계획/여행 중 3탭 웹앱으로 재구축한다.

**Architecture:** Vite SPA. 탭은 클라이언트 상태로 전환(라우터 없음). Firebase Realtime Database를 `onValue` 구독 훅으로 읽고 `push/update/remove`로 쓴다. 지도는 Leaflet(react-leaflet), 지오코딩은 Nominatim, 환율은 open.er-api.com.

**Tech Stack:** Vite, React 19, TypeScript(strict), Tailwind CSS v4(@tailwindcss/vite), firebase(npm), leaflet + react-leaflet, Vercel 배포.

## Global Constraints

- 스펙: `docs/superpowers/specs/2026-07-24-react-restructure-design.md`
- 테스트 프레임워크 없음 — 각 태스크는 `npm run build`(tsc --noEmit 포함) 통과 + `npm run dev` 브라우저 수동 검증
- 모든 UI 텍스트 한국어, 모바일 우선 (max-w-xl 컨테이너, 하단 탭바)
- 날짜 키: `day1`=2026-08-20(목), `day2`=8/21(금), `day3`=8/22(토)
- 기존 DB 데이터 호환 유지: `/checklist`, `/info`, `/itinerary` 스키마 그대로 (+ itinerary에 `lat`/`lng` 선택 필드), `/wishlist` 신규. 시드 로직은 이식하지 않음(데이터 이미 존재)
- 커밋 메시지: `[기능/수정] 한줄 요약` + `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` 태그
- **push는 마지막 태스크(Task 9)에서 한 번만** — Vercel이 push마다 자동 배포하므로 중간 상태를 배포하지 않기 위함. 그 전 태스크는 로컬 커밋만 한다.
- 작업 디렉토리: `C:\Users\kangkc09\Desktop\JapanTrip` (Windows, PowerShell 기준 명령)

---

### Task 1: Vite + React + TS + Tailwind 스캐폴드, 구 파일 정리, CI/Vercel 설정

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vercel.json`, `.gitignore`, `index.html`(교체), `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/vite-env.d.ts`
- Modify: `.github/workflows/deploy.yml`
- Delete: `css/style.css`, `js/app.js`, `js/firebase.js`, `js/firebase-config.js`, `js/itinerary.js`, `js/checklist.js`, `js/info.js`

**Interfaces:**
- Produces: `npm run dev` / `npm run build` 동작하는 React 앱 골격. `src/index.css`에 색 토큰(`bg-bg`, `bg-card`, `text-ink`, `text-sub`, `text-accent`, `bg-accent`, `bg-accent-soft`, `border-line` 클래스로 사용 가능). 이후 모든 태스크가 이 클래스를 쓴다.

- [ ] **Step 1: 구 파일 삭제**

```powershell
Remove-Item -Recurse -Force css, js
Remove-Item -Force index.html
```

(firebase config 값은 이 계획서 Task 2에 이미 옮겨져 있으므로 삭제해도 된다.)

- [ ] **Step 2: package.json 작성**

```json
{
  "name": "japantrip",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 3: 의존성 설치**

Run: `npm install react react-dom firebase leaflet react-leaflet`
Run: `npm install -D typescript vite @vitejs/plugin-react @types/react @types/react-dom @types/leaflet tailwindcss @tailwindcss/vite`
Expected: 에러 없이 설치, `package-lock.json` 생성

- [ ] **Step 4: 설정 파일 작성**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

`vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

`vercel.json`:
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

`.gitignore`:
```
node_modules/
dist/
.vercel
.omc/
```

- [ ] **Step 5: 엔트리 파일 작성**

`index.html`:
```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#faf7f2" />
    <title>일본여행 2026.8.20–22</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/vite-env.d.ts`:
```ts
/// <reference types="vite/client" />
```

`src/index.css`:
```css
@import "tailwindcss";

@theme {
  --color-bg: #faf7f2;
  --color-card: #ffffff;
  --color-ink: #2b2b2b;
  --color-sub: #8a8578;
  --color-accent: #d64545;
  --color-accent-soft: #fdecec;
  --color-line: #e8e3da;
}

body {
  background: var(--color-bg);
  font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
}
```

`src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`src/App.tsx` (골격 — Task 2에서 교체):
```tsx
export default function App() {
  return (
    <div className="mx-auto min-h-dvh max-w-xl bg-bg pb-24 text-ink">
      <header className="px-5 pt-7 pb-1">
        <h1 className="text-2xl font-bold">일본여행 🇯🇵</h1>
        <p className="mt-1 text-sm text-sub">2026.8.20(목) – 8.22(토) · 2박 3일</p>
      </header>
    </div>
  )
}
```

- [ ] **Step 6: CI 워크플로우 교체**

`.github/workflows/deploy.yml` 전체를 다음으로 교체:
```yaml
name: CI

on:
  push:
    branches: [main]

jobs:
  ci:
    name: 타입체크 + 빌드
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
```

- [ ] **Step 7: 검증**

Run: `npm run build`
Expected: tsc 에러 없음, `dist/` 생성
Run: `npm run dev` (백그라운드) → 브라우저에서 `http://localhost:5173` 접속
확인: 크림색 배경에 "일본여행 🇯🇵" 헤더 표시 (Tailwind 토큰 동작 확인)

- [ ] **Step 8: Commit (push 금지)**

```powershell
git add -A
git commit -m @'
[기능] Vite+React+TS+Tailwind 스캐폴드 전환

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 2: Firebase 연결, 타입, 훅, 오프라인 배너, 하단 탭바

**Files:**
- Create: `src/lib/firebase.ts`, `src/types.ts`, `src/lib/sort.ts`, `src/lib/dates.ts`, `src/hooks/useRtdb.ts`, `src/components/OfflineBanner.tsx`, `src/components/TabBar.tsx`, `src/tabs/prepare/PrepareTab.tsx`, `src/tabs/plan/PlanTab.tsx`, `src/tabs/during/DuringTab.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: Task 1의 색 토큰 클래스
- Produces:
  - `db: Database` from `src/lib/firebase.ts`
  - `useRtdbValue<T>(path: string): T | null` from `src/hooks/useRtdb.ts`
  - `sortByOrder<T extends { order?: number }>(rec: Record<string, T> | null | undefined): [string, T][]` from `src/lib/sort.ts`
  - `DAYS: { key: DayKey; label: string; date: string }[]`, `todayKey(): DayKey | null`, `dDay(): number` from `src/lib/dates.ts`
  - `src/types.ts`의 타입들: `DayKey`, `ItineraryItem`, `ChecklistItem`, `ChecklistCategory`, `InfoCard`, `WishlistItem`
  - 각 탭 컴포넌트는 props 없는 default export — 이후 태스크가 내용 채움

- [ ] **Step 1: src/lib/firebase.ts 작성**

```ts
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyDivf13uOJ9fdsj7fIiyL6r-vY8pl1Ciqs',
  authDomain: 'japantravel-d81cd.firebaseapp.com',
  databaseURL: 'https://japantravel-d81cd-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'japantravel-d81cd',
  storageBucket: 'japantravel-d81cd.firebasestorage.app',
  messagingSenderId: '982403765877',
  appId: '1:982403765877:web:7f0087855ba8a0116d4a3c',
}

export const db = getDatabase(initializeApp(firebaseConfig))
```

- [ ] **Step 2: src/types.ts 작성**

```ts
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

export type ChecklistItem = { text: string; checked: boolean; order: number }
export type ChecklistCategory = {
  name: string
  order: number
  items?: Record<string, ChecklistItem>
}

export type InfoCard = { title: string; content: string; order: number }

export type WishlistItem = {
  title: string
  place?: string
  memo?: string
  lat?: number
  lng?: number
  order: number
}
```

- [ ] **Step 3: src/lib/sort.ts, src/lib/dates.ts 작성**

`src/lib/sort.ts`:
```ts
export function sortByOrder<T extends { order?: number }>(
  rec: Record<string, T> | null | undefined,
): [string, T][] {
  return Object.entries(rec ?? {}).sort(
    (a, b) => (a[1].order ?? 0) - (b[1].order ?? 0),
  )
}
```

`src/lib/dates.ts`:
```ts
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
```

- [ ] **Step 4: src/hooks/useRtdb.ts 작성**

```ts
import { useEffect, useState } from 'react'
import { onValue, ref } from 'firebase/database'
import { db } from '../lib/firebase'

export function useRtdbValue<T>(path: string): T | null {
  const [value, setValue] = useState<T | null>(null)
  useEffect(() => onValue(ref(db, path), snap => setValue(snap.val())), [path])
  return value
}

export function useConnected(): boolean {
  const [connected, setConnected] = useState(true)
  useEffect(
    () => onValue(ref(db, '.info/connected'), snap => setConnected(snap.val() === true)),
    [],
  )
  return connected
}
```

- [ ] **Step 5: 공용 컴포넌트 작성**

`src/components/OfflineBanner.tsx`:
```tsx
import { useConnected } from '../hooks/useRtdb'

export default function OfflineBanner() {
  const connected = useConnected()
  if (connected) return null
  return (
    <div className="sticky top-0 z-30 bg-accent py-2 text-center text-sm text-white">
      오프라인 — 변경사항이 저장되지 않습니다
    </div>
  )
}
```

`src/components/TabBar.tsx`:
```tsx
export type TabKey = 'prepare' | 'plan' | 'during'

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'prepare', label: '여행 준비', icon: '🧳' },
  { key: 'plan', label: '여행 계획', icon: '🗓️' },
  { key: 'during', label: '여행 중', icon: '🗾' },
]

export default function TabBar({
  tab,
  onChange,
}: {
  tab: TabKey
  onChange: (t: TabKey) => void
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-xl">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${
              tab === t.key ? 'font-semibold text-accent' : 'text-sub'
            }`}
          >
            <span className="text-xl">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
```

- [ ] **Step 6: 탭 플레이스홀더 3개 작성**

`src/tabs/prepare/PrepareTab.tsx`:
```tsx
export default function PrepareTab() {
  return <div className="space-y-3" />
}
```

`src/tabs/plan/PlanTab.tsx`:
```tsx
export default function PlanTab() {
  return <div className="space-y-3" />
}
```

`src/tabs/during/DuringTab.tsx`:
```tsx
export default function DuringTab() {
  return <div className="space-y-3" />
}
```

- [ ] **Step 7: src/App.tsx 교체**

```tsx
import { useState } from 'react'
import OfflineBanner from './components/OfflineBanner'
import TabBar, { type TabKey } from './components/TabBar'
import PrepareTab from './tabs/prepare/PrepareTab'
import PlanTab from './tabs/plan/PlanTab'
import DuringTab from './tabs/during/DuringTab'

export default function App() {
  const [tab, setTab] = useState<TabKey>('prepare')
  return (
    <div className="mx-auto min-h-dvh max-w-xl bg-bg pb-24 text-ink">
      <OfflineBanner />
      <header className="px-5 pt-7 pb-1">
        <h1 className="text-2xl font-bold">일본여행 🇯🇵</h1>
        <p className="mt-1 text-sm text-sub">2026.8.20(목) – 8.22(토) · 2박 3일</p>
      </header>
      <main className="px-5 py-3">
        {tab === 'prepare' && <PrepareTab />}
        {tab === 'plan' && <PlanTab />}
        {tab === 'during' && <DuringTab />}
      </main>
      <TabBar tab={tab} onChange={setTab} />
    </div>
  )
}
```

- [ ] **Step 8: 검증**

Run: `npm run build` → Expected: 통과
브라우저 확인: 하단 탭바 3개 표시·전환 동작(내용은 빈 화면). 개발자도구 Network에 firebase 웹소켓 연결. Wi-Fi 끊으면 잠시 후 오프라인 배너 표시, 복구 시 사라짐.

- [ ] **Step 9: Commit (push 금지)**

```powershell
git add -A
git commit -m @'
[기능] Firebase 연결·타입·훅·탭바 골격 구현

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 3: [여행 준비] 체크리스트 + 정보 카드 이식

**Files:**
- Create: `src/tabs/prepare/Checklist.tsx`, `src/tabs/prepare/InfoCards.tsx`
- Modify: `src/tabs/prepare/PrepareTab.tsx`

**Interfaces:**
- Consumes: `useRtdbValue`, `sortByOrder`, 타입 `ChecklistCategory`/`InfoCard`, `db`
- Produces: `<Checklist />`, `<InfoCards />` (props 없음). DB 경로 기존과 동일: `/checklist/{catId}`, `/info/{cardId}`

- [ ] **Step 1: src/tabs/prepare/Checklist.tsx 작성**

```tsx
import { push, ref, remove, update } from 'firebase/database'
import { useState, type FormEvent } from 'react'
import { db } from '../../lib/firebase'
import { sortByOrder } from '../../lib/sort'
import { useRtdbValue } from '../../hooks/useRtdb'
import type { ChecklistCategory } from '../../types'

export default function Checklist() {
  const data = useRtdbValue<Record<string, ChecklistCategory>>('checklist')
  const cats = sortByOrder(data)
  if (!cats.length) return <p className="py-8 text-center text-sm text-sub">체크리스트를 불러오는 중...</p>
  return (
    <div className="space-y-3">
      {cats.map(([catId, cat]) => (
        <Category key={catId} catId={catId} cat={cat} />
      ))}
    </div>
  )
}

function Category({ catId, cat }: { catId: string; cat: ChecklistCategory }) {
  const [text, setText] = useState('')
  const items = sortByOrder(cat.items)
  const done = items.filter(([, it]) => it.checked).length

  function addItem(e: FormEvent) {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    const maxOrder = items.reduce((m, [, it]) => Math.max(m, it.order ?? 0), -1)
    push(ref(db, `checklist/${catId}/items`), { text: t, checked: false, order: maxOrder + 1 })
    setText('')
  }

  return (
    <section className="rounded-xl border border-line bg-card px-4 py-3.5">
      <h2 className="text-base font-semibold">
        {cat.name} <span className="ml-1 text-[13px] font-normal text-sub">{done}/{items.length}</span>
      </h2>
      <div className="mt-1">
        {items.map(([itemId, it]) => (
          <div key={itemId} className="flex items-center gap-2.5 py-1.5">
            <input
              type="checkbox"
              checked={it.checked}
              onChange={e => update(ref(db, `checklist/${catId}/items/${itemId}`), { checked: e.target.checked })}
              className="size-5 accent-accent"
            />
            <span className={`flex-1 text-[15px] ${it.checked ? 'text-sub line-through' : ''}`}>{it.text}</span>
            <button
              onClick={() => remove(ref(db, `checklist/${catId}/items/${itemId}`))}
              className="text-[13px] text-sub hover:text-accent"
            >
              삭제
            </button>
          </div>
        ))}
      </div>
      <form onSubmit={addItem} className="mt-2 flex gap-1.5">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="항목 추가"
          className="min-w-0 flex-1 rounded-lg border border-line px-2.5 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-accent-soft px-3.5 font-semibold text-accent">
          추가
        </button>
      </form>
    </section>
  )
}
```

- [ ] **Step 2: src/tabs/prepare/InfoCards.tsx 작성**

```tsx
import { push, ref, remove, update } from 'firebase/database'
import { useState, type FormEvent } from 'react'
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
          <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="text-accent underline">
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setContent('')
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
    resetForm()
  }

  return (
    <div className="space-y-3">
      {cards.map(([id, c]) => (
        <section key={id} className="rounded-xl border border-line bg-card px-4 py-3.5">
          <h2 className="text-base font-semibold">{c.title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap break-all">
            <Linkified text={c.content} />
          </p>
          <div className="mt-2 flex justify-end gap-3 text-[13px] text-sub">
            <button
              onClick={() => {
                setEditingId(id)
                setTitle(c.title)
                setContent(c.content)
              }}
              className="hover:text-accent"
            >
              수정
            </button>
            <button
              onClick={() => {
                remove(ref(db, `info/${id}`))
                if (editingId === id) resetForm()
              }}
              className="hover:text-accent"
            >
              삭제
            </button>
          </div>
        </section>
      ))}
      <form onSubmit={submit} className="grid gap-2">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="카드 제목 (필수)"
          required
          className="rounded-lg border border-line bg-card px-3 py-2.5 text-sm"
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="내용 (URL은 자동으로 링크가 됩니다)"
          rows={4}
          required
          className="rounded-lg border border-line bg-card px-3 py-2.5 text-sm"
        />
        <button type="submit" className="rounded-lg bg-accent py-2.5 text-[15px] font-semibold text-white">
          {editingId ? '카드 수정' : '정보 카드 추가'}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} className="text-[13px] text-sub">
            수정 취소
          </button>
        )}
      </form>
    </div>
  )
}
```

- [ ] **Step 3: PrepareTab에 조립**

`src/tabs/prepare/PrepareTab.tsx` 전체 교체:
```tsx
import Checklist from './Checklist'
import InfoCards from './InfoCards'

export default function PrepareTab() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-2 text-lg font-bold">준비물 체크리스트</h2>
        <Checklist />
      </section>
      <section>
        <h2 className="mb-2 text-lg font-bold">준비 정보</h2>
        <InfoCards />
      </section>
    </div>
  )
}
```

- [ ] **Step 4: 검증**

Run: `npm run build` → 통과
브라우저 확인: 기존 DB의 체크리스트 카테고리·항목과 정보 카드가 그대로 표시. 체크 토글/항목 추가·삭제/카드 추가·수정·삭제 동작. 창 2개 열고 실시간 동기화 확인.

- [ ] **Step 5: Commit (push 금지)**

```powershell
git add -A
git commit -m @'
[기능] 여행 준비 탭 - 체크리스트·정보 카드 이식

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 4: [여행 준비] D-day 카운트다운 + 엔화 환율 위젯

**Files:**
- Create: `src/tabs/prepare/Dday.tsx`, `src/tabs/prepare/FxRate.tsx`
- Modify: `src/tabs/prepare/PrepareTab.tsx`

**Interfaces:**
- Consumes: `dDay()` from `src/lib/dates.ts`
- Produces: `<Dday />`, `<FxRate />` (props 없음). 환율 API: `https://open.er-api.com/v6/latest/JPY` (무키·일 단위 갱신, `rates.KRW` 사용)

- [ ] **Step 1: src/tabs/prepare/Dday.tsx 작성**

```tsx
import { dDay } from '../../lib/dates'

export default function Dday() {
  const d = dDay()
  let label: string
  if (d > 0) label = `D-${d}`
  else if (d >= -2) label = '여행 중! 🎌'
  else label = '다녀왔어요 ✈️'
  return (
    <div className="rounded-xl bg-accent px-4 py-4 text-center text-white">
      <div className="text-3xl font-bold">{label}</div>
      {d > 0 && <div className="mt-1 text-sm opacity-90">출발까지 {d}일 남았어요</div>}
    </div>
  )
}
```

- [ ] **Step 2: src/tabs/prepare/FxRate.tsx 작성**

```tsx
import { useEffect, useState } from 'react'

export default function FxRate() {
  const [per100, setPer100] = useState<number | null>(null)
  const [updated, setUpdated] = useState('')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/JPY')
      .then(r => r.json())
      .then((d: { result: string; rates?: { KRW?: number }; time_last_update_utc?: string }) => {
        if (d.result !== 'success' || !d.rates?.KRW) throw new Error('bad response')
        setPer100(d.rates.KRW * 100)
        if (d.time_last_update_utc) {
          setUpdated(new Date(d.time_last_update_utc).toLocaleDateString('ko-KR'))
        }
      })
      .catch(() => setFailed(true))
  }, [])

  if (failed) return null
  return (
    <div className="flex items-center justify-between rounded-xl border border-line bg-card px-4 py-3.5">
      <div>
        <div className="text-[13px] text-sub">엔화 환율 (참고용)</div>
        <div className="text-xl font-bold">
          {per100 === null ? '불러오는 중...' : `100엔 = ${per100.toFixed(1)}원`}
        </div>
      </div>
      {updated && <div className="text-[12px] text-sub">{updated} 기준</div>}
    </div>
  )
}
```

- [ ] **Step 3: PrepareTab에 추가**

`src/tabs/prepare/PrepareTab.tsx` 전체 교체:
```tsx
import Dday from './Dday'
import FxRate from './FxRate'
import Checklist from './Checklist'
import InfoCards from './InfoCards'

export default function PrepareTab() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Dday />
        <FxRate />
      </div>
      <section>
        <h2 className="mb-2 text-lg font-bold">준비물 체크리스트</h2>
        <Checklist />
      </section>
      <section>
        <h2 className="mb-2 text-lg font-bold">준비 정보</h2>
        <InfoCards />
      </section>
    </div>
  )
}
```

- [ ] **Step 4: 검증**

Run: `npm run build` → 통과
브라우저 확인: D-day 배지(오늘 기준 정확한 일수), "100엔 = ○○○.○원" + 갱신일 표시. 개발자도구에서 er-api 요청 차단 시 위젯이 조용히 사라지는지 확인.

- [ ] **Step 5: Commit (push 금지)**

```powershell
git add -A
git commit -m @'
[기능] 여행 준비 탭 - D-day·엔화 환율 위젯 추가

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 5: [여행 계획] 일정표 이식 + 장소명 지오코딩 + 구글맵 링크

**Files:**
- Create: `src/lib/googleMaps.ts`, `src/lib/geocode.ts`, `src/components/PlaceSearchInput.tsx`, `src/components/DayTabs.tsx`, `src/tabs/plan/ItinerarySection.tsx`
- Modify: `src/tabs/plan/PlanTab.tsx`

**Interfaces:**
- Consumes: `DAYS`, `sortByOrder`, `useRtdbValue`, `db`, 타입 `DayKey`/`ItineraryItem`
- Produces:
  - `placeSearchUrl(place: string, lat?: number, lng?: number): string`, `directionsUrl(lat: number, lng: number): string` from `src/lib/googleMaps.ts`
  - `geocode(query: string): Promise<GeocodeResult[]>`, `type GeocodeResult = { displayName: string; lat: number; lng: number }` from `src/lib/geocode.ts`
  - `<PlaceSearchInput value coords onChange onCoords />` — Task 6(후보 보드)도 재사용
  - `<DayTabs day onChange />` — Task 7(오늘 뷰)도 재사용
  - DB 쓰기: `/itinerary/{day}/{id}`에 `lat`/`lng` 포함 가능

- [ ] **Step 1: src/lib/googleMaps.ts 작성**

```ts
export function placeSearchUrl(place: string, lat?: number, lng?: number): string {
  return lat != null && lng != null
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`
}

export function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}
```

- [ ] **Step 2: src/lib/geocode.ts 작성**

```ts
export type GeocodeResult = { displayName: string; lat: number; lng: number }

export async function geocode(query: string): Promise<GeocodeResult[]> {
  const url =
    'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=ko&q=' +
    encodeURIComponent(query)
  const res = await fetch(url)
  if (!res.ok) return []
  const data: { display_name: string; lat: string; lon: string }[] = await res.json()
  return data.map(d => ({
    displayName: d.display_name,
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lon),
  }))
}
```

- [ ] **Step 3: src/components/PlaceSearchInput.tsx 작성**

장소 텍스트 입력 + "좌표 검색" 버튼. 검색 결과에서 선택하면 좌표 저장, 좌표 배지와 해제 버튼 표시.

```tsx
import { useState } from 'react'
import { geocode, type GeocodeResult } from '../lib/geocode'

export type Coords = { lat: number; lng: number } | null

export default function PlaceSearchInput({
  value,
  coords,
  onChange,
  onCoords,
}: {
  value: string
  coords: Coords
  onChange: (place: string) => void
  onCoords: (c: Coords) => void
}) {
  const [results, setResults] = useState<GeocodeResult[] | null>(null)
  const [searching, setSearching] = useState(false)

  async function search() {
    const q = value.trim()
    if (!q || searching) return
    setSearching(true)
    try {
      setResults(await geocode(q))
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5">
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="장소"
          className="min-w-0 flex-1 rounded-lg border border-line bg-card px-3 py-2.5 text-sm"
        />
        <button
          type="button"
          onClick={search}
          disabled={searching}
          className="shrink-0 rounded-lg bg-accent-soft px-3 text-sm font-semibold text-accent disabled:opacity-50"
        >
          {searching ? '검색 중' : '좌표 검색'}
        </button>
      </div>
      {coords && (
        <div className="flex items-center gap-2 text-[13px] text-sub">
          <span>📍 좌표 설정됨</span>
          <button type="button" onClick={() => onCoords(null)} className="underline">
            해제
          </button>
        </div>
      )}
      {results !== null && (
        <div className="overflow-hidden rounded-lg border border-line bg-card">
          {results.length === 0 && (
            <p className="px-3 py-2 text-[13px] text-sub">
              결과가 없어요 — 다른 이름으로 검색하거나 좌표 없이 저장하세요
            </p>
          )}
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onCoords({ lat: r.lat, lng: r.lng })
                setResults(null)
              }}
              className="block w-full border-b border-line px-3 py-2 text-left text-[13px] last:border-b-0 hover:bg-accent-soft"
            >
              {r.displayName}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: src/components/DayTabs.tsx 작성**

```tsx
import { DAYS } from '../lib/dates'
import type { DayKey } from '../types'

export default function DayTabs({
  day,
  onChange,
}: {
  day: DayKey
  onChange: (d: DayKey) => void
}) {
  return (
    <div className="flex gap-1.5">
      {DAYS.map(d => (
        <button
          key={d.key}
          type="button"
          onClick={() => onChange(d.key)}
          className={`flex-1 rounded-lg border py-2 text-sm ${
            day === d.key
              ? 'border-accent bg-accent-soft font-semibold text-accent'
              : 'border-line bg-card text-sub'
          }`}
        >
          {d.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: src/tabs/plan/ItinerarySection.tsx 작성**

```tsx
import { push, ref, remove, update } from 'firebase/database'
import { useState, type FormEvent } from 'react'
import DayTabs from '../../components/DayTabs'
import PlaceSearchInput, { type Coords } from '../../components/PlaceSearchInput'
import { db } from '../../lib/firebase'
import { placeSearchUrl } from '../../lib/googleMaps'
import { sortByOrder } from '../../lib/sort'
import { useRtdbValue } from '../../hooks/useRtdb'
import type { DayKey, ItineraryItem } from '../../types'

export default function ItinerarySection() {
  const data = useRtdbValue<Partial<Record<DayKey, Record<string, ItineraryItem>>>>('itinerary')
  const [day, setDay] = useState<DayKey>('day1')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [time, setTime] = useState('')
  const [title, setTitle] = useState('')
  const [place, setPlace] = useState('')
  const [memo, setMemo] = useState('')
  const [coords, setCoords] = useState<Coords>(null)

  const items = sortByOrder(data?.[day])

  function resetForm() {
    setEditingId(null)
    setTime('')
    setTitle('')
    setPlace('')
    setMemo('')
    setCoords(null)
  }

  function startEdit(id: string, it: ItineraryItem) {
    setEditingId(id)
    setTime(it.time ?? '')
    setTitle(it.title)
    setPlace(it.place ?? '')
    setMemo(it.memo ?? '')
    setCoords(it.lat != null && it.lng != null ? { lat: it.lat, lng: it.lng } : null)
  }

  function swapOrder(i: number, j: number) {
    const [idA, a] = items[i]
    const [idB, b] = items[j]
    update(ref(db, `itinerary/${day}`), {
      [`${idA}/order`]: b.order ?? j,
      [`${idB}/order`]: a.order ?? i,
    })
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    const item = {
      time,
      title: t,
      place: place.trim(),
      memo: memo.trim(),
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
    }
    if (editingId) {
      update(ref(db, `itinerary/${day}/${editingId}`), item)
    } else {
      const maxOrder = items.reduce((m, [, it]) => Math.max(m, it.order ?? 0), -1)
      push(ref(db, `itinerary/${day}`), { ...item, order: maxOrder + 1 })
    }
    resetForm()
  }

  return (
    <div className="space-y-3">
      <DayTabs day={day} onChange={d => { setDay(d); resetForm() }} />
      {!items.length && (
        <p className="py-8 text-center text-sm text-sub">아직 일정이 없어요. 아래에서 추가해 보세요!</p>
      )}
      {items.map(([id, it], idx) => (
        <div key={id} className="flex items-start gap-3 rounded-xl border border-line bg-card px-4 py-3.5">
          <div className="min-w-12 pt-0.5 text-sm font-bold text-accent">{it.time || '—'}</div>
          <div className="flex-1">
            <div className="font-semibold">{it.title}</div>
            {it.place && (
              <a
                href={placeSearchUrl(it.place, it.lat, it.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 block text-[13px] text-sub underline"
              >
                📍 {it.place}
              </a>
            )}
            {it.memo && <div className="mt-1.5 text-[13px] whitespace-pre-wrap">{it.memo}</div>}
          </div>
          <div className="flex flex-col gap-0.5 text-[13px] text-sub">
            <button disabled={idx === 0} onClick={() => swapOrder(idx, idx - 1)} className="disabled:opacity-30">▲</button>
            <button disabled={idx === items.length - 1} onClick={() => swapOrder(idx, idx + 1)} className="disabled:opacity-30">▼</button>
            <button onClick={() => startEdit(id, it)} className="hover:text-accent">수정</button>
            <button
              onClick={() => {
                remove(ref(db, `itinerary/${day}/${id}`))
                if (editingId === id) resetForm()
              }}
              className="hover:text-accent"
            >
              삭제
            </button>
          </div>
        </div>
      ))}
      <form onSubmit={submit} className="grid gap-2">
        <input type="time" value={time} onChange={e => setTime(e.target.value)}
          className="rounded-lg border border-line bg-card px-3 py-2.5 text-sm" />
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="일정 제목 (필수)" required
          className="rounded-lg border border-line bg-card px-3 py-2.5 text-sm" />
        <PlaceSearchInput value={place} coords={coords} onChange={setPlace} onCoords={setCoords} />
        <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="메모" rows={2}
          className="rounded-lg border border-line bg-card px-3 py-2.5 text-sm" />
        <button type="submit" className="rounded-lg bg-accent py-2.5 text-[15px] font-semibold text-white">
          {editingId ? '일정 수정' : '일정 추가'}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} className="text-[13px] text-sub">수정 취소</button>
        )}
      </form>
    </div>
  )
}
```

주의: RTDB `update`에 `null` 값을 주면 해당 필드가 삭제된다 — 좌표 해제 시 기존 lat/lng 제거에 그대로 활용된다 (의도된 동작).

- [ ] **Step 6: PlanTab에 조립**

`src/tabs/plan/PlanTab.tsx` 전체 교체:
```tsx
import ItinerarySection from './ItinerarySection'

export default function PlanTab() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-2 text-lg font-bold">날짜별 일정</h2>
        <ItinerarySection />
      </section>
    </div>
  )
}
```

- [ ] **Step 7: 검증**

Run: `npm run build` → 통과
브라우저 확인: 기존 일정 데이터 표시, 추가/수정/삭제/▲▼ 동작. "도쿄역"으로 좌표 검색 → 후보 선택 → 저장 후 Firebase 콘솔에서 lat/lng 저장 확인. 장소 링크 클릭 시 구글맵 새 탭. 좌표 해제 후 수정 저장 시 DB에서 lat/lng 사라지는지 확인.

- [ ] **Step 8: Commit (push 금지)**

```powershell
git add -A
git commit -m @'
[기능] 여행 계획 탭 - 일정표 이식 및 장소 좌표 검색 추가

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 6: [여행 계획] 가고 싶은 곳 후보 보드

**Files:**
- Create: `src/tabs/plan/Wishlist.tsx`
- Modify: `src/tabs/plan/PlanTab.tsx`

**Interfaces:**
- Consumes: `PlaceSearchInput`, `DAYS`, `sortByOrder`, `useRtdbValue`, `db`, 타입 `WishlistItem`/`DayKey`/`ItineraryItem`
- Produces: `<Wishlist />`. DB 경로 `/wishlist/{id}` = `{title, place?, memo?, lat?, lng?, order}`. "일정으로 옮기기"는 `get()`으로 대상 날짜 maxOrder 계산 후 push → wishlist에서 remove

- [ ] **Step 1: src/tabs/plan/Wishlist.tsx 작성**

```tsx
import { get, push, ref, remove } from 'firebase/database'
import { useState, type FormEvent } from 'react'
import PlaceSearchInput, { type Coords } from '../../components/PlaceSearchInput'
import { DAYS } from '../../lib/dates'
import { db } from '../../lib/firebase'
import { placeSearchUrl } from '../../lib/googleMaps'
import { sortByOrder } from '../../lib/sort'
import { useRtdbValue } from '../../hooks/useRtdb'
import type { DayKey, ItineraryItem, WishlistItem } from '../../types'

export default function Wishlist() {
  const data = useRtdbValue<Record<string, WishlistItem>>('wishlist')
  const items = sortByOrder(data)
  const [title, setTitle] = useState('')
  const [place, setPlace] = useState('')
  const [memo, setMemo] = useState('')
  const [coords, setCoords] = useState<Coords>(null)
  const [movingId, setMovingId] = useState<string | null>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    const maxOrder = items.reduce((m, [, it]) => Math.max(m, it.order ?? 0), -1)
    push(ref(db, 'wishlist'), {
      title: t,
      place: place.trim(),
      memo: memo.trim(),
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      order: maxOrder + 1,
    })
    setTitle(''); setPlace(''); setMemo(''); setCoords(null)
  }

  async function moveToDay(id: string, it: WishlistItem, day: DayKey) {
    const snap = await get(ref(db, `itinerary/${day}`))
    const existing = (snap.val() ?? {}) as Record<string, ItineraryItem>
    const maxOrder = Object.values(existing).reduce((m, i) => Math.max(m, i.order ?? 0), -1)
    await push(ref(db, `itinerary/${day}`), {
      time: '',
      title: it.title,
      place: it.place ?? '',
      memo: it.memo ?? '',
      lat: it.lat ?? null,
      lng: it.lng ?? null,
      order: maxOrder + 1,
    })
    await remove(ref(db, `wishlist/${id}`))
    setMovingId(null)
  }

  return (
    <div className="space-y-3">
      {!items.length && (
        <p className="py-6 text-center text-sm text-sub">
          가보고 싶은 곳을 모아두고, 정해지면 일정으로 옮기세요!
        </p>
      )}
      {items.map(([id, it]) => (
        <div key={id} className="rounded-xl border border-line bg-card px-4 py-3.5">
          <div className="font-semibold">{it.title}</div>
          {it.place && (
            <a
              href={placeSearchUrl(it.place, it.lat, it.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 block text-[13px] text-sub underline"
            >
              📍 {it.place}
            </a>
          )}
          {it.memo && <div className="mt-1.5 text-[13px] whitespace-pre-wrap">{it.memo}</div>}
          <div className="mt-2 flex items-center justify-end gap-3 text-[13px] text-sub">
            {movingId === id ? (
              <>
                <span>어느 날로?</span>
                {DAYS.map(d => (
                  <button key={d.key} onClick={() => moveToDay(id, it, d.key)} className="font-semibold text-accent">
                    {d.label}
                  </button>
                ))}
                <button onClick={() => setMovingId(null)}>취소</button>
              </>
            ) : (
              <>
                <button onClick={() => setMovingId(id)} className="font-semibold text-accent">
                  일정으로 옮기기
                </button>
                <button onClick={() => remove(ref(db, `wishlist/${id}`))} className="hover:text-accent">
                  삭제
                </button>
              </>
            )}
          </div>
        </div>
      ))}
      <form onSubmit={submit} className="grid gap-2">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="가고 싶은 곳 (필수)" required
          className="rounded-lg border border-line bg-card px-3 py-2.5 text-sm" />
        <PlaceSearchInput value={place} coords={coords} onChange={setPlace} onCoords={setCoords} />
        <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="메모 (왜 가고 싶은지 등)" rows={2}
          className="rounded-lg border border-line bg-card px-3 py-2.5 text-sm" />
        <button type="submit" className="rounded-lg bg-accent-soft py-2.5 text-[15px] font-semibold text-accent">
          후보 추가
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: PlanTab에 조립**

`src/tabs/plan/PlanTab.tsx` 전체 교체:
```tsx
import ItinerarySection from './ItinerarySection'
import Wishlist from './Wishlist'

export default function PlanTab() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-2 text-lg font-bold">날짜별 일정</h2>
        <ItinerarySection />
      </section>
      <section>
        <h2 className="mb-2 text-lg font-bold">가고 싶은 곳</h2>
        <Wishlist />
      </section>
    </div>
  )
}
```

- [ ] **Step 3: 검증**

Run: `npm run build` → 통과
브라우저 확인: 후보 추가(좌표 포함/미포함), "일정으로 옮기기" → 날짜 선택 → 해당 날짜 일정 맨 아래 추가되고 보드에서 사라짐(좌표도 함께 이동). 실시간 동기화 확인.

- [ ] **Step 4: Commit (push 금지)**

```powershell
git add -A
git commit -m @'
[기능] 여행 계획 탭 - 가고 싶은 곳 후보 보드 추가

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 7: [여행 중] 오늘 일정 뷰

**Files:**
- Create: `src/tabs/during/TodayView.tsx`
- Modify: `src/tabs/during/DuringTab.tsx`

**Interfaces:**
- Consumes: `DayTabs`, `todayKey`, `sortByOrder`, `useRtdbValue`, `directionsUrl`/`placeSearchUrl`, 타입 `DayKey`/`ItineraryItem`
- Produces:
  - `DuringTab`이 `day` 상태(기본값 `todayKey() ?? 'day1'`)와 일정 데이터를 소유하고, `<TodayView items isToday />`에 전달
  - `items: [string, ItineraryItem][]` (order 정렬됨) — Task 8의 지도도 같은 데이터를 쓴다

- [ ] **Step 1: src/tabs/during/TodayView.tsx 작성**

```tsx
import { placeSearchUrl } from '../../lib/googleMaps'
import type { ItineraryItem } from '../../types'

function nowHM(): string {
  const n = new Date()
  return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`
}

export default function TodayView({
  items,
  isToday,
}: {
  items: [string, ItineraryItem][]
  isToday: boolean
}) {
  const now = nowHM()
  const timed = items.filter(([, it]) => it.time)
  const currentId = isToday
    ? [...timed].reverse().find(([, it]) => it.time! <= now)?.[0] ?? null
    : null
  const nextId = isToday ? timed.find(([, it]) => it.time! > now)?.[0] ?? null : null

  if (!items.length) {
    return <p className="py-8 text-center text-sm text-sub">이 날의 일정이 없어요. 여행 계획 탭에서 추가하세요!</p>
  }
  return (
    <div className="space-y-2.5">
      {items.map(([id, it]) => {
        const badge = id === currentId ? '지금' : id === nextId ? '다음' : null
        return (
          <div
            key={id}
            className={`flex items-start gap-3 rounded-xl border bg-card px-4 py-3.5 ${
              badge ? 'border-accent' : 'border-line'
            }`}
          >
            <div className="min-w-12 pt-0.5 text-sm font-bold text-accent">{it.time || '—'}</div>
            <div className="flex-1">
              <div className="font-semibold">
                {badge && (
                  <span className="mr-1.5 rounded bg-accent px-1.5 py-0.5 text-[11px] font-bold text-white">
                    {badge}
                  </span>
                )}
                {it.title}
              </div>
              {it.place && (
                <a
                  href={placeSearchUrl(it.place, it.lat, it.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 block text-[13px] text-sub underline"
                >
                  📍 {it.place}
                </a>
              )}
              {it.memo && <div className="mt-1.5 text-[13px] whitespace-pre-wrap">{it.memo}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: DuringTab 교체**

`src/tabs/during/DuringTab.tsx` 전체 교체:
```tsx
import { useState } from 'react'
import DayTabs from '../../components/DayTabs'
import { todayKey } from '../../lib/dates'
import { sortByOrder } from '../../lib/sort'
import { useRtdbValue } from '../../hooks/useRtdb'
import type { DayKey, ItineraryItem } from '../../types'
import TodayView from './TodayView'

export default function DuringTab() {
  const data = useRtdbValue<Partial<Record<DayKey, Record<string, ItineraryItem>>>>('itinerary')
  const [day, setDay] = useState<DayKey>(() => todayKey() ?? 'day1')
  const items = sortByOrder(data?.[day])

  return (
    <div className="space-y-3">
      <DayTabs day={day} onChange={setDay} />
      <TodayView items={items} isToday={day === todayKey()} />
    </div>
  )
}
```

- [ ] **Step 3: 검증**

Run: `npm run build` → 통과
브라우저 확인: 여행 기간이 아니므로 day1 기본 선택, 일정 리스트 표시. `src/lib/dates.ts`의 `DAYS`에서 day1 날짜를 임시로 오늘 날짜로 바꿔 "지금/다음" 배지가 시간 기준으로 붙는지 확인 후 **반드시 원복**.

- [ ] **Step 4: Commit (push 금지)**

```powershell
git add -A
git commit -m @'
[기능] 여행 중 탭 - 오늘 일정 뷰 구현

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 8: [여행 중] 내장 지도 (일정 마커 + 내 위치)

**Files:**
- Create: `src/tabs/during/TripMap.tsx`
- Modify: `src/tabs/during/DuringTab.tsx`

**Interfaces:**
- Consumes: Task 7의 `items: [string, ItineraryItem][]`, `directionsUrl`
- Produces: `<TripMap items />` — 좌표 있는 항목만 마커. Geolocation 실패/거부 시 내 위치 생략

- [ ] **Step 1: src/tabs/during/TripMap.tsx 작성**

```tsx
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
import { useEffect, useState } from 'react'
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { directionsUrl } from '../../lib/googleMaps'
import type { ItineraryItem } from '../../types'

L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

const TOKYO: [number, number] = [35.681, 139.767]

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 })
    }
  }, [map, JSON.stringify(points)])
  return null
}

export default function TripMap({ items }: { items: [string, ItineraryItem][] }) {
  const [myPos, setMyPos] = useState<[number, number] | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) return
    const id = navigator.geolocation.watchPosition(
      p => setMyPos([p.coords.latitude, p.coords.longitude]),
      () => setMyPos(null),
      { enableHighAccuracy: true, maximumAge: 10000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [])

  const markers = items.filter(([, it]) => it.lat != null && it.lng != null)
  const points = markers.map(([, it]) => [it.lat!, it.lng!] as [number, number])

  return (
    <div className="relative z-0 h-80 overflow-hidden rounded-xl border border-line">
      <MapContainer center={TOKYO} zoom={12} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {markers.map(([id, it]) => (
          <Marker key={id} position={[it.lat!, it.lng!]}>
            <Popup>
              <div className="text-sm font-semibold">{it.time ? `${it.time} · ` : ''}{it.title}</div>
              {it.place && <div className="text-xs">{it.place}</div>}
              <a
                href={directionsUrl(it.lat!, it.lng!)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline"
              >
                구글맵 길찾기
              </a>
            </Popup>
          </Marker>
        ))}
        {myPos && (
          <CircleMarker
            center={myPos}
            radius={8}
            pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.9 }}
          >
            <Popup>내 위치</Popup>
          </CircleMarker>
        )}
      </MapContainer>
      {!markers.length && (
        <div className="pointer-events-none absolute inset-x-0 top-2 z-[500] text-center">
          <span className="rounded-full bg-card/90 px-3 py-1 text-[12px] text-sub">
            좌표가 등록된 일정이 없어요 — 여행 계획 탭에서 좌표 검색으로 추가하세요
          </span>
        </div>
      )}
    </div>
  )
}
```

주의사항:
- `relative z-0` 래퍼는 Leaflet 내부 z-index(400+)가 하단 탭바(z-20) 위로 뚫고 나오는 것을 막는 스태킹 컨텍스트다. 빼면 지도 컨트롤이 탭바를 덮는다.
- `FitBounds` 의존성에 `JSON.stringify(points)`를 쓰는 것은 배열 identity 변화로 인한 무한 재조정 방지 목적 (eslint 없음, tsc만 통과하면 됨).

- [ ] **Step 2: DuringTab에 지도 추가**

`src/tabs/during/DuringTab.tsx` 전체 교체:
```tsx
import { useState } from 'react'
import DayTabs from '../../components/DayTabs'
import { todayKey } from '../../lib/dates'
import { sortByOrder } from '../../lib/sort'
import { useRtdbValue } from '../../hooks/useRtdb'
import type { DayKey, ItineraryItem } from '../../types'
import TodayView from './TodayView'
import TripMap from './TripMap'

export default function DuringTab() {
  const data = useRtdbValue<Partial<Record<DayKey, Record<string, ItineraryItem>>>>('itinerary')
  const [day, setDay] = useState<DayKey>(() => todayKey() ?? 'day1')
  const items = sortByOrder(data?.[day])

  return (
    <div className="space-y-3">
      <DayTabs day={day} onChange={setDay} />
      <TripMap items={items} />
      <TodayView items={items} isToday={day === todayKey()} />
    </div>
  )
}
```

- [ ] **Step 3: 검증**

Run: `npm run build` → 통과
브라우저 확인: 지도 렌더(OSM 타일), 좌표 있는 일정이 마커로 표시되고 전체가 화면에 들어오게 자동 줌. 마커 팝업 → "구글맵 길찾기" 새 탭. 위치 권한 허용 시 파란 원(내 위치), 거부 시 에러 없이 생략. 날짜 탭 전환 시 마커 갱신. 지도 위 스크롤/드래그와 하단 탭바 겹침 없는지 확인.

- [ ] **Step 4: Commit (push 금지)**

```powershell
git add -A
git commit -m @'
[기능] 여행 중 탭 - 내장 지도(일정 마커·내 위치) 구현

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 9: README 갱신, 최종 검증, push 및 배포 확인

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: 완성된 앱 전체
- Produces: 배포된 사이트 `https://japantrip-orpin.vercel.app`

- [ ] **Step 1: README.md 전체 교체**

````markdown
# 일본여행 준비 사이트 🇯🇵

2026.8.20(목) – 8.22(토) 2박 3일 일본여행 준비용 웹앱.

**사이트:** https://japantrip-orpin.vercel.app

## 탭 구성

- **여행 준비** — D-day, 엔화 환율(참고용), 준비물 체크리스트, 준비 정보 카드
- **여행 계획** — 날짜별 일정표(장소 좌표 검색·구글맵 연동), 가고 싶은 곳 후보 보드
- **여행 중** — 오늘 일정 뷰(지금/다음 하이라이트), 내장 지도(일정 마커 + 내 위치)

## 스택

Vite + React + TypeScript + Tailwind CSS · Firebase Realtime Database(실시간 공유) ·
Leaflet/OpenStreetMap · Nominatim 지오코딩

## 개발

```bash
npm install
npm run dev    # http://localhost:5173
npm run build  # 타입체크 + 프로덕션 빌드
```

`main` push 시 Vercel Git 연동이 자동 배포하고, GitHub Actions는 타입체크+빌드(CI)를 수행한다.
````

- [ ] **Step 2: 전체 수동 검증**

Run: `npm run build` → 통과
`npm run dev`에서 최종 점검: 3탭 전체 순회 — 준비(D-day/환율/체크/정보), 계획(일정 CRUD/좌표 검색/후보 보드 옮기기), 여행 중(일정 뷰/지도 마커/내 위치). 창 2개 실시간 동기화. 모바일 뷰포트(390px)에서 레이아웃 확인.

- [ ] **Step 3: Commit & Push**

```powershell
git add -A
git commit -m @'
[수정] README 갱신 (React 개편 반영)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
git push origin master:main
```

- [ ] **Step 4: 배포 검증**

- GitHub Actions CI 통과 확인: `gh run watch` 또는 저장소 Actions 탭
- Vercel 배포 완료 후 `https://japantrip-orpin.vercel.app` 접속 → 3탭 정상 동작, Firebase 데이터 표시 확인
- 만약 Vercel이 정적 사이트로 배포(빈 화면/구버전)하면: Vercel 대시보드 > Project Settings > Build & Development Settings에서 Framework Preset이 `Vite`인지 확인 (vercel.json이 우선 적용되므로 보통 불필요)

- [ ] **Step 5: 완료 보고**

사용자에게 배포 URL과 탭별 기능 요약 전달.
