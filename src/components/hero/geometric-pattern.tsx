interface GeometricPatternProps {
  className?: string;
  /** Unique per usage to avoid duplicate SVG pattern ids on one page. */
  id?: string;
}

/**
 * Repeating eight-pointed star (Rub el Hizb) tile — the classic
 * Middle Eastern geometric motif. Colored via `currentColor` so the
 * parent controls tint and opacity with text utilities.
 */
export function GeometricPattern({
  className,
  id = "geo-pattern",
}: GeometricPatternProps) {
  return (
    <svg className={className} aria-hidden="true" focusable="false">
      <defs>
        <pattern
          id={id}
          width="120"
          height="120"
          patternUnits="userSpaceOnUse"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M60 14 L71 49 L106 60 L71 71 L60 106 L49 71 L14 60 L49 49 Z" />
            <circle cx="60" cy="60" r="19" opacity="0.6" />
            <path
              d="M0 0 L22 22 M120 0 L98 22 M0 120 L22 98 M120 120 L98 98"
              opacity="0.45"
            />
            <circle cx="0" cy="0" r="6" opacity="0.5" />
            <circle cx="120" cy="0" r="6" opacity="0.5" />
            <circle cx="0" cy="120" r="6" opacity="0.5" />
            <circle cx="120" cy="120" r="6" opacity="0.5" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
