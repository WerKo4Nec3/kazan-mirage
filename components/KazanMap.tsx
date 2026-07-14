"use client";

import { useRef, useState, useEffect } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Place, Restaurant } from "@/types";

// Free vector tiles — no API key needed
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

const BOUNDS: [[number, number], [number, number]] = [
  [49.050, 55.762], // SW [lng, lat]
  [49.175, 55.828], // NE [lng, lat]
];

interface Props {
  places: Place[];
  selectedPlace: Place | null;
  selectedEraId: string;
  onMarkerClick: (place: Place) => void;
  restaurants?: Restaurant[];
  selectedRestaurant?: Restaurant | null;
  onRestaurantClick?: (r: Restaurant) => void;
  flyTo?: [number, number] | null;
}

// ── Place SVG icons ───────────────────────────────────────────────────────────
const ICONS: Record<string, string> = {
  kremlin: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="10" width="16" height="7" rx="0.5" fill="currentColor"/>
    <rect x="2"  y="6" width="3" height="4" rx="0.5" fill="currentColor"/>
    <rect x="6"  y="6" width="3" height="4" rx="0.5" fill="currentColor"/>
    <rect x="10" y="6" width="3" height="4" rx="0.5" fill="currentColor"/>
    <rect x="14" y="6" width="3" height="4" rx="0.5" fill="currentColor"/>
    <rect x="8" y="12" width="4" height="5" rx="0.5" fill="currentColor" opacity="0.6"/>
  </svg>`,
  bauman: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="4" r="2" fill="currentColor"/>
    <line x1="10" y1="6" x2="10" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="10" y1="9" x2="7"  y2="12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="10" y1="9" x2="13" y2="11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="10" y1="13" x2="7.5" y2="17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="10" y1="13" x2="12.5" y2="17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,
  palace_agriculture: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="16" width="18" height="2" rx="0.5" fill="currentColor"/>
    <rect x="2" y="7"  width="2" height="9"  rx="0.5" fill="currentColor"/>
    <rect x="6" y="7"  width="2" height="9"  rx="0.5" fill="currentColor"/>
    <rect x="12" y="7" width="2" height="9"  rx="0.5" fill="currentColor"/>
    <rect x="16" y="7" width="2" height="9"  rx="0.5" fill="currentColor"/>
    <rect x="1" y="5"  width="18" height="2" rx="0.5" fill="currentColor"/>
    <line x1="10" y1="2" x2="10" y2="5"  stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="10" y1="3" x2="7"  y2="1"  stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="10" y1="3" x2="13" y2="1"  stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`,
  chasha: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7 Q3 15 10 15 Q17 15 17 7 Z" fill="currentColor"/>
    <rect x="7" y="15" width="6" height="2" rx="0.5" fill="currentColor"/>
    <rect x="6" y="17" width="8" height="1.5" rx="0.5" fill="currentColor"/>
    <line x1="5"  y1="7" x2="3"  y2="4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="15" y1="7" x2="17" y2="4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  </svg>`,
  lake_kaban: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 7 Q5 4 8 7 Q11 10 14 7 Q17 4 19 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <path d="M2 11 Q5 8 8 11 Q11 14 14 11 Q17 8 19 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <path d="M2 15 Q5 12 8 15 Q11 18 14 15 Q17 12 19 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  </svg>`,
};

const FALLBACK_ICON = `<svg viewBox="0 0 20 20" fill="none">
  <circle cx="10" cy="8" r="5" fill="currentColor"/>
  <line x1="10" y1="13" x2="10" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`;

