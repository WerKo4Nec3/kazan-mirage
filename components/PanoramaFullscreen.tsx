"use client";

/**
 * PanoramaFullscreen
 *
 * Covers the entire viewport. Shows a 360° panorama for the selected
 * place + era, with overlaid UI for navigation and era switching.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────┐
 *   │  [← Back]   Place Name · Short desc   [ⓘ Info]      │  ← top bar
 *   │                                                      │
 *   │                360° panorama                         │  ← fills viewport
 *   │                                                      │
 *   │  [Info panel — slides from right when open]          │
 *   │                                                      │
 *   ├──────────────────────────────────────────────────────┤
 *   │  Khanate  │  Russian Empire  │  Soviet  │  Modern    │  ← era switcher bar
 *   └──────────────────────────────────────────────────────┘
 */

import { useEffect, useState, useCallback } from "react";
import type { Era, Place } from "@/types";
import PanoramaViewer from "./PanoramaViewer";

interface Props {
  place: Place;
  eras: Era[];
  selectedEraId: string;
  onEraChange: (id: string) => void;
  onClose: () => void;
}

export default function PanoramaFullscreen({
  place,
  eras,
  selectedEraId,
  onEraChange,
  onClose,
}: Props) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const era     = eras.find((e) => e.id === selectedEraId)!;
  const eraData = place.eras[selectedEraId];

  // Entrance animation
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // Close on Escape
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (infoOpen) setInfoOpen(false);
        else onClose();
      }
    },
    [infoOpen, onClose]
  );
  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return (
    <div
      className="fixed inset-0 z-[9000] flex flex-col bg-black"
      style={{
        opacity: mounted ? 1 : 0,
        transition: "opacity 300ms ease",
      }}
    >
      {/* ══════════════════════════════════════════════════
          TOP BAR — back button · title · info toggle
      ══════════════════════════════════════════════════ */}
      <div className="relative flex-shrink-0 flex items-center justify-between px-4 py-3 z-10
                      bg-gradient-to-b from-black/80 to-transparent pointer-events-none
                      absolute top-0 left-0 right-0">
        {/* Back button */}
        <button
          onClick={onClose}
          className="pointer-events-auto flex items-center gap-2 rounded border border-white/20
                     bg-black/60 px-3 py-1.5 text-sm text-parchment/80 backdrop-blur-sm
                     transition hover:bg-black/80 hover:text-parchment hover:border-white/40"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M 10,7 L 4,7 M 4,7 L 7,4 M 4,7 L 7,10"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Back to map</span>
        </button>

        {/* Place + era title */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <h1 className="text-parchment font-semibold text-lg leading-none drop-shadow-lg tracking-wide">
            {place.name}
          </h1>
          <p className="mt-1 text-parchment/55 text-xs tracking-wide">
            {era.label} · {era.years}
          </p>
        </div>

        {/* Info toggle */}
        <button
          onClick={() => setInfoOpen((v) => !v)}
          className={[
            "pointer-events-auto flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm",
            "backdrop-blur-sm transition",
            infoOpen
              ? "bg-gold/20 border-gold/60 text-gold"
              : "bg-black/60 border-white/20 text-parchment/70 hover:bg-black/80 hover:text-parchment",
          ].join(" ")}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M 7,6 L 7,10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <circle cx="7" cy="4" r="0.8" fill="currentColor"/>
          </svg>
          <span>{infoOpen ? "Hide" : "Info"}</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════
          PANORAMA — fills remaining space
      ══════════════════════════════════════════════════ */}
      <div className="flex-1 relative overflow-hidden">
        {eraData ? (
          <PanoramaViewer
            imageUrl={eraData.panoramaImage}
            placeName={place.name}
            eraLabel={era.label}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <div className="w-32 h-32 rounded-full border border-parchment/10 flex items-center justify-center">
              <span className="text-parchment/20 text-5xl">◎</span>
            </div>
            <p className="text-parchment/30 text-sm">No panorama for this era</p>
          </div>
        )}

        {/* Era badge — bottom-left corner of panorama */}
        <div className="absolute bottom-4 left-4 pointer-events-none flex items-center gap-2">
          <span className="rounded bg-black/60 px-2.5 py-1 text-xs text-gold border border-gold/30
                          backdrop-blur-sm tracking-wider">
            {era.label}
          </span>
          <span className="rounded bg-black/50 px-2 py-1 text-xs text-parchment/50
                          border border-white/10 backdrop-blur-sm">
            360°
          </span>
        </div>

        {/* ── INFO PANEL — slides in from right ── */}
        <div
          className="absolute top-0 right-0 bottom-0 w-80 flex flex-col
                     bg-panel-bg/96 border-l border-panel-border overflow-y-auto"
          style={{
            transform: infoOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 280ms ease",
          }}
        >
          {/* Panel header */}
          <div className="px-5 pt-12 pb-4 border-b border-panel-border">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
              <h2 className="text-gold text-sm font-semibold">{era.label}</h2>
            </div>
            <p className="text-parchment/40 text-xs">{era.years}</p>
            <h3 className="text-parchment text-base font-medium mt-3">{place.name}</h3>
            <p className="text-parchment/50 text-xs mt-0.5">{place.shortDescription}</p>
          </div>

          {/* Era description */}
          <div className="px-5 py-4 flex-1">
            {eraData ? (
              <p className="text-parchment/80 text-sm leading-relaxed">
                {eraData.description}
              </p>
            ) : (
              <p className="text-parchment/30 text-sm italic">
                No historical record for this location in this era.
              </p>
            )}

            {/* General era context */}
            <div className="mt-5 pt-4 border-t border-panel-border">
              <p className="text-parchment/40 text-[10px] uppercase tracking-widest mb-2">
                About this era
              </p>
              <p className="text-parchment/50 text-xs leading-relaxed">{era.description}</p>
            </div>
          </div>

          {/* Era picker inside panel */}
          <div className="px-5 pb-5 border-t border-panel-border pt-4">
            <p className="text-parchment/30 text-[10px] uppercase tracking-widest mb-2">
              Switch era
            </p>
            <div className="flex flex-col gap-1.5">
              {eras.map((e) => {
                const active   = e.id === selectedEraId;
                const hasData  = !!place.eras[e.id];
                return (
                  <button
                    key={e.id}
                    onClick={() => hasData && onEraChange(e.id)}
                    disabled={!hasData}
                    className={[
                      "flex items-center gap-2 rounded px-3 py-2 text-left text-xs",
                      "border transition-all",
                      active
                        ? "bg-gold/15 border-gold/50 text-gold"
                        : hasData
                        ? "border-panel-border text-parchment/55 hover:border-gold/30 hover:text-parchment"
                        : "border-panel-border text-parchment/20 cursor-not-allowed",
                    ].join(" ")}
                  >
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />}
                    <span className="font-medium">{e.label}</span>
                    <span className="ml-auto text-[10px] opacity-60">{e.years}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          BOTTOM ERA SWITCHER BAR
      ══════════════════════════════════════════════════ */}
      <div
        className="flex-shrink-0 flex items-stretch gap-0
                   bg-panel-bg border-t border-panel-border"
        style={{ minHeight: "3.5rem" }}
      >
        {/* App watermark */}
        <div className="hidden sm:flex items-center px-4 border-r border-panel-border">
          <span className="text-gold/60 text-xs tracking-widest font-semibold uppercase whitespace-nowrap">
            ✦ Kazan Mirage
          </span>
        </div>

        {/* Era buttons */}
        <div className="flex flex-1 items-stretch">
          {eras.map((e) => {
            const active  = e.id === selectedEraId;
            const hasData = !!place.eras[e.id];
            return (
              <button
                key={e.id}
                onClick={() => hasData && onEraChange(e.id)}
                disabled={!hasData}
                className={[
                  "flex-1 flex flex-col items-center justify-center px-2 py-2",
                  "border-r border-panel-border last:border-r-0",
                  "text-xs transition-all duration-150",
                  active
                    ? "bg-gold/15 text-gold border-b-2 border-b-gold"
                    : hasData
                    ? "text-parchment/55 hover:bg-white/5 hover:text-parchment"
                    : "text-parchment/20 cursor-not-allowed",
                ].join(" ")}
              >
                <span className="font-medium leading-tight">{e.label}</span>
                <span className="text-[10px] opacity-60 mt-0.5">{e.years}</span>
              </button>
            );
          })}
        </div>

        {/* Description preview — brief text (hidden on small screens) */}
        {eraData && (
          <div className="hidden xl:flex items-center px-4 border-l border-panel-border max-w-xs">
            <p className="text-parchment/35 text-xs leading-snug line-clamp-2">
              {eraData.description.slice(0, 110)}…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
