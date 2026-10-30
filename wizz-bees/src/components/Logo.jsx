// Logo Wizz Bees: o celulă de fagure cu dungi de albină și o aripă.
// Desenat de la zero, fără elemente din identitatea altor companii.
export default function Logo({ size = 34, withText = true }) {
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
        <defs>
          <clipPath id="hex-clip">
            <path d="M20 2 L36 11 L36 29 L20 38 L4 29 L4 11 Z" />
          </clipPath>
        </defs>
        <path d="M20 2 L36 11 L36 29 L20 38 L4 29 L4 11 Z" fill="var(--honey)" />
        <g clipPath="url(#hex-clip)" fill="var(--hive)">
          <rect x="0" y="17" width="40" height="5" transform="rotate(-18 20 20)" />
          <rect x="0" y="26" width="40" height="5" transform="rotate(-18 20 20)" />
        </g>
        <ellipse cx="25" cy="10" rx="8" ry="4.5" fill="#fff" opacity="0.92" transform="rotate(-30 25 10)" />
      </svg>
      {withText && (
        <span className="logo-text">
          wizz<b>bees</b>
        </span>
      )}
    </span>
  )
}
