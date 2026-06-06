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
        <p className="text-parchment/30 text-xs italic pointer-events-none">
          Нажмите на метку, чтобы узнать историю места
        </p>
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
              selectedEraId={selectedEraId}
              onClose={() => setSelectedPlace(null)}
              onViewPanorama={() => setPanoramaOpen(true)}
            />
          </div>
        </div>
      )}
    </main>
  );
}
