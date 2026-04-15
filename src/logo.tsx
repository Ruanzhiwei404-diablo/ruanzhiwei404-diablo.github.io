export default function Logo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="34" height="34" style={{ display: 'block', flexShrink: 0 }}>
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff5f7"/>
          <stop offset="100%" stopColor="#fff0f3"/>
        </linearGradient>
        <linearGradient id="petal1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f9a8d4" stopOpacity="0.85"/>
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.6"/>
        </linearGradient>
        <linearGradient id="petal2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbcfe8" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#f472b6" stopOpacity="0.65"/>
        </linearGradient>
        <linearGradient id="center" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fdf2f8"/>
          <stop offset="40%" stopColor="#f9a8d4"/>
          <stop offset="100%" stopColor="#db2777"/>
        </linearGradient>
        <radialGradient id="pearl" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95"/>
          <stop offset="30%" stopColor="#fbcfe8" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.5"/>
        </radialGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#ec4899" floodOpacity="0.22"/>
        </filter>
      </defs>

      <rect x="4" y="4" width="72" height="72" rx="18" ry="18" fill="url(#bg)"/>

      <g filter="url(#shadow)">
        <ellipse cx="40" cy="20" rx="7.5" ry="13" fill="url(#petal1)" opacity="0.75" transform="rotate(0 40 40)"/>
        <ellipse cx="40" cy="20" rx="7.5" ry="13" fill="url(#petal1)" opacity="0.75" transform="rotate(90 40 40)"/>
        <ellipse cx="40" cy="20" rx="7.5" ry="13" fill="url(#petal1)" opacity="0.75" transform="rotate(180 40 40)"/>
        <ellipse cx="40" cy="20" rx="7.5" ry="13" fill="url(#petal1)" opacity="0.75" transform="rotate(270 40 40)"/>
      </g>

      <g opacity="0.88">
        <ellipse cx="40" cy="22" rx="6.5" ry="11" fill="url(#petal2)" transform="rotate(45 40 40)"/>
        <ellipse cx="40" cy="22" rx="6.5" ry="11" fill="url(#petal2)" transform="rotate(135 40 40)"/>
        <ellipse cx="40" cy="22" rx="6.5" ry="11" fill="url(#petal2)" transform="rotate(225 40 40)"/>
        <ellipse cx="40" cy="22" rx="6.5" ry="11" fill="url(#petal2)" transform="rotate(315 40 40)"/>
      </g>

      <circle cx="40" cy="40" r="9" fill="url(#center)" opacity="0.9"/>
      <circle cx="40" cy="40" r="9" fill="url(#pearl)" opacity="0.6"/>
      <ellipse cx="36.5" cy="36.5" rx="3" ry="2.2" fill="white" opacity="0.7" transform="rotate(-30 36.5 36.5)"/>
      <circle cx="38" cy="38" r="1" fill="white" opacity="0.5"/>
    </svg>
  );
}
