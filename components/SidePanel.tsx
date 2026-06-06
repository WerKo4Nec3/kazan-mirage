"use client";

import { useEffect, useRef } from "react";
import type { Era, Place } from "@/types";

interface Props {
  place: Place;
  era: Era;
  selectedEraId: string;
  onClose: () => void;
  onViewPanorama: () => void;
}

export default function SidePanel({
  place,
  era,
  selectedEraId,
  onClose,
  onViewPanorama,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const eraData = place.eras[selectedEraId];

  // Slide-in animation
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    el.style.transform = "translateX(100%)";
    requestAnimationFrame(() => {
      el.style.transition = "transform 280ms cubic-bezier(0.16, 1, 0.3, 1)";
      el.style.transform = "translateX(0)";
    });
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const hasPanorama = !!eraData?.panoramaImage;

  return (
    <>
      {/* Dimmed backdrop on mobile */}
      <div
        className="absolute inset-0 z-[900] bg-black/40 md:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        className={[
          "absolute right-0 top-0 bottom-0 z-[1000]",
          "w-full sm:w-[400px]",
          "flex flex-col",
          "bg-panel-bg border-l border-panel-border",
          "overflow-hidden shadow-2xl",
        ].join(" ")}
        style={{ transform: "translateX(100%)" }}
      >
        {/* ── Cover image ── */}
        {place.coverImage && (
          <div className="relative h-44 flex-shrink-0 overflow-hidden bg-panel-bg/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={place.coverImage}
              alt={place.name}
              className="w-full h-full object-cover opacity-90"
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                el.style.display = 'none';
                const parent = el.closest('.relative') as HTMLElement | null;
                if (parent) parent.style.display = 'none';
              }}
            />
            {/* gradient overlay + close button */}
            <div className="absolute inset-0 bg-gradient-to-t from-panel-bg via-transparent to-transparent" />
            <button
              onClick={onClose}
              aria-label="Закрыть"
              className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-full
                         bg-black/50 text-parchment/70 hover:text-parchment hover:bg-black/80
                         transition-colors text-sm backdrop-blur-sm"
            >
              ✕
            </button>
            {/* Place name over image */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-3">
              <h2 className="text-parchment font-semibold text-xl leading-tight drop-shadow-lg">
                {place.name}
              </h2>
              <p className="text-parchment/60 text-xs mt-0.5 drop-shadow">
                {place.shortDescription}
              </p>
            </div>
          </div>
        )}

        {/* ── Header (when no cover image) ── */}
        {!place.coverImage && (
          <div className="px-5 pt-5 pb-4 border-b border-panel-border flex items-start justify-between gap-3 flex-shrink-0">
            <div className="min-w-0">
              <h2 className="text-parchment font-semibold text-xl leading-tight truncate">
                {place.name}
              </h2>
              <p className="text-parchment/45 text-xs mt-1 leading-relaxed">
                {place.shortDescription}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Закрыть"
              className="flex-shrink-0 mt-0.5 w-7 h-7 flex items-center justify-center rounded-full
                         text-parchment/40 hover:text-parchment hover:bg-white/10 transition-colors text-lg"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Description ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {eraData ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block w-2 h-2 rounded-full bg-gold flex-shrink-0" />
                <h3 className="text-gold text-sm font-semibold">{era.label}</h3>
                <span className="text-parchment/30 text-xs">{era.years}</span>
              </div>
              <p className="text-parchment/80 text-sm leading-relaxed">
                {eraData.description}
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
              <div className="w-12 h-12 rounded-full border border-parchment/10 flex items-center justify-center">
                <span className="text-parchment/20 text-2xl">◎</span>
              </div>
              <p className="text-parchment/30 text-sm text-center">
                Нет сведений о&nbsp;данном месте в&nbsp;эту эпоху
              </p>
            </div>
          )}

          {/* Era context */}
          {eraData && (
            <div className="mt-5 pt-4 border-t border-panel-border">
              <p className="text-parchment/35 text-[10px] uppercase tracking-widest mb-2">
                О&nbsp;периоде
              </p>
              <p className="text-parchment/45 text-xs leading-relaxed">
                {era.description}
              </p>
            </div>
          )}
        </div>

        {/* ── Panorama button ── */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-panel-border">
          <button
            onClick={onViewPanorama}
            disabled={!hasPanorama}
            className={[
              "w-full flex items-center justify-center gap-2.5 rounded-lg px-4 py-3",
              "text-sm font-semibold transition-all duration-150",
              hasPanorama
                ? "bg-gold text-ink hover:bg-gold/90 active:scale-[0.98] shadow-lg shadow-gold/20"
                : "bg-panel-border/30 text-parchment/25 cursor-not-allowed",
            ].join(" ")}
          >
            {/* 360° icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="flex-shrink-0">
              <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.3"/>
              <ellipse cx="9" cy="9" rx="3.5" ry="7.5" stroke="currentColor" strokeWidth="1.3"/>
              <line x1="1.5" y1="9" x2="16.5" y2="9" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
            {hasPanorama ? "Смотреть 360° панораму" : "Панорама недоступна"}
          </button>
        </div>
      </aside>
    </>
  );
}
