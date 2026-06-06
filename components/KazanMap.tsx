"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { Place } from "@/types";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
  places: Place[];
  selectedPlace: Place | null;
  selectedEraId: string;
  onMarkerClick: (place: Place) => void;
}

// ── SVG icon paths per place ID ───────────────────────────────────────────────
const ICONS: Record<string, string> = {
  // Kremlin — fortress battlements
  kremlin: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="10" width="16" height="7" rx="0.5" fill="currentColor"/>
    <rect x="2"  y="6" width="3" height="4" rx="0.5" fill="currentColor"/>
    <rect x="6"  y="6" width="3" height="4" rx="0.5" fill="currentColor"/>
    <rect x="10" y="6" width="3" height="4" rx="0.5" fill="currentColor"/>
    <rect x="14" y="6" width="3" height="4" rx="0.5" fill="currentColor"/>
    <rect x="8" y="12" width="4" height="5" rx="0.5" fill="currentColor" opacity="0.6"/>
  </svg>`,

  // Suyumbike Tower — tall tapering tower with spire
  suyumbike: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="10,2 10,2 10,2" fill="currentColor"/>
    <line x1="10" y1="2" x2="10" y2="5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <rect x="8"   y="5"  width="4" height="3" rx="0.4" fill="currentColor"/>
    <rect x="7.5" y="8"  width="5" height="2.5" rx="0.4" fill="currentColor"/>
    <rect x="7"   y="10.5" width="6" height="2" rx="0.4" fill="currentColor"/>
    <rect x="6.5" y="12.5" width="7" height="5" rx="0.4" fill="currentColor"/>
    <rect x="8.5" y="14" width="3" height="4" rx="0.3" fill="currentColor" opacity="0.5"/>
  </svg>`,

  // Bauman Street — pedestrian walking figure
  bauman: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="4" r="2" fill="currentColor"/>
    <line x1="10" y1="6" x2="10" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="10" y1="9" x2="7"  y2="12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="10" y1="9" x2="13" y2="11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="10" y1="13" x2="7.5" y2="17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="10" y1="13" x2="12.5" y2="17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,

  // Palace of Agriculture — columns + tree/branches
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
    <line x1="10" y1="4" x2="7"  y2="3.5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
    <line x1="10" y1="4" x2="13" y2="3.5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
  </svg>`,

  // Chasha — bowl / cauldron shape
  chasha: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7 Q3 15 10 15 Q17 15 17 7 Z" fill="currentColor"/>
    <rect x="7" y="15" width="6" height="2" rx="0.5" fill="currentColor"/>
    <rect x="6" y="17" width="8" height="1.5" rx="0.5" fill="currentColor"/>
    <line x1="5"  y1="7" x2="3"  y2="4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="15" y1="7" x2="17" y2="4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  </svg>`,

  // Lake Kaban — water waves
  lake_kaban: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 7 Q5 4 8 7 Q11 10 14 7 Q17 4 19 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <path d="M2 11 Q5 8 8 11 Q11 14 14 11 Q17 8 19 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <path d="M2 15 Q5 12 8 15 Q11 18 14 15 Q17 12 19 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  </svg>`,
};

const FALLBACK_ICON = `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="10" cy="8" r="5" fill="currentColor"/>
  <line x1="10" y1="13" x2="10" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`;

// ── Bounding box ──────────────────────────────────────────────────────────────
const BOUNDS = L.latLngBounds(
  [55.768, 49.096], // SW
  [55.822, 49.125]  // NE
);

const CENTER: [number, number] = [55.795, 49.113];

// ── Marker factory ────────────────────────────────────────────────────────────
function makeIcon(id: string, active: boolean) {
  const svg = ICONS[id] ?? FALLBACK_ICON;
  return L.divIcon({
    className: "",
    html: `
      <div class="kz-pin${active ? " kz-pin--active" : ""}">
        <span class="kz-pin__icon">${svg}</span>
      </div>
      <div class="kz-pin__shadow"></div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -52],
  });
}

// ── Markers layer ─────────────────────────────────────────────────────────────
function MarkersLayer({ places, selectedPlace, onMarkerClick }: Omit<Props, "selectedEraId">) {
  const map = useMap();
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    places.forEach((place) => {
      const isActive = selectedPlace?.id === place.id;
      const marker = L.marker([place.lat, place.lng], {
        icon: makeIcon(place.id, isActive),
        title: place.name,
        zIndexOffset: isActive ? 1000 : 0,
      });

      marker.on("click", () => onMarkerClick(place));

      marker.bindTooltip(
        `<div class="kz-tooltip">
          <strong>${place.name}</strong>
          <span>${place.shortDescription}</span>
        </div>`,
        { direction: "top", offset: [0, -52], className: "kz-tooltip-wrap", permanent: false }
      );

      marker.addTo(map);
      markersRef.current.set(place.id, marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, selectedPlace]);

  // Pan smoothly to selected place
  useEffect(() => {
    if (selectedPlace) {
      map.panTo([selectedPlace.lat, selectedPlace.lng], { animate: true, duration: 0.5 });
    }
  }, [selectedPlace, map]);

  return null;
}

// ── Map setup ─────────────────────────────────────────────────────────────────
function MapSetup() {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(BOUNDS);
    map.options.maxBoundsViscosity = 0.85;
  }, [map]);
  return null;
}

function ZoomControl() {
  const map = useMap();
  useEffect(() => {
    const ctrl = L.control.zoom({ position: "bottomright" });
    ctrl.addTo(map);
    return () => { ctrl.remove(); };
  }, [map]);
  return null;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function KazanMap({ places, selectedPlace, selectedEraId, onMarkerClick }: Props) {
  void selectedEraId;
  return (
    <MapContainer
      center={CENTER}
      zoom={13}
      minZoom={12}
      maxZoom={18}
      className="h-full w-full"
      zoomControl={false}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
      />
      <MapSetup />
      <MarkersLayer
        places={places}
        selectedPlace={selectedPlace}
        onMarkerClick={onMarkerClick}
      />
      <ZoomControl />
    </MapContainer>
  );
}
