"use client";

import { useState } from "react";
import type { Place } from "@/types";

interface Props {
  places: Place[];
  selectedPlaceId: string | null;
  onPlaceClick: (place: Place) => void;
}

// Positions of each place on the 900×620 illustrated SVG canvas
const POSITIONS: Record<string, { x: number; y: number }> = {
  kremlin:    { x: 196, y: 186 },
  kolsharif:  { x: 164, y: 150 },
  bauman:     { x: 440, y: 256 },
  peter_paul: { x: 346, y: 234 },
  lake_kaban: { x: 458, y: 416 },
};

// ─── Icon shapes (drawn in local space, centered at 0,0) ──────────────────────

function FortressIcon({ color }: { color: string }) {
  return (
    <g fill={color}>
      {/* Battlements */}
      <rect x="-9" y="-16" width="5" height="5" rx="0.5" />
      <rect x="-2" y="-16" width="5" height="5" rx="0.5" />
      <rect x="5"  y="-16" width="5" height="5" rx="0.5" />
      {/* Wall body */}
      <rect x="-9" y="-11" width="19" height="10" rx="0.5" />
      {/* Arch gate */}
      <path d="M -3,-1 L -3,-7 Q 0,-10 3,-7 L 3,-1 Z" fill="rgba(0,0,0,0.3)" />
    </g>
  );
}

function MosqueIcon({ color }: { color: string }) {
  return (
    <g fill={color}>
      {/* Left minaret */}
      <rect x="-12" y="-18" width="4" height="14" rx="1" />
      <polygon points="-12,-18 -8,-18 -10,-24" />
      {/* Right minaret */}
      <rect x="8"  y="-18" width="4" height="14" rx="1" />
      <polygon points="8,-18 12,-18 10,-24" />
      {/* Body */}
      <rect x="-7" y="-12" width="15" height="11" rx="1" />
      {/* Dome */}
      <path d="M -7,-12 Q 0.5,-24 8,-12 Z" />
    </g>
  );
}

function ChurchIcon({ color }: { color: string }) {
  return (
    <g fill={color}>
      {/* Body */}
      <rect x="-7" y="-10" width="14" height="10" rx="1" />
      {/* Baroque tower */}
      <rect x="-3" y="-18" width="6" height="8" />
      {/* Onion dome */}
      <path d="M -3,-18 Q 0,-26 3,-18 Z" />
      {/* Cross */}
      <rect x="-1"   y="-28" width="2" height="5" fill="white" opacity="0.9" />
      <rect x="-3.5" y="-26" width="7" height="1.5" fill="white" opacity="0.9" />
    </g>
  );
}

function StreetIcon({ color }: { color: string }) {
  return (
    <g>
      {/* Two small buildings with trees between them */}
      <rect x="-12" y="-14" width="7" height="12" fill={color} rx="0.5" />
      <rect x="5"   y="-12" width="7" height="10" fill={color} rx="0.5" />
      {/* Tree */}
      <circle cx="-2" cy="-10" r="4.5" fill="#6a9a50" />
      <rect   x="-1" y="-5"   width="2" height="4"  fill="#5a7a3a" />
    </g>
  );
}

function LakeIcon() {
  return (
    <g>
      <ellipse cx="0" cy="-5" rx="11" ry="7" fill="#5a9ec8" opacity="0.9" />
      <path d="M -7,-7 Q -3,-10 1,-7 Q 5,-10 8,-7"
        fill="none" stroke="white" strokeWidth="1.4" opacity="0.75" />
      <path d="M -6,-2 Q -2,-5 2,-2 Q 6,-5 8,-2"
        fill="none" stroke="white" strokeWidth="1.1" opacity="0.5" />
    </g>
  );
}

