type LogoProps = {
  size?: number;
  variant?: "dark" | "light";
  iconOnly?: boolean;
};

export function Logo({ size = 28, variant = "dark", iconOnly = false }: LogoProps) {
  const textColor = variant === "light" ? "white" : "#191919";
  const fontSize = Math.round(size * 0.72);

  return (
    <div className="flex items-center gap-2.5" style={{ lineHeight: 1 }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
        <rect width="40" height="40" rx="11" fill="#14967F" />
        <rect x="18" y="8" width="4" height="24" rx="2" fill="white" />
        <rect x="8" y="18" width="24" height="4" rx="2" fill="white" />
      </svg>
      {!iconOnly && (
        <span
          style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontWeight: 700,
            fontSize,
            color: textColor,
            letterSpacing: "-0.01em",
          }}
        >
          Book
          <span style={{ color: "#14967F" }}>My</span>
          Doc
        </span>
      )}
    </div>
  );
}
