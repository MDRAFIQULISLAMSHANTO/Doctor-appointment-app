type LogoProps = {
  size?: number;
  variant?: "dark" | "light";
  iconOnly?: boolean;
};

export function Logo({ size = 28, variant = "dark", iconOnly = false }: LogoProps) {
  const serifColor = variant === "light" ? "#f6f3f1" : "#242424";
  const iconSize = size;
  const serifSize = Math.round(size * 0.74);
  const monoSize = Math.round(size * 0.60);

  return (
    <div className="flex items-center" style={{ gap: Math.round(size * 0.32), lineHeight: 1 }}>
      {/* Icon: dark card + mint cross */}
      <svg width={iconSize} height={iconSize} viewBox="0 0 40 40" fill="none" aria-hidden>
        <rect width="40" height="40" rx="10" fill="#242424" />
        <rect x="18" y="8" width="4" height="24" rx="2" fill="#a7fccd" />
        <rect x="8" y="18" width="24" height="4" rx="2" fill="#a7fccd" />
      </svg>

      {!iconOnly && (
        <span style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
          {/* "Book" — Noto Serif */}
          <span style={{
            fontFamily: "'Noto Serif', Georgia, serif",
            fontWeight: 700,
            fontSize: serifSize,
            color: serifColor,
            letterSpacing: "-0.02em",
          }}>Book</span>
          {/* "My" — IBM Plex Mono in teal */}
          <span style={{
            fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
            fontWeight: 500,
            fontSize: monoSize,
            color: "#14967F",
            letterSpacing: "0.01em",
          }}>My</span>
          {/* "Doc" — Noto Serif */}
          <span style={{
            fontFamily: "'Noto Serif', Georgia, serif",
            fontWeight: 700,
            fontSize: serifSize,
            color: serifColor,
            letterSpacing: "-0.02em",
          }}>Doc</span>
        </span>
      )}
    </div>
  );
}
