import { useState, useEffect } from 'react';

export default function MovieDetailsModal({ movie, onClose, onOpenSeatSelection }) {
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedShowtime, setSelectedShowtime] = useState(
    movie?.showtimes && movie.showtimes.length > 0 ? movie.showtimes[0] : '06:00 PM'
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!movie) return null;

  const dates = [
    { label: 'Today', sub: '26 Oct' },
    { label: 'Tomorrow', sub: '27 Oct' },
    { label: 'Wed', sub: '28 Oct' },
  ];

  const handleProceedToSeats = () => {
    onOpenSeatSelection(movie, selectedDate, selectedShowtime);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        {/* Modal Hero Banner */}
        <div
          className="modal-banner"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(18, 20, 32, 0.4) 0%, rgba(18, 20, 32, 0.95) 100%), url(${movie.backdrop})`,
          }}
        >
          <div className="modal-banner-tags">
            {movie.badge && <span className="modal-badge">{movie.badge}</span>}
            <span className="modal-rating">⭐ {movie.rating}/10</span>
          </div>
          <h2 className="modal-title">{movie.title}</h2>
          <p className="modal-tagline">{movie.tagline}</p>
        </div>

        {/* Modal Body Content */}
        <div className="modal-body">
          <div className="modal-grid">
            {/* Left: Poster */}
            <div className="modal-poster-col">
              <img
                src={movie.poster}
                alt={movie.title}
                className="modal-poster-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <div className="modal-quick-stats">
                <div className="stat-row">
                  <span className="stat-name">Duration</span>
                  <span className="stat-val">{movie.duration}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-name">Language</span>
                  <span className="stat-val">{movie.language}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-name">Year</span>
                  <span className="stat-val">{movie.releaseYear}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-name">Base Price</span>
                  <span className="stat-val text-accent">₹{movie.ticketPrice}</span>
                </div>
              </div>
            </div>

            {/* Right: Info and Showtimes */}
            <div className="modal-info-col">
              <div className="modal-section">
                <h4 className="modal-subheading">Synopsis</h4>
                <p className="modal-synopsis">{movie.synopsis}</p>
              </div>

              <div className="modal-section">
                <h4 className="modal-subheading">Genres</h4>
                <div className="modal-genre-tags">
                  {movie.genre.map((g) => (
                    <span key={g} className="genre-tag">
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <div className="modal-crew-grid">
                <div>
                  <h4 className="modal-subheading">Director</h4>
                  <p className="crew-name">{movie.director}</p>
                </div>
                <div>
                  <h4 className="modal-subheading">Starring Cast</h4>
                  <p className="crew-name">{movie.cast.join(', ')}</p>
                </div>
              </div>

              {/* Showtimes & Booking Section */}
              <div className="modal-showtimes-box">
                <h4 className="modal-subheading">
                  <span className="icon-clock">🕒</span> Select Date & Showtime
                </h4>

                <div className="date-tabs">
                  {dates.map((d) => (
                    <button
                      key={d.label}
                      type="button"
                      className={`date-tab ${selectedDate === d.label ? 'active' : ''}`}
                      onClick={() => setSelectedDate(d.label)}
                    >
                      <span className="date-main">{d.label}</span>
                      <span className="date-sub">{d.sub}</span>
                    </button>
                  ))}
                </div>

                <div className="showtime-slots">
                  {(movie.showtimes || ['06:00 PM']).map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`showtime-slot ${selectedShowtime === slot ? 'active' : ''}`}
                      onClick={() => setSelectedShowtime(slot)}
                    >
                      <span className="slot-time">{slot}</span>
                      <span className="slot-type">Dolby 7.1</span>
                    </button>
                  ))}
                </div>

                <div className="modal-booking-bar">
                  <div className="booking-summary">
                    <span className="summary-date">
                      {selectedDate} at {selectedShowtime}
                    </span>
                    <span className="summary-price">
                      Standard Seat: ₹{movie.ticketPrice}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleProceedToSeats}
                  >
                    <span>Select Seats & Book</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}