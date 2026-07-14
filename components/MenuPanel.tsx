"use client";

import { useState, useEffect } from "react";
import type { Dish, Restaurant } from "@/types";

type View = "list" | "detail" | "map";

interface Props {
  dishes: Dish[];
  restaurants: Restaurant[];
  activeRestaurantId: string | null;
  onShowOnMap: (dishId: string, filtered: Restaurant[]) => void;
  onRestaurantSelect: (r: Restaurant | null) => void;
  onReset: () => void;
}

const CATEGORY_ORDER = ["スープ", "ペストリー", "スイーツ", "メイン料理"];

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 opacity-40">
      <path d="M5 3 L9 7 L5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function BackArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M9 3 L5 7 L9 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function MenuPanel({
  dishes, restaurants, activeRestaurantId,
  onShowOnMap, onRestaurantSelect, onReset,
}: Props) {
  const [view,            setView]            = useState<View>("list");
  const [selectedDish,    setSelectedDish]    = useState<Dish | null>(null);
  const [dishRestaurants, setDishRestaurants] = useState<Restaurant[]>([]);
  const [galleryIndex,    setGalleryIndex]    = useState(0);

  // Keep active restaurant scrolled into view (optional)
  useEffect(() => {
    if (activeRestaurantId && view === "map") {
      const el = document.getElementById(`rest-item-${activeRestaurantId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeRestaurantId, view]);

  function selectDish(dish: Dish) {
    setSelectedDish(dish);
    setGalleryIndex(0);
    setView("detail");
  }

  function showOnMap(dish: Dish) {
    const filtered = restaurants.filter((r) => r.dishIds.includes(dish.id));
    setDishRestaurants(filtered);
    setView("map");
    onShowOnMap(dish.id, filtered);
  }

  function backToList() {
    setView("list");
    setSelectedDish(null);
    setDishRestaurants([]);
    onReset();
  }

  function backToDetail() {
    setView("detail");
    setDishRestaurants([]);
    onReset();
  }

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: dishes.filter((d) => d.category === cat),
  })).filter((g) => g.items.length > 0);

  // ── VIEW: list — full-screen 3x3 grid ────────────────────────────────────────
  if (view === "list") {
    return (
      <FullscreenShell>
        {/* Header */}
        <div className="flex-shrink-0 px-6 sm:px-10 py-5 border-b border-panel-border flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[#d9724e] text-base">🍽</span>
              <h2 className="text-parchment font-semibold text-lg tracking-wide">タタール料理</h2>
            </div>
            <p className="text-parchment/35 text-xs">料理をクリックすると詳しい説明が表示されます</p>
          </div>
        </div>

        {/* Dish grid */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6">
          {grouped.map(({ category, items }) => (
            <div key={category} className="mb-8 last:mb-0">
              <p className="text-parchment/30 text-[10px] uppercase tracking-widest font-semibold mb-3">
                {category}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {items.map((dish) => {
                  const count = restaurants.filter((r) => r.dishIds.includes(dish.id)).length;
                  return (
                    <button
                      key={dish.id}
                      onClick={() => selectDish(dish)}
                      className="group relative flex flex-col rounded-xl overflow-hidden
                                 border border-panel-border bg-black/20
                                 hover:border-[#d9724e]/50 hover:-translate-y-0.5
                                 transition-all duration-200 text-left shadow-lg shadow-black/20"
                    >
                      {/* Cover image */}
                      <div className="relative w-full aspect-square bg-black/30 overflow-hidden">
                        {dish.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={dish.coverImage}
                            alt={dish.name}
                            className="absolute inset-0 w-full h-full object-cover
                                       group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-4xl">
                            {dish.emoji}
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
                        <span className="absolute top-2 left-2 text-lg drop-shadow">{dish.emoji}</span>
                        <span className="absolute bottom-2 right-2 text-parchment/80 text-[10px] bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
                          {count}店舗
                        </span>
                      </div>
                      {/* Info */}
                      <div className="px-3 py-2.5">
                        <p className="text-parchment/90 text-sm font-medium leading-tight truncate">{dish.name}</p>
                        <p className="text-parchment/40 text-xs mt-0.5 leading-tight line-clamp-2">
                          {dish.shortDescription}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="h-6" />
        </div>
      </FullscreenShell>
    );
  }

  // ── VIEW: detail — hero gallery + description ────────────────────────────────
  if (view === "detail" && selectedDish) {
    const count = restaurants.filter((r) => r.dishIds.includes(selectedDish.id)).length;
    const gallery = selectedDish.gallery && selectedDish.gallery.length > 0
      ? selectedDish.gallery
      : (selectedDish.coverImage ? [selectedDish.coverImage] : []);

    return (
      <FullscreenShell>
        {/* Back button */}
        <div className="flex-shrink-0 flex items-center gap-2 px-6 sm:px-10 py-3 border-b border-panel-border">
          <button
            onClick={backToList}
            className="flex items-center gap-1.5 text-parchment/50 hover:text-parchment
                       transition-colors text-xs rounded px-2 py-1 hover:bg-white/5"
          >
            <BackArrow />
            <span>メニュー</span>
          </button>
          <span className="text-parchment/20 text-xs">·</span>
          <span className="text-[#d9724e]/80 text-xs font-medium">{selectedDish.category}</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 sm:px-10 py-6">

            {/* Image gallery */}
            {gallery.length > 0 && (
              <div className="mb-6">
                <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-black/30 border border-panel-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={gallery[galleryIndex]}
                    alt={`${selectedDish.name} — 写真 ${galleryIndex + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 text-3xl drop-shadow-lg">{selectedDish.emoji}</span>

                  {gallery.length > 1 && (
                    <>
                      <button
                        onClick={() => setGalleryIndex((i) => (i - 1 + gallery.length) % gallery.length)}
                        aria-label="前の写真"
                        className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center
                                   w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-parchment/80
                                   hover:bg-black/60 hover:text-white transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M9 3 L5 7 L9 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => setGalleryIndex((i) => (i + 1) % gallery.length)}
                        aria-label="次の写真"
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center
                                   w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-parchment/80
                                   hover:bg-black/60 hover:text-white transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M5 3 L9 7 L5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                        {gallery.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setGalleryIndex(i)}
                            aria-label={`写真 ${i + 1}`}
                            className={`h-1.5 rounded-full transition-all ${
                              i === galleryIndex ? "w-5 bg-[#d9724e]" : "w-1.5 bg-white/40 hover:bg-white/70"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail strip */}
                {gallery.length > 1 && (
                  <div className="flex gap-2 mt-2.5 overflow-x-auto">
                    {gallery.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setGalleryIndex(i)}
                        className={`relative flex-shrink-0 w-20 h-14 rounded-md overflow-hidden border-2 transition-colors ${
                          i === galleryIndex ? "border-[#d9724e]" : "border-panel-border hover:border-parchment/30"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Title */}
            <div className="mb-5">
              <h2 className="text-parchment font-semibold text-2xl leading-tight">{selectedDish.name}</h2>
              <p className="text-parchment/50 text-sm mt-1">{selectedDish.shortDescription}</p>
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b border-panel-border">
              <p className="text-parchment/80 text-sm leading-relaxed">{selectedDish.description}</p>
            </div>

            {/* Ingredients */}
            <div className="mb-2">
              <p className="text-parchment/35 text-[10px] uppercase tracking-widest mb-3">
                材料
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedDish.ingredients.map((ing) => (
                  <span
                    key={ing}
                    className="rounded-full px-2.5 py-1 text-xs
                               border border-panel-border text-parchment/60 bg-white/5"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Show restaurants button */}
        <div className="flex-shrink-0 px-6 sm:px-10 py-4 border-t border-panel-border">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => showOnMap(selectedDish)}
              className="w-full flex items-center justify-center gap-2.5 rounded-lg px-4 py-3
                         bg-[#b84c3e] text-white text-sm font-semibold
                         hover:bg-[#c9594a] active:scale-[0.98] transition-all
                         shadow-lg shadow-[#b84c3e]/20"
            >
              {/* map pin icon */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                <path d="M8 1.5C5.51 1.5 3.5 3.51 3.5 6C3.5 9.5 8 14.5 8 14.5C8 14.5 12.5 9.5 12.5 6C12.5 3.51 10.49 1.5 8 1.5Z"
                  stroke="currentColor" strokeWidth="1.4" fill="none"/>
                <circle cx="8" cy="6" r="1.8" fill="currentColor"/>
              </svg>
              地図でレストランを見る ({count})
            </button>
          </div>
        </div>
      </FullscreenShell>
    );
  }

  // ── VIEW: map (restaurant list) — bottom sheet / sidebar so map stays visible ─
  if (view === "map" && selectedDish) {
    return (
      <MapPanelShell>
        {/* Header */}
        <div className="flex-shrink-0 border-b border-panel-border">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-panel-border/50">
            <button
              onClick={backToDetail}
              className="flex items-center gap-1.5 text-parchment/50 hover:text-parchment
                         transition-colors text-xs rounded px-2 py-1 hover:bg-white/5"
            >
              <BackArrow />
              <span>{selectedDish.name}</span>
            </button>
          </div>
          <div className="px-5 py-3 flex items-center gap-2.5">
            <span className="text-xl">{selectedDish.emoji}</span>
            <div>
              <p className="text-parchment/80 text-sm font-medium">
                地図に{dishRestaurants.length}件のレストラン
              </p>
              <p className="text-parchment/35 text-xs">ピンまたは店名をクリックしてください</p>
            </div>
          </div>
        </div>

        {/* Restaurant list */}
        <div className="flex-1 overflow-y-auto">
          {dishRestaurants.map((r) => {
            const isActive = r.id === activeRestaurantId;
            return (
              <button
                id={`rest-item-${r.id}`}
                key={r.id}
                onClick={() => onRestaurantSelect(isActive ? null : r)}
                className={[
                  "w-full text-left px-5 py-3.5 border-b border-panel-border/40 transition-colors",
                  isActive
                    ? "bg-[#b84c3e]/15 border-l-2 border-l-[#b84c3e]"
                    : "hover:bg-white/5",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`text-sm font-medium leading-tight ${isActive ? "text-[#d9724e]" : "text-parchment/85"}`}>
                      {r.name}
                    </p>
                    <p className="text-parchment/40 text-xs mt-0.5">{r.address}</p>
                  </div>
                  {/* pin icon */}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                    className={`flex-shrink-0 mt-0.5 ${isActive ? "text-[#d9724e]" : "text-parchment/20"}`}>
                    <path d="M7 1C5.07 1 3.5 2.57 3.5 4.5C3.5 7.25 7 12 7 12C7 12 10.5 7.25 10.5 4.5C10.5 2.57 8.93 1 7 1Z"
                      stroke="currentColor" strokeWidth="1.2" fill={isActive ? "currentColor" : "none"} opacity={isActive ? 0.3 : 1}/>
                    <circle cx="7" cy="4.5" r="1.3" fill="currentColor"/>
                  </svg>
                </div>
              </button>
            );
          })}
          <div className="h-4" />
        </div>
      </MapPanelShell>
    );
  }

  return null;
}

// ── Full-screen overlay window (list + detail views) ─────────────────────────
function FullscreenShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={[
        "pointer-events-auto",
        "absolute inset-0 z-[1000]",
        "flex flex-col",
        "bg-panel-bg",
        "overflow-hidden",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

// ── Bottom sheet on mobile / right sidebar on desktop (map view) ──────────────
function MapPanelShell({ children }: { children: React.ReactNode }) {
  return (
    <aside
      className={[
        "pointer-events-auto",
        // mobile: bottom sheet
        "absolute bottom-0 left-0 right-0 z-[1000]",
        "h-[260px]",
        "border-t border-panel-border",
        // desktop: full right sidebar
        "sm:bottom-0 sm:right-0 sm:left-auto sm:top-0",
        "sm:h-auto sm:w-[360px]",
        "sm:border-t-0 sm:border-l",
        "flex flex-col",
        "bg-panel-bg",
        "overflow-hidden shadow-2xl",
      ].join(" ")}
    >
      {children}
    </aside>
  );
}
