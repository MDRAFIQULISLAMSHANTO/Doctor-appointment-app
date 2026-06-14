"use client";
import { useState, useRef, useEffect } from "react";
import { COMMON_MEDICINES } from "@/lib/medicines";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  /** Extra suggestions (e.g. medicines from this patient's history) shown first. */
  extraSuggestions?: string[];
};

export function MedicineAutocomplete({
  value, onChange, placeholder = "Medicine name", className = "", autoFocus, extraSuggestions = [],
}: Props) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const q = value.trim().toLowerCase();
  // Dedup extras + common, keep extras first.
  const pool = [...extraSuggestions, ...COMMON_MEDICINES.filter(m => !extraSuggestions.some(e => e.toLowerCase() === m.toLowerCase()))];
  const matches = q.length === 0
    ? []
    : pool.filter(m => m.toLowerCase().includes(q) && m.toLowerCase() !== q).slice(0, 8);

  const choose = (m: string) => { onChange(m); setOpen(false); };

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        value={value}
        autoFocus={autoFocus}
        onChange={e => { onChange(e.target.value); setOpen(true); setHighlight(0); }}
        onFocus={() => setOpen(true)}
        onKeyDown={e => {
          if (!open || matches.length === 0) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setHighlight(h => Math.min(h + 1, matches.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
          else if (e.key === "Enter") { e.preventDefault(); choose(matches[highlight]); }
          else if (e.key === "Escape") { setOpen(false); }
        }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {open && matches.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto py-1">
          {matches.map((m, i) => {
            const isExtra = extraSuggestions.some(e => e.toLowerCase() === m.toLowerCase());
            return (
              <li key={m}>
                <button
                  type="button"
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => choose(m)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2 ${i === highlight ? "bg-[#e8f5f2] text-[#14967F]" : "text-[#191919]"}`}
                >
                  <span>{m}</span>
                  {isExtra && <span className="text-[10px] text-[#14967F] bg-[#e8f5f2] rounded px-1.5 py-0.5 flex-shrink-0">history</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
