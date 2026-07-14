"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import placesData      from "@/data/places.json";
import erasData        from "@/data/eras.json";
import restaurantsData from "@/data/restaurants.json";
import dishesData      from "@/data/dishes.json";
import type { Place, Era, Restaurant, Dish } from "@/types";
import SidePanel          from "@/components/SidePanel";
import MenuPanel          from "@/components/MenuPanel";
import PanoramaFullscreen from "@/components/PanoramaFullscreen";

const KazanMap = dynamic(() => import("@/components/KazanMap"), { ssr: false });

const places      = placesData      as Place[];
const eras        = erasData        as Era[];
const restaurants = restaurantsData as Restaurant[];
const dishes      = dishesData      as Dish[];

type MapMode = "atlas" | "restaurants";

export default function Home() {
  const [mapMode,            setMapMode]            = useState<MapMode>("atlas");
  const [selectedPlace,      setSelectedPlace]      = useState<Place | null>(null);
  const [panoramaOpen,       setPanoramaOpen]       = useState(false);
  const [selectedEraId,      setSelectedEraId]      = useState<string>(eras[3].id);
  // Restaurant mode state
  const [shownRestaurants,   setShownRestaurants]   = useState<Restaurant[]>([]);
  const [activeRestaurant,   setActiveRestaurant]   = useState<Restaurant | null>(null);
  // A "fly-to" target so KazanMap can pan to the centroid of filtered restaurants
  const [flyTo,              setFlyTo]              = useState<[number,number] | null>(null);

  const era = eras.find((e) => e.id === selectedEraId) ?? eras[3];

  function switchMode(mode: MapMode) {
    setMapMode(mode);
    setSelectedPlace(null);
    setPanoramaOpen(false);
    setShownRestaurants([]);
    setActiveRestaurant(null);
  }

  // Panorama fullscreen
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

  return (
    <main className="h-screen w-screen overflow-hidden relative bg-[#e8e0d0]">

      {/* ══ Header ══ */}
      <header className="absolute top-0 left-0 right-0 z-[2000]
                         flex items-center justify-between px-4 py-2
                         bg-panel-bg/95 border-b border-panel-border backdrop-blur-sm">

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span className="text-gold font-semibold tracking-widest text-sm uppercase">
            ✦ Kazan Mirage
          </span>
          <span className="hidden md:inline text-parchment/30 text-xs">
            インタラクティブ歴史アトラス
          </span>
        </div>

        {/* Mode switcher */}
        <div className="flex items-center rounded-lg border border-panel-border bg-black/20 p-0.5 gap-0.5">
          <button
            onClick={() => switchMode("atlas")}
            className={[
              "flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-all duration-150",
              mapMode === "atlas"
                ? "bg-gold text-ink shadow-sm"
                : "text-parchment/50 hover:text-parchment",
            ].join(" ")}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1 12 L6.5 1 L12 12 Z" stroke="currentColor" strokeWidth="1.2"
                fill={mapMode === "atlas" ? "currentColor" : "none"} opacity={mapMode === "atlas" ? "0.2" : "1"}
                strokeLinejoin="round"/>
              <rect x="4.5" y="8" width="4" height="4" rx="0.4" fill="currentColor" opacity="0.8"/>
            </svg>
            アトラス
          </button>
          <button
            onClick={() => switchMode("restaurants")}
            className={[
              "flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-all duration-150",
              mapMode === "restaurants"
                ? "bg-[#b84c3e] text-white shadow-sm"
                : "text-parchment/50 hover:text-parchment",
            ].join(" ")}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <line x1="4"   y1="1.5" x2="4"   y2="5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <line x1="6.5" y1="1.5" x2="6.5" y2="5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M2.5 5.5 Q2.5 7.5 5.25 7.5 L5.25 11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <line x1="9.5" y1="1.5" x2="9.5" y2="11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M8 1.5 Q8 4 9.5 4 Q11 4 11 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
            </svg>
            レストラン
          </button>
        </div>

        <p className="hidden sm:block text-parchment/25 text-xs italic pointer-events-none flex-shrink-0">
          {mapMode === "atlas"
            ? "ピンをクリックして、その場所の歴史を見る"
            : "メニューから料理を選んでください →"}
        </p>
      </header>

      {/* ══ Map ══ */}
      <div className="absolute inset-0 top-10">
        <KazanMap
          places={mapMode === "atlas" ? places : []}
          selectedPlace={selectedPlace}
          selectedEraId={selectedEraId}
          onMarkerClick={(place) => { setSelectedPlace(place); setPanoramaOpen(false); }}
          restaurants={shownRestaurants}
          selectedRestaurant={activeRestaurant}
          flyTo={flyTo}
          onRestaurantClick={(r) =>
            setActiveRestaurant((prev) => (prev?.id === r.id ? null : r))
          }
        />
      </div>

      {/* ══ Atlas side panel ══ */}
      {mapMode === "atlas" && selectedPlace && (
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

      {/* ══ Menu panel (always visible in restaurant mode) ══ */}
      {mapMode === "restaurants" && (
        <div className="absolute inset-0 top-10 z-[1000] pointer-events-none">
          <div className="relative h-full w-full">
            <MenuPanel
              dishes={dishes}
              restaurants={restaurants}
              activeRestaurantId={activeRestaurant?.id ?? null}
              onShowOnMap={(_, filtered) => {
                setShownRestaurants(filtered);
                setActiveRestaurant(null);
                if (filtered.length > 0) {
                  const avgLat = filtered.reduce((s, r) => s + r.lat, 0) / filtered.length;
                  const avgLng = filtered.reduce((s, r) => s + r.lng, 0) / filtered.length;
                  setFlyTo([avgLat, avgLng]);
                }
              }}
              onRestaurantSelect={(r) => setActiveRestaurant(r)}
              onReset={() => {
                setShownRestaurants([]);
                setActiveRestaurant(null);
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