// ── Restaurant SVG icons ──────────────────────────────────────────────────────
const RESTAURANT_ICONS: Record<string, string> = {
  chak_chak_house: `<svg viewBox="0 0 20 20" fill="none">
    <path d="M10 2 L12.5 6.5 L17.5 6.5 L14 10.5 L15.5 15.5 L10 12.5 L4.5 15.5 L6 10.5 L2.5 6.5 L7.5 6.5 Z" fill="currentColor"/>
  </svg>`,
  belesh: `<svg viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="7.5" fill="currentColor"/>
    <circle cx="10" cy="10" r="4.5" fill="currentColor" opacity="0.4"/>
    <circle cx="10" cy="10" r="1.5" fill="currentColor" opacity="0.8"/>
  </svg>`,
  echpochmak: `<svg viewBox="0 0 20 20" fill="none">
    <path d="M10 2.5 L18 16.5 L2 16.5 Z" fill="currentColor"/>
    <path d="M10 6.5 L15 14.5 L5 14.5 Z" fill="currentColor" opacity="0.4"/>
  </svg>`,
  kazan_ash: `<svg viewBox="0 0 20 20" fill="none">
    <path d="M3 9 Q3 16 10 16 Q17 16 17 9 Z" fill="currentColor"/>
    <rect x="2" y="16" width="16" height="2" rx="1" fill="currentColor"/>
    <path d="M7 6 Q7.5 4 7 2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/>
    <path d="M10 6.5 Q10.5 4.5 10 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/>
    <path d="M13 6 Q13.5 4 13 2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/>
  </svg>`,
  ak_yort: `<svg viewBox="0 0 20 20" fill="none">
    <path d="M10 2 L18 8 L18 18 L2 18 L2 8 Z" fill="currentColor"/>
    <path d="M10 2 L18 8 L2 8 Z" fill="currentColor" opacity="0.6"/>
    <rect x="7.5" y="12" width="5" height="6" rx="0.5" fill="currentColor" opacity="0.4"/>
    <rect x="4" y="10" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.4"/>
    <rect x="12" y="10" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.4"/>
  </svg>`,
  tutyrghan: `<svg viewBox="0 0 20 20" fill="none">
    <ellipse cx="10" cy="12" rx="6" ry="5" fill="currentColor"/>
    <circle cx="14" cy="6" r="3" fill="currentColor"/>
    <path d="M14 3 L16 1 L15 3" fill="currentColor" opacity="0.7"/>
    <path d="M6 15 L4 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M8 16 L7 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
};
const FOOD_FALLBACK = RESTAURANT_ICONS["kazan_ash"];

// ── Main component ────────────────────────────────────────────────────────────
export default function KazanMap({
  places, selectedPlace, selectedEraId, onMarkerClick,
  restaurants, selectedRestaurant, onRestaurantClick,
  flyTo,
}: Props) {
  void selectedEraId;

  const mapRef = useRef<MapRef>(null);
  const [hoveredPlaceId, setHoveredPlaceId]   = useState<string | null>(null);
  const [hoveredRestId,  setHoveredRestId]    = useState<string | null>(null);

  // Fly to centroid of filtered restaurants
  useEffect(() => {
    if (!flyTo) return;
    mapRef.current?.flyTo({ center: [flyTo[1], flyTo[0]], zoom: 14, duration: 800 });
  }, [flyTo]);

  // Pan to selected place
  useEffect(() => {
    if (!selectedPlace) return;
    mapRef.current?.flyTo({
      center: [selectedPlace.lng, selectedPlace.lat],
      zoom: Math.max(mapRef.current?.getZoom() ?? 13, 14),
      duration: 500,
    });
  }, [selectedPlace]);

  // Pan to selected restaurant
  useEffect(() => {
    if (!selectedRestaurant) return;
    mapRef.current?.flyTo({
      center: [selectedRestaurant.lng, selectedRestaurant.lat],
      zoom: Math.max(mapRef.current?.getZoom() ?? 13, 14),
      duration: 400,
    });
  }, [selectedRestaurant]);

  const hoveredPlace = hoveredPlaceId ? places.find(p => p.id === hoveredPlaceId) : null;
  const hoveredRest  = hoveredRestId  ? restaurants?.find(r => r.id === hoveredRestId) : null;

  return (
    <Map
      ref={mapRef}
      initialViewState={{ longitude: 49.113, latitude: 55.794, zoom: 13 }}
      style={{ width: "100%", height: "100%" }}
      mapStyle={MAP_STYLE}
      minZoom={4}
      maxZoom={18}
      maxBounds={BOUNDS}
    >
      <NavigationControl position="bottom-right" />

      {/* ── Historical place markers ─────────────────────────────── */}
      {places.map((place) => {
        const active = selectedPlace?.id === place.id;
        return (
          <Marker
            key={place.id}
            longitude={place.lng}
            latitude={place.lat}
            anchor="bottom"
            style={{ zIndex: active ? 10 : 1 }}
          >
            <div
              className={`kz-pin${active ? " kz-pin--active" : ""}`}
              onClick={() => onMarkerClick(place)}
              onMouseEnter={() => setHoveredPlaceId(place.id)}
              onMouseLeave={() => setHoveredPlaceId(null)}
            >
              <span
                className="kz-pin__icon"
                dangerouslySetInnerHTML={{ __html: ICONS[place.id] ?? FALLBACK_ICON }}
              />
            </div>
          </Marker>
        );
      })}

      {/* ── Place tooltip ────────────────────────────────────────── */}
      {hoveredPlace && (
        <Popup
          longitude={hoveredPlace.lng}
          latitude={hoveredPlace.lat}
          anchor="bottom"
          offset={52}
          closeButton={false}
          closeOnClick={false}
          className="kz-maplibre-popup"
        >
          <div className="kz-tooltip">
            <strong>{hoveredPlace.name}</strong>
            <span>{hoveredPlace.shortDescription}</span>
          </div>
        </Popup>
      )}

      {/* ── Restaurant markers ───────────────────────────────────── */}
      {restaurants?.map((r) => {
        const active = selectedRestaurant?.id === r.id;
        return (
          <Marker
            key={r.id}
            longitude={r.lng}
            latitude={r.lat}
            anchor="center"
            style={{ zIndex: active ? 10 : 1 }}
          >
            <div
              className={`kz-food-pin${active ? " kz-food-pin--active" : ""}`}
              onClick={() => onRestaurantClick?.(r)}
              onMouseEnter={() => setHoveredRestId(r.id)}
              onMouseLeave={() => setHoveredRestId(null)}
            >
              <span
                className="kz-food-pin__icon"
                dangerouslySetInnerHTML={{ __html: RESTAURANT_ICONS[r.id] ?? FOOD_FALLBACK }}
              />
            </div>
          </Marker>
        );
      })}

      {/* ── Restaurant tooltip ───────────────────────────────────── */}
      {hoveredRest && (
        <Popup
          longitude={hoveredRest.lng}
          latitude={hoveredRest.lat}
          anchor="bottom"
          offset={22}
          closeButton={false}
          closeOnClick={false}
          className="kz-maplibre-popup"
        >
          <div className="kz-tooltip">
            <strong>{hoveredRest.name}</strong>
            <span>{hoveredRest.address}</span>
          </div>
        </Popup>
      )}
    </Map>
  );
}
