/** Site header with logo, title, and tagline. */
export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <svg
          className="site-header__logo"
          viewBox="0 0 64 64"
          role="img"
          aria-label="CarbonWise logo"
        >
          <rect width="64" height="64" rx="14" fill="var(--color-primary)" />
          <path
            d="M44 16c-14 0-24 8-24 22 0 3 .7 5.7 2 8 1.6-7 6-12 13-15-5.6 4-9.4 9.2-11 16 2 1 4.5 1.5 7 1.5 12 0 17-10 17-23 0-3.3-1.6-7.5-4-10z"
            fill="#5eead4"
          />
        </svg>
        <div>
          <h1 className="site-header__title">CarbonWise</h1>
          <p className="site-header__tagline">
            Understand, track, and reduce your carbon footprint.
          </p>
        </div>
      </div>
    </header>
  );
}
