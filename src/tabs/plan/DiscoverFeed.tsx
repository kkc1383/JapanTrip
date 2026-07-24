import { get, push, ref } from "firebase/database";
import { useEffect, useRef, useState } from "react";
import { db } from "../../lib/firebase";
import { sortByOrder } from "../../lib/sort";
import { useRtdbValue } from "../../hooks/useRtdb";

type Post = {
  title: string;
  image: string;
  url: string;
  source: string;
  tag?: string;
  order: number;
};

const TAGS = ["전체", "코스", "명소", "맛집", "카페", "쇼핑", "근교"];
const PAGE = 8;

/** 샤오홍슈 스타일 2열 폭포수 피드 — 실제 도쿄 여행 포스트 큐레이션 */
export default function DiscoverFeed() {
  const data = useRtdbValue<Record<string, Post>>("discover");
  const posts = sortByOrder(data);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [tag, setTag] = useState("전체");
  const [visible, setVisible] = useState(PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered =
    tag === "전체" ? posts : posts.filter(([, p]) => p.tag === tag);
  const shown = filtered.slice(0, visible);
  const hasMore = shown.length < filtered.length;

  // 태그 바꾸면 처음부터
  useEffect(() => {
    setVisible(PAGE);
  }, [tag]);

  // 무한 스크롤: 센티널이 보이면 다음 페이지
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const ob = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisible((v) => v + PAGE);
      },
      { rootMargin: "500px" },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [hasMore, filtered.length]);

  if (!posts.length) return null;

  async function save(id: string, p: Post) {
    if (saved[id]) return;
    setSaved((s) => ({ ...s, [id]: true }));
    // 직접 추가와 같은 규칙(maxOrder+1)으로 정렬값 부여
    const snap = await get(ref(db, "wishlist"));
    const existing = Object.values(
      (snap.val() ?? {}) as Record<string, { order?: number }>,
    );
    const maxOrder = existing.reduce((m, it) => Math.max(m, it.order ?? 0), -1);
    push(ref(db, "wishlist"), {
      title: p.title,
      place: "",
      memo: `📌 저장한 포스트 — ${p.source}\n${p.url}`,
      lat: null,
      lng: null,
      order: maxOrder + 1,
    });
  }

  return (
    <div>
      {/* 태그 필터 칩 */}
      <div className="mb-2.5 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TAGS.map((t) => {
          const active = tag === t;
          const count =
            t === "전체"
              ? posts.length
              : posts.filter(([, p]) => p.tag === t).length;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t)}
              className={`font-display shrink-0 rounded-full border px-3 py-1 text-[11.5px] transition-colors ${
                active
                  ? "border-accent bg-accent text-[#fff6e9]"
                  : "border-line bg-card text-sub hover:border-accent/50"
              }`}
            >
              {t}{" "}
              <span className={active ? "opacity-80" : "opacity-60"}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 좌/우 열 고정 배정(짝수→왼쪽, 홀수→오른쪽) — CSS columns는 이미지 로딩에 따라 재배치돼 순서가 튄다 */}
      <div className="flex items-start gap-2.5">
        {[0, 1].map((ci) => (
          <div key={ci} className="min-w-0 flex-1 space-y-2.5">
            {shown
              .filter((_, i) => i % 2 === ci)
              .map(([id, p]) => (
                <div key={id} className="card overflow-hidden !p-0">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full bg-line/40"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="px-2.5 pt-2">
                      {p.tag && (
                        <span className="mr-1 inline-block rounded-sm bg-accent-soft px-1 py-px text-[9.5px] font-bold text-accent">
                          {p.tag}
                        </span>
                      )}
                      <span className="text-[12px] leading-snug font-medium break-keep text-ink/90">
                        {p.title}
                      </span>
                    </div>
                  </a>
                  <div className="flex items-center justify-between px-2.5 py-1.5">
                    <span className="text-[10px] text-sub">{p.source}</span>
                    <button
                      type="button"
                      onClick={() => save(id, p)}
                      disabled={!!saved[id]}
                      className={`text-[11px] font-semibold ${saved[id] ? "text-sub" : "text-accent"}`}
                    >
                      {saved[id] ? "✓ 담음" : "＋ 후보에 담기"}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      {hasMore ? (
        <div
          ref={sentinelRef}
          className="py-4 text-center text-[11px] tracking-wide text-sub"
        >
          불러오는 중...
        </div>
      ) : filtered.length > 0 ? (
        <p className="py-3 text-center text-[10px] tracking-[0.3em] text-sub/60">
          · 피드의 끝 ·
        </p>
      ) : (
        <p className="empty-box">이 카테고리는 아직 글이 없어요</p>
      )}
    </div>
  );
}
