// The logo is intentionally unchanged from v1 — it's the one piece of the
// visual identity that was explicitly asked to stay as-is.
export function TypeDleLogo() {
  return (
    <svg className="typedle-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 118" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="logoBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF9EF" />
          <stop offset="100%" stopColor="#F5F0E2" />
        </linearGradient>
        <linearGradient id="logoBridge" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF4B4B" />
          <stop offset="18%" stopColor="#E13A4F" />
          <stop offset="28%" stopColor="#FF8A3D" />
          <stop offset="40%" stopColor="#FFD84A" />
          <stop offset="52%" stopColor="#3EDB73" />
          <stop offset="64%" stopColor="#2CC7FF" />
          <stop offset="76%" stopColor="#4F63FF" />
          <stop offset="78.5%" stopColor="#5462FC" />
          <stop offset="81%" stopColor="#5960F8" />
          <stop offset="83%" stopColor="#605CF2" />
          <stop offset="85%" stopColor="#6859EC" />
          <stop offset="87%" stopColor="#7256E8" />
          <stop offset="89%" stopColor="#7E52EE" />
          <stop offset="90%" stopColor="#8B50F5" />
          <stop offset="91%" stopColor="#9A4DFF" />
          <stop offset="100%" stopColor="#9A4DFF" />
        </linearGradient>
        <radialGradient id="logoLeftHalo" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(54 59) rotate(90) scale(42)">
          <stop offset="0%" stopColor="#FFD2CD" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#FFD2CD" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="logoRightHalo" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(366 59) rotate(90) scale(32)">
          <stop offset="0%" stopColor="#E3D3FF" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#E3D3FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pokeTopBlend" x1="34" y1="39" x2="74" y2="39" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF5A4A" />
          <stop offset="100%" stopColor="#E74653" />
        </linearGradient>
        <linearGradient id="masterTopBlend" x1="346" y1="39" x2="386" y2="39" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5D66FF" />
          <stop offset="100%" stopColor="#8F4FFF" />
        </linearGradient>
        <clipPath id="pokeBallClip" clipPathUnits="userSpaceOnUse">
          <circle cx="0" cy="0" r="20" />
        </clipPath>
        <linearGradient id="logoTextFill" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F5F8FF" />
        </linearGradient>
        <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="170%">
          <feDropShadow dx="0" dy="7" stdDeviation="8" floodColor="#1A2235" floodOpacity="0.28" />
        </filter>
        <filter id="logoTextGlow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.9" floodColor="#FFFFFF" floodOpacity="0.8" />
          <feDropShadow dx="0" dy="1.4" stdDeviation="1.2" floodColor="#0B1020" floodOpacity="0.5" />
        </filter>
      </defs>

      <rect x="8" y="10" width="404" height="98" rx="30" fill="url(#logoBase)" filter="url(#logoShadow)" />

      <rect
        x="12"
        y="14"
        width="396"
        height="90"
        rx="26"
        fill="url(#logoBridge)"
      />
      <circle cx="54" cy="59" r="30" fill="url(#logoLeftHalo)" />
      <circle cx="366" cy="59" r="30" fill="url(#logoRightHalo)" />
      <rect x="12" y="14" width="396" height="90" rx="26" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />

      <g transform="translate(54 59)">
        <circle r="20" fill="#F9FBFF" stroke="#1B2436" strokeWidth="2.6" />
        <rect x="-20" y="-20" width="40" height="20" fill="#E83F4D" clipPath="url(#pokeBallClip)" />
        <path d="M-20 0H20" stroke="#1B2436" strokeWidth="2.6" />
        <circle r="6.6" fill="#F9FBFF" stroke="#1B2436" strokeWidth="2.2" />
      </g>

      <g transform="translate(366 59)">
        <circle cx="-9.8" cy="-18.4" r="3.7" fill="#F6B2CF" stroke="#1B2436" strokeWidth="1.8" />
        <circle cx="9.8" cy="-18.4" r="3.7" fill="#F6B2CF" stroke="#1B2436" strokeWidth="1.8" />
        <circle r="20" fill="#F7F5FF" stroke="#1B2436" strokeWidth="2.6" />
        <rect x="-20" y="-20" width="40" height="20" fill="#8F4FFF" clipPath="url(#pokeBallClip)" />
        <path d="M-20 0H20" stroke="#1B2436" strokeWidth="2.6" />
        <circle r="6.6" fill="#F7F5FF" stroke="#1B2436" strokeWidth="2.2" />
        <rect x="-5.4" y="-15.6" width="10.8" height="5.2" rx="2.1" fill="#F6B2CF" stroke="#1B2436" strokeWidth="1.2" />
        <text
          x="0"
          y="-13"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="Segoe UI Variable Display, SF Pro Display, Avenir Next, Inter, sans-serif"
          fontSize="6.9"
          fontWeight="900"
          fill="#FFFFFF"
          stroke="#1B2436"
          strokeWidth="0.95"
          paintOrder="stroke fill"
        >
          M
        </text>
      </g>

      <text
        x="50%"
        y="53%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="Segoe UI Variable Display, SF Pro Display, Avenir Next, Inter, sans-serif"
        fontSize="45"
        fontWeight="900"
        letterSpacing="2"
        fill="url(#logoTextFill)"
        stroke="#0F1627"
        strokeWidth="1.1"
        paintOrder="stroke fill"
        filter="url(#logoTextGlow)"
      >
        TYPEDLE
      </text>
    </svg>
  )
}
