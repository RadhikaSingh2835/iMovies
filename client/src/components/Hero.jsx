export default function Hero({ featuredMovie, onSelectMovie, onOpenNotice }) {
  if (!featuredMovie) return null;

  return (
    <section className="hero-banner" style={{ backgroundImage: `linear-gradient(to right, rgba(12, 13, 20, 0.95) 20%, rgba(12, 13, 20, 0.75) 60%, rgba(12, 13, 20, 0.85) 100%), url(${featuredMovie.backdrop})` }}>
      <div className="hero-content">
        <div className="hero-badge-row">
          <span className="hero-badge">🔥 {featuredMovie.badge || 'Featured'}</span>
          <span className="hero-rating">⭐ {featuredMovie.rating}/10</span>
          <span className="hero-meta-item">{featuredMovie.releaseYear}</span>
          <span className="hero-meta-item">{featuredMovie.duration}</span>
        </div>

        <h1 className="hero-title">{featuredMovie.title}</h1>
        <p className="hero-tagline">{featuredMovie.tagline}</p>
        <p className="hero-synopsis">{featuredMovie.synopsis}</p>

        <div className="hero-genres">
          {featuredMovie.genre.map((g) => (
            <span key={g} className="genre-tag">
              {g}
            </span>
          ))}
        </div>

        <div className="hero-actions">
          <button
            className="btn-primary"
            onClick={() => onSelectMovie(featuredMovie)}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            View Details & Showtimes
          </button>
          <button
            className="btn-glass"
            onClick={() => onOpenNotice(`Booking for "${featuredMovie.title}" will be activated in Phase 5 with the seat selection grid!`)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
            Book Tickets (₹{featuredMovie.ticketPrice})
          </button>
        </div>

        {/* Feature Highlights Bar */}
        <div className="hero-highlights">
          <div className="highlight-pill">
            <span className="highlight-icon">🎟️</span> Instant E-Tickets
          </div>
          <div className="highlight-pill">
            <span className="highlight-icon">🔊</span> Dolby Atmos 7.1
          </div>
          <div className="highlight-pill">
            <span className="highlight-icon">🍿</span> Seat Selection
          </div>
          <div className="highlight-pill">
            <span className="highlight-icon">⚡</span> Zero Booking Fee
          </div>
        </div>
      </div>
    </section>
  );
}
