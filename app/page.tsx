"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import placesData from "@/data/places.json";
import erasData   from "@/data/eras.json";
import type { Place, Era } from "@/types";
import SidePanel        from "@/components/SidePanel";
import PanoramaFullscreen from "@/components/PanoramaFullscreen";

// Leaflet needs browser APIs — disable SSR
const KazanMap = dynamic(() => import("@/components/KazanMap"), { ssr: false });

const places = placesData as Place[];
const eras   = erasData   as Era[];

export default function Home() {
  const [selectedPlace,  setSelectedPlace]  = useState<Place | null>(null);
  const [panoramaOpen,   setPanoramaOpen]   = useState(false);
  const [selectedEraId,  setSelectedEraId]  = useState<string>(eras[3].id); // "modern"

  const era = eras.find((e) => e.id === selectedEraId) ?? eras[3];

  // ── Fullscreen panorama ────────────────────────────────────────────────────
  if (panoramaOpen && selectedPlace) {
    return (
      <PanoramaFullscreen
        place={selectedPlace}
        eras={eras}
        selectedEraId={selectedEraId}
        onEraChange={setSelectedEraId}
        onClose={() => setPanoramaOpen(false)}
      />
    );
  }

  // ── Map (+ optional side panel) ───────────────────────────────────────────
  return (
    <main className="h-screen w-screen overflow-hidden relative bg-[#e8e0d0]">

      {/* ════════════════════════════════════════
          Header
      ════════════════════════════════════════ */}
      <header className="absolute top-0 left-0 right-0 z-[2000]
                         flex items-center justify-between px-4 py-2.5
                         bg-panel-bg/95 border-b border-panel-border backdrop-blur-sm">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <span className="text-gold font-semibold tracking-widest text-sm uppercase">
            ✦ Kazan Mirage
          </span>
          <span className="hidden md:inline text-parchment/30 text-xs">
            Интерактивный исторический атлас
          </span>
        </div>

        {/* Hint */}
        <p className="hidden sm:block text-parchment/30 text-xs italic absolute left-1/2 -translate-x-1/2 pointer-events-none">
          Нажмите на метку, чтобы перенестись во времени
        </p>

        {/* Era selector */}
        <div className="flex items-center gap-2">
          <span className="text-parchment/35 text-xs hidden md:inline">Эпоха:</span>
          <nav className="flex gap-1 rounded border border-panel-border bg-panel-bg/90 p-0.5">
            {eras.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelectedEraId(e.id)}
                title={e.years}
                className={[
                  "rounded px-2.5 py-1 text-xs font-medium transition-all duration-150",
                  selectedEraId === e.id
                    ? "bg-gold text-ink shadow"
                    : "text-parchment/55 hover:text-parchment hover:bg-white/5",
                ].join(" ")}
              >
                <span className="hidden sm:inline">{e.label}</span>
                <span className="sm:hidden">{e.years.split("–")[0]}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ════════════════════════════════════════
          Map (fills everything below header)
      ════════════════════════════════════════ */}
      <div className="absolute inset-0 top-10">
        <KazanMap
          places={places}
          selectedPlace={selectedPlace}
          selectedEraId={selectedEraId}
          onMarkerClick={(place) => {
            setSelectedPlace(place);
            setPanoramaOpen(false);
          }}
        />
      </div>

      {/* ════════════════════════════════════════
          Side panel (slides in when a place is selected)
      ════════════════════════════════════════ */}
      {selectedPlace && (
        <div className="absolute inset-0 top-10 z-[1000] pointer-events-none">
          <div className="relative h-full w-full pointer-events-auto">
            <SidePanel
              place={selectedPlace}
              era={era}
              eras={eras}
              selectedEraId={selectedEraId}
              onEraChange={setSelectedEraId}
              onClose={() => setSelectedPlace(null)}
              onViewPanorama={() => setPanoramaOpen(true)}
            />
          </div>
        </div>
      )}
    </main>
  );
}
