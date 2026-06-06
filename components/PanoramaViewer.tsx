"use client";

/**
 * PanoramaViewer
 *
 * Renders a 360° equirectangular panorama using Pannellum (loaded from CDN
 * via a <script> tag so we avoid SSR issues with the npm package).
 *
 * Props:
 *   imageUrl  — path to the equirectangular image (2:1 ratio)
 *   placeName — used as the title overlay
 *   eraLabel  — shown in a small badge
 */

import { useEffect, useRef, useState } from "react";

interface Props {
  imageUrl: string;
  placeName: string;
  eraLabel: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pannellum: any;
  }
}

function usePannellumScript() {
  const [ready, setReady] = useState(
    typeof window !== "undefined" && !!window.pannellum
  );

  useEffect(() => {
    if (window.pannellum) {
      setReady(true);
      return;
    }

    // Inject CSS
    if (!document.getElementById("pannellum-css")) {
      const link = document.createElement("link");
      link.id = "pannellum-css";
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css";
      document.head.appendChild(link);
    }

    // Inject JS
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js";
    script.async = true;
    script.onload = () => setReady(true);
    document.body.appendChild(script);
  }, []);

  return ready;
}

export default function PanoramaViewer({ imageUrl, placeName, eraLabel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewerRef = useRef<any>(null);
  const scriptReady = usePannellumScript();
  const [imgError, setImgError] = useState(false);

  // Resolve the actual URL by probing extensions in order.
  // places.json stores extension-free paths (e.g. /panoramas/kremlin_modern);
  // we try png → jpg → webp → jpeg until one loads, then hand it to Pannellum.
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  useEffect(() => {
    setImgError(false);
    setResolvedUrl(null);

    const hasExt = /\.(png|jpe?g|webp)$/i.test(imageUrl);
    const candidates = hasExt
      ? [imageUrl]
      : [`${imageUrl}.png`, `${imageUrl}.jpg`, `${imageUrl}.webp`, `${imageUrl}.jpeg`];

    let cancelled = false;
    (async () => {
      for (const url of candidates) {
        const found = await new Promise<boolean>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = url;
        });
        if (cancelled) return;
        if (found) { setResolvedUrl(url); return; }
      }
      if (!cancelled) setImgError(true);
    })();

    return () => { cancelled = true; };
  }, [imageUrl]);

  // Init / update Pannellum whenever resolved image or script changes
  useEffect(() => {
    if (!scriptReady || !containerRef.current || imgError || !resolvedUrl) return;

    // Destroy previous viewer
    if (viewerRef.current) {
      try { viewerRef.current.destroy(); } catch { /* ignore */ }
      viewerRef.current = null;
    }

    viewerRef.current = window.pannellum.viewer(containerRef.current, {
      type: "equirectangular",
      panorama: resolvedUrl,
      autoLoad: true,
      autoRotate: -1.5,
      compass: false,
      showControls: true,
      showFullscreenCtrl: false,
      mouseZoom: true,
      hfov: 100,
      pitch: 0,
      yaw: 0,
    });

    return () => {
      if (viewerRef.current) {
        try { viewerRef.current.destroy(); } catch { /* ignore */ }
        viewerRef.current = null;
      }
    };
  }, [scriptReady, resolvedUrl, imgError]);

  if (imgError || !imageUrl) {
    return (
      <div className="relative h-full w-full flex flex-col items-center justify-center bg-panel-bg select-none">
        {/* Decorative placeholder suggesting a 360° view */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-gold/30" />
          {/* Horizon line */}
          <div className="absolute w-full h-px bg-gold/20 top-1/2" />
          {/* Center dot */}
          <div className="w-3 h-3 rounded-full bg-gold/60" />
          {/* Cardinal spokes */}
          {[0, 45, 90, 135].map((deg) => (
            <div
              key={deg}
              className="absolute w-full h-px bg-gold/10 origin-center"
              style={{ transform: `rotate(${deg}deg)` }}
            />
          ))}
        </div>
        <p className="mt-6 text-parchment/50 text-sm text-center px-4">
          Panorama placeholder
        </p>
        <p className="mt-1 text-parchment/30 text-xs font-mono text-center px-6 break-all">
          {imageUrl}.<span className="text-parchment/20">png / jpg / webp</span>
        </p>
        <p className="mt-3 text-parchment/40 text-xs text-center px-4">
          Place your equirectangular image (2:1) at the path above to activate
          the 360° viewer.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={containerRef} className="h-full w-full" />
      {/* Era badge overlay */}
      <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-2">
        <span className="rounded bg-panel-bg/80 px-2 py-0.5 text-xs text-gold border border-panel-border">
          360°
        </span>
        <span className="rounded bg-panel-bg/80 px-2 py-0.5 text-xs text-parchment/70 border border-panel-border">
          {eraLabel}
        </span>
      </div>
    </div>
  );
}
