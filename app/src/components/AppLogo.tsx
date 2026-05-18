interface AppLogoProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * 冷知识星球 Logo
 * Circle (planet) + equator line + S-shaped orbital path
 */
export function AppLogo({ size = 80, color = 'white', className }: AppLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer planet circle */}
      <circle
        cx="50" cy="50" r="44"
        stroke={color} strokeWidth="4.2" strokeLinecap="round"
      />
      {/* Equator line */}
      <line
        x1="6" y1="50" x2="94" y2="50"
        stroke={color} strokeWidth="4.2" strokeLinecap="round"
      />
      {/* Orbital S-path: upper-right → center → lower-left */}
      <path
        d="M 61 23 C 76 23, 76 50, 50 50 C 24 50, 24 77, 39 77"
        stroke={color}
        strokeWidth="4.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
