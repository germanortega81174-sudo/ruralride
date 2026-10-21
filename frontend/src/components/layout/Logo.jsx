export default function Logo({ claro = false }) {
  return (
    <span className={`logo ${claro ? 'logo--claro' : ''}`}>
      <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <rect width="64" height="64" rx="14" fill="#1E5631" />
        <path d="M10 44c8-14 18-22 30-24l6-8 4 10c2 6-1 12-8 14H24l-6 8z" fill="#F2C14E" />
        <circle cx="22" cy="46" r="5" fill="#FAF7F0" />
        <circle cx="44" cy="46" r="5" fill="#FAF7F0" />
      </svg>
      <span className="logo__texto">
        Rural<strong>Ride</strong>
      </span>
    </span>
  );
}