function MarkerIcon({ placeId, color }: { placeId: string; color: string }) {
  switch (placeId) {
    case "kremlin":    return <FortressIcon color={color} />;
    case "kolsharif":  return <MosqueIcon   color={color} />;
    case "peter_paul": return <ChurchIcon   color={color} />;
    case "bauman":     return <StreetIcon   color={color} />;
    case "lake_kaban": return <LakeIcon />;
    default:           return <circle r="7" fill={color} />;
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function IllustratedMap({ places, selectedPlaceId, onPlaceClick }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div
      className="h-full w-full flex items-center justify-center"
      style={{ background: "#e4d9b4" }}
    >
      <svg
        viewBox="0 0 900 620"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block", maxHeight: "100%", maxWidth: "100%" }}
      >
        <defs>
          {/* Glow for active/hovered markers */}
          <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft shadow for all markers */}
          <filter id="mshadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#00000055" />
          </filter>

          {/* Water gradient */}
          <linearGradient id="water-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#5898c0" />
            <stop offset="100%" stopColor="#7ab8d8" />
          </linearGradient>

          {/* Kremlin hill gradient */}
          <radialGradient id="hill-grad" cx="45%" cy="55%" r="55%">
            <stop offset="0%"   stopColor="#d4b868" />
            <stop offset="100%" stopColor="#b89840" />
          </radialGradient>

          {/* Subtle vignette */}
          <radialGradient id="vignette" cx="50%" cy="50%" r="72%">
            <stop offset="60%"  stopColor="transparent" />
            <stop offset="100%" stopColor="#00000028" />
          </radialGradient>
        </defs>

        {/* ══════════════════════════════════════════════════
            LAYER 1 — PARCHMENT BACKGROUND
        ══════════════════════════════════════════════════ */}
        <rect width="900" height="620" fill="#e4d9b4" />
        {/* Horizontal grain lines for parchment texture */}
        {Array.from({ length: 30 }, (_, i) => (
          <line
            key={`grain-${i}`}
            x1="0"   y1={i * 22}
            x2="900" y2={i * 22 + 6}
            stroke="#ccc2a0" strokeWidth="0.4" opacity="0.45"
          />
        ))}

        {/* ══════════════════════════════════════════════════
            LAYER 2 — LAND BASE
        ══════════════════════════════════════════════════ */}
        <rect x="0" y="142" width="900" height="478" fill="#ddd0a2" />

        {/* ══════════════════════════════════════════════════
            LAYER 3 — KAZANKA RIVER (top curved band)
            The river runs along the top ~22% of the canvas.
            The Kremlin peninsula juts northward into it from
            the south bank, so we draw land on top of water.
        ══════════════════════════════════════════════════ */}
        <path
          d="M 0,0 L 900,0 L 900,148
             Q 780,130 640,136
             Q 510,142 400,148
             Q 310,153 240,148
             Q 170,143 90,148
             Q 50,150 0,152 Z"
          fill="url(#water-grad)"
        />

        {/* Wave lines in river */}
        <path d="M 30,52 Q 130,42 230,52 Q 330,62 430,50 Q 530,38 630,50 Q 730,62 830,52"
          fill="none" stroke="#a8cce0" strokeWidth="1.1" opacity="0.55" />
        <path d="M 50,78 Q 150,68 250,76 Q 350,84 450,72 Q 550,60 650,72 Q 750,84 850,74"
          fill="none" stroke="#a8cce0" strokeWidth="0.9" opacity="0.45" />
        <path d="M 40,108 Q 140,98 240,106 Q 340,114 440,102 Q 540,90 640,102 Q 740,114 840,104"
          fill="none" stroke="#a8cce0" strokeWidth="0.7" opacity="0.35" />

        {/* ══════════════════════════════════════════════════
            LAYER 4 — KREMLIN HILL (peninsula into river)
        ══════════════════════════════════════════════════ */}
        <path
          d="M 100,156 Q 128,118 156,90 Q 184,62 220,60 Q 258,58 282,88
             Q 302,112 302,152 Q 268,156 200,158 Q 155,159 100,156 Z"
          fill="url(#hill-grad)"
        />
        {/* Hill edge highlight */}
        <path
          d="M 108,156 Q 136,120 162,93 Q 188,66 220,64 Q 254,62 277,92
             Q 296,116 296,152"
          fill="none" stroke="#c0a030" strokeWidth="1" opacity="0.5"
        />

        {/* ══════════════════════════════════════════════════
            LAYER 5 — KREMLIN WALLS & TOWERS
        ══════════════════════════════════════════════════ */}
        {/* Main wall polygon */}
        <path
          d="M 124,157 L 150,118 L 174,92 L 220,62 L 264,88 L 284,120 L 286,154"
          fill="none" stroke="#7a4c22" strokeWidth="3" strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Inner wall (slightly inset, lighter) */}
        <path
          d="M 132,155 L 155,120 L 176,97 L 220,70 L 260,94 L 278,122 L 280,153"
          fill="none" stroke="#a06838" strokeWidth="1" strokeLinejoin="round"
          opacity="0.5"
        />
        {/* Towers at wall vertices */}
        {([
          [150, 118, 5],
          [174, 92,  5],
          [220, 62,  8],   // Spassky tower — largest
          [264, 88,  5],
          [284, 120, 5],
        ] as [number, number, number][]).map(([cx, cy, r], i) => (
          <g key={`tower-${i}`}>
            <circle cx={cx} cy={cy} r={r + 2}
              fill="#c09040" stroke="#7a4c22" strokeWidth="1.5" />
            <circle cx={cx} cy={cy} r={r - 1}
              fill="#d4aa58" />
          </g>
        ))}
        {/* Kremlin courtyard greenery */}
        <ellipse cx="200" cy="125" rx="30" ry="18" fill="#8cb870" opacity="0.55" />
        {/* Small interior buildings */}
        <rect x="184" y="108" width="30" height="20"
          fill="#c8a040" stroke="#8a6018" strokeWidth="1" rx="1" opacity="0.85" />
        <rect x="192" y="96"  width="14" height="14"
          fill="#b89030" stroke="#8a6018" strokeWidth="1" opacity="0.9" />
        <path d="M 192,96 Q 199,88 206,96 Z" fill="#b89030" />

        {/* ══════════════════════════════════════════════════
            LAYER 6 — GREEN PARKS & OPEN AREAS
        ══════════════════════════════════════════════════ */}
        {/* West park strip */}
        <ellipse cx="88"  cy="340" rx="65" ry="100" fill="#8cb870" opacity="0.38" />
        {/* East park */}
        <ellipse cx="758" cy="252" rx="78" ry="62"  fill="#8cb870" opacity="0.35" />
        {/* Central park near Bauman */}
        <ellipse cx="504" cy="198" rx="44" ry="24"  fill="#8cb870" opacity="0.33" />
        {/* South parks */}
        <ellipse cx="172" cy="492" rx="82" ry="52"  fill="#8cb870" opacity="0.32" />
        <ellipse cx="692" cy="462" rx="72" ry="48"  fill="#8cb870" opacity="0.28" />
        {/* Small tree clusters */}
        {([
          [368, 175], [620, 175], [700, 310], [210, 295], [560, 310],
        ] as [number, number][]).map(([cx, cy], i) => (
          <g key={`tree-${i}`} opacity="0.5">
            <circle cx={cx}     cy={cy}     r="8"  fill="#7aaa58" />
            <circle cx={cx - 7} cy={cy + 3} r="6"  fill="#6a9a48" />
            <circle cx={cx + 7} cy={cy + 3} r="6"  fill="#8aba68" />
          </g>
        ))}

        {/* ══════════════════════════════════════════════════
            LAYER 7 — CITY STREETS
        ══════════════════════════════════════════════════ */}
        {/* Main boulevard — Bauman Street (east-west) */}
        <path d="M 296,252 L 628,247"
          stroke="#c0ac78" strokeWidth="5.5" opacity="0.85" strokeLinecap="round" />
        {/* Bauman shadow (depth) */}
        <path d="M 296,257 L 628,252"
          stroke="#a09050" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
        {/* Tree-lined median suggestion */}
        <path d="M 300,252 L 625,247"
          stroke="#6a9a50" strokeWidth="1.5" strokeDasharray="10,14" opacity="0.4"
          strokeLinecap="round" />

        {/* North road from Kremlin into city */}
        <path d="M 254,158 L 256,260 L 290,490"
          stroke="#c0ac78" strokeWidth="3.5" opacity="0.75"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* East-main road */}
        <path d="M 628,247 L 840,238"
          stroke="#c0ac78" strokeWidth="3" opacity="0.65" strokeLinecap="round" />

        {/* South cross road */}
        <path d="M 168,342 L 710,334"
          stroke="#c0ac78" strokeWidth="3" opacity="0.6" strokeLinecap="round" />

        {/* Short connector streets */}
        {([
          [[340, 248], [338, 342]],
          [[452, 250], [456, 342]],
          [[562, 248], [560, 342]],
        ] as [[number,number],[number,number]][]).map(([[x1,y1],[x2,y2]], i) => (
          <path key={`conn-${i}`}
            d={`M ${x1},${y1} L ${x2},${y2}`}
            stroke="#c0ac78" strokeWidth="2.2" opacity="0.5" strokeLinecap="round" />
        ))}

        {/* ══════════════════════════════════════════════════
            LAYER 8 — DISTRICT OVERLAYS
        ══════════════════════════════════════════════════ */}
        {/* Old Tatar Quarter — warm terracotta tint */}
        <path
          d="M 302,350 L 624,342 L 632,490 L 288,500 Z"
          fill="#c88040" opacity="0.16"
        />
        <path
          d="M 302,350 L 624,342 L 632,490 L 288,500 Z"
          fill="none" stroke="#a06030" strokeWidth="1.2"
          strokeDasharray="7,5" opacity="0.45"
        />

        {/* ══════════════════════════════════════════════════
            LAYER 9 — LAKE KABAN
        ══════════════════════════════════════════════════ */}
        <ellipse cx="458" cy="416" rx="72" ry="34"
          fill="#5a9ec8" stroke="#3a78a0" strokeWidth="2" opacity="0.88" />
        {/* Lake sheen */}
        <ellipse cx="450" cy="410" rx="50" ry="18"
          fill="#88c0e0" opacity="0.25" />
        {/* Wave lines */}
        <path d="M 398,412 Q 418,405 440,412 Q 462,419 482,412 Q 498,405 516,412"
          fill="none" stroke="white" strokeWidth="1.3" opacity="0.55" />
        <path d="M 408,424 Q 428,417 450,424 Q 472,431 492,424"
          fill="none" stroke="white" strokeWidth="1" opacity="0.38" />

        {/* ══════════════════════════════════════════════════
            LAYER 10 — BACKGROUND BUILDING SILHOUETTES
            Gives depth without cluttering the foreground
        ══════════════════════════════════════════════════ */}
        {([
          [322,182,16,24],[346,176,12,30],[368,188,18,20],
          [432,180,14,26],[480,173,16,32],[512,184,22,22],
          [578,178,13,28],[622,186,18,20],[660,176,14,30],
          [376,295,20,20],[424,288,16,24],[490,296,22,18],
          [556,290,16,22],[602,294,14,20],[644,288,20,24],
          [726,210,18,32],[750,218,12,24],[774,208,16,28],
        ] as [number,number,number,number][]).map(([x, y, w, h], i) => (
          <rect key={`bldg-${i}`}
            x={x} y={y} width={w} height={h}
            fill="#c8b882" stroke="#a89858" strokeWidth="0.5"
            opacity="0.48" rx="0.5"
          />
        ))}

        {/* ══════════════════════════════════════════════════
            LAYER 11 — TEXT LABELS
        ══════════════════════════════════════════════════ */}
        {/* River name */}
        <text x="560" y="74" textAnchor="middle" fontSize="15"
          fill="#1a5070" opacity="0.65"
          fontStyle="italic" fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="3">
          カザンカ川
        </text>

        {/* Old Tatar Quarter */}
        <text x="456" y="373" textAnchor="middle" fontSize="10.5"
          fill="#6a3820" opacity="0.7"
          fontFamily="Georgia, 'Times New Roman', serif" letterSpacing="1.5">
          旧タタール人街
        </text>

        {/* Kremlin label */}
        <text x="204" y="198" textAnchor="middle" fontSize="8.5"
          fill="#3a2010" opacity="0.82"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="bold" letterSpacing="1">
          クレムリン
        </text>

        {/* Old City */}
        <text x="490" y="222" textAnchor="middle" fontSize="10.5"
          fill="#4a3c20" opacity="0.4"
          fontFamily="Georgia, 'Times New Roman', serif" letterSpacing="2">
          旧市街
        </text>

        {/* Lake Kaban label */}
        <text x="458" y="448" textAnchor="middle" fontSize="9.5"
          fill="#1a4060" opacity="0.7"
          fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic">
          カバン湖
        </text>

        {/* Bauman Street label */}
        <text x="462" y="243" textAnchor="middle" fontSize="9"
          fill="#3a3020" opacity="0.5"
          fontFamily="Georgia, 'Times New Roman', serif" letterSpacing="1.5">
          バウマン通り
        </text>

        {/* ══════════════════════════════════════════════════
            LAYER 12 — MAP TITLE CARTOUCHE
        ══════════════════════════════════════════════════ */}
        <rect x="714" y="18" width="170" height="68" rx="5"
          fill="#c8aa5c" opacity="0.22" stroke="#a08040" strokeWidth="1.5" />
        <rect x="718" y="22" width="162" height="60" rx="4"
          fill="none" stroke="#a08040" strokeWidth="0.5" opacity="0.55" />
        <text x="799" y="52" textAnchor="middle" fontSize="24"
          fill="#2c2416"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="bold" letterSpacing="5">
          KAZAN
        </text>
        <text x="799" y="72" textAnchor="middle" fontSize="9.5"
          fill="#4a3c20" opacity="0.75"
          fontFamily="Georgia, 'Times New Roman', serif" letterSpacing="1.5">
          歴史地図
        </text>

        {/* ══════════════════════════════════════════════════
            LAYER 13 — COMPASS ROSE
        ══════════════════════════════════════════════════ */}
        <g transform="translate(845, 550)">
          <circle r="30" fill="#e4d9b4" stroke="#a08040" strokeWidth="1.2" opacity="0.9" />
          {/* Cardinal points */}
          <polygon points="0,-26 3.5,-10 -3.5,-10" fill="#2c2416" />
          <polygon points="0,26  3.5,10 -3.5,10" fill="#2c2416" opacity="0.45" />
          <polygon points="26,0  10,3.5  10,-3.5" fill="#2c2416" opacity="0.45" />
          <polygon points="-26,0 -10,3.5 -10,-3.5" fill="#2c2416" opacity="0.45" />
          {/* Ordinal ticks */}
          {[45, 135, 225, 315].map((deg) => (
            <line key={deg}
              x1="0" y1="-18"
              x2="0" y2="-22"
              stroke="#a08040" strokeWidth="1"
              transform={`rotate(${deg})`}
            />
          ))}
          <circle r="4" fill="#a08040" />
          <text y="-16" textAnchor="middle" fontSize="11" fill="#2c2416"
            fontFamily="Georgia, 'Times New Roman', serif" fontWeight="bold">
            N
          </text>
        </g>

        {/* ══════════════════════════════════════════════════
            LAYER 14 — DECORATIVE BORDER
        ══════════════════════════════════════════════════ */}
        <rect x="10" y="10" width="880" height="600"
          fill="none" stroke="#a08040" strokeWidth="2.5" rx="3" />
        <rect x="16" y="16" width="868" height="588"
          fill="none" stroke="#a08040" strokeWidth="0.8" opacity="0.5" rx="2" />
        {/* Corner diamonds */}
        {([[22,22],[878,22],[22,598],[878,598]] as [number,number][]).map(([cx, cy], i) => (
          <path key={`diamond-${i}`}
            d={`M ${cx},${cy - 7} L ${cx + 7},${cy} L ${cx},${cy + 7} L ${cx - 7},${cy} Z`}
            fill="#a08040" opacity="0.75"
          />
        ))}

        {/* Vignette overlay */}
        <rect width="900" height="620" fill="url(#vignette)" style={{ pointerEvents: "none" }} />

        {/* ══════════════════════════════════════════════════
            LAYER 15 — INTERACTIVE MARKERS
        ══════════════════════════════════════════════════ */}
        {places.map((place) => {
          const pos = POSITIONS[place.id];
          if (!pos) return null;

          const isActive  = selectedPlaceId === place.id;
          const isHovered = hoveredId       === place.id;
          const ringColor = isActive ? "#8b3a2a" : isHovered ? "#d4a030" : "#a08040";
          const iconColor = isActive ? "#8b3a2a" : "#5a3c18";

          return (
            <g
              key={place.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              onClick={() => onPlaceClick(place)}
              onMouseEnter={() => setHoveredId(place.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ cursor: "pointer" }}
              filter={isActive || isHovered ? "url(#glow)" : "url(#mshadow)"}
            >
              {/* Animated pulse ring for active marker (SMIL — no CSS needed) */}
              {isActive && (
                <circle r="20" fill="none" stroke="#8b3a2a" strokeWidth="2">
                  <animate attributeName="r"
                    values="20;32;20" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity"
                    values="0.7;0;0.7" dur="2.2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Hover ring */}
              {isHovered && !isActive && (
                <circle r="22" fill="none" stroke="#c9a030" strokeWidth="1.5" opacity="0.5" />
              )}

              {/* Medallion background */}
              <circle r="18"
                fill={isActive ? "#f5ead5" : "#f0e8d0"}
                stroke={ringColor}
                strokeWidth={isActive ? 2.5 : 2}
              />

              {/* Icon (scaled up slightly on hover) */}
              <g transform={isHovered || isActive ? "scale(1.08)" : "scale(1)"}>
                <MarkerIcon placeId={place.id} color={iconColor} />
              </g>

              {/* Name label */}
              <g transform="translate(0, 28)">
                <rect
                  x={-(place.name.length * 3.6 + 4)}
                  y="-9"
                  width={place.name.length * 7.2 + 8}
                  height="15"
                  rx="3"
                  fill={isActive ? "#6a2c1e" : "#1e1608"}
                  opacity={isActive || isHovered ? 0.9 : 0.78}
                />
                <text
                  textAnchor="middle"
                  y="3"
                  fontSize="10"
                  fill={isActive ? "#f5ead5" : "#e8dfc8"}
                  fontFamily="Georgia, 'Times New Roman', serif"
                  letterSpacing="0.3"
                >
                  {place.name}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
