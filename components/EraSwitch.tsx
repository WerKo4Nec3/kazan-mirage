"use client";

import type { Era } from "@/types";

interface Props {
  eras: Era[];
  selectedEraId: string;
  onSelect: (id: string) => void;
}

export default function EraSwitch({ eras, selectedEraId, onSelect }: Props) {
  return (
    <nav
      className="flex gap-1 rounded border border-panel-border bg-panel-bg/90 p-0.5 backdrop-blur"
      aria-label="Historical era selector"
    >
      {eras.map((era) => {
        const active = era.id === selectedEraId;
        return (
          <button
            key={era.id}
            onClick={() => onSelect(era.id)}
            className={[
              "rounded px-2.5 py-1 text-xs font-medium transition-all duration-200",
              active
                ? "bg-gold text-ink shadow"
                : "text-parchment/60 hover:text-parchment hover:bg-white/5",
            ].join(" ")}
            title={era.years}
          >
            <span className="hidden sm:inline">{era.label}</span>
            <span className="sm:hidden">{era.years.split("–")[0]}</span>
          </button>
        );
      })}
    </nav>
  );
}
