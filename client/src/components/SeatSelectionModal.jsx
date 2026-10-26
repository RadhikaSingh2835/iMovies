import { useState, useEffect } from 'react';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
const SEATS_PER_ROW = 8;
const MAX_SEATS = 6;

export default function SeatSelectionModal({
  movie,
  initialDate = 'Today',
  initialShowtime = null,
  user,
  onClose,
  onBookingSuccess,
  onOpenAuth,
}) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedShowtime, setSelectedShowtime] = useState(
    initialShowtime || (movie?.showtimes && movie.showtimes[0]) || '06:00 PM'
  );
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [loadingOccupied, setLoadingOccupied] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const dates = [
    { label: 'Today', sub: '26 Oct' },
    { label: 'Tomorrow', sub: '27 Oct' },
    { label: 'Wed', sub: '28 Oct' },
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, submitting]);

  // Fetch occupied seats whenever movie, date, or showtime changes
  useEffect(() => {
    let isMounted = true;
    const fetchOccupied = async () => {
      if (!movie) return;
      try {
        setLoadingOccupied(true);
        setErrorMessage(null);
        setSelectedSeats([]);

        const movieId = movie.id || movie._id;
        const url = `/api/bookings/occupied?movieId=${encodeURIComponent(
          movieId
        )}&showDate=${encodeURIComponent(selectedDate)}&showtime=${encodeURIComponent(
          selectedShowtime
        )}`;

        const res = await fetch(url);
        const data = await res.json();

        if (isMounted) {
          if (res.ok && data.success && Array.isArray(data.data)) {
            setOccupiedSeats(data.data);
          } else {
            setOccupiedSeats([]);
          }
        }
      } catch (err) {
        if (isMounted) setOccupiedSeats([]);
      } finally {
        if (isMounted) setLoadingOccupied(false);
      }
    };

    fetchOccupied();

    return () => {
      isMounted = false;
    };
  }, [movie, selectedDate, selectedShowtime]);

  if (!movie) return null;

  const unitPrice = movie.ticketPrice || 250;
  const totalPrice = selectedSeats.length * unitPrice;

  const handleSeatClick = (seatId) => {
    if (occupiedSeats.includes(seatId) || submitting) return;

    setErrorMessage(null);

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= MAX_SEATS) {
        setErrorMessage(`You can select a maximum of ${MAX_SEATS} seats per booking.`);
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleConfirmBooking = async () => {
    setErrorMessage(null);

    if (selectedSeats.length === 0) {
      setErrorMessage('Please select at least one seat before proceeding.');
      return;
    }

    // Require sign-in to persist booking
    if (!user) {
      onOpenAuth('login');
      return;
    }

    const token = localStorage.getItem('imovies_token');
    if (!token) {
      onOpenAuth('login');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        movieId: movie.id || movie._id,
        movieTitle: movie.title,
        moviePoster: movie.poster,
        showDate: selectedDate,
        showtime: selectedShowtime,
        seats: selectedSeats,
        unitPrice,
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // Seat conflict (409) or other validation error
        if (res.status === 409 && Array.isArray(data.conflictedSeats)) {
          setOccupiedSeats((prev) => [...new Set([...prev, ...data.conflictedSeats])]);
          setSelectedSeats((prev) => prev.filter((s) => !data.conflictedSeats.includes(s)));
        }
        throw new Error(data.error || 'Failed to complete booking.');
      }

      onBookingSuccess(data.data);
    } catch (err) {
      setErrorMessage(err.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="seat-modal-window" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        {/* Modal Header */}
        <div className="seat-modal-header">
          <div className="seat-header-movie-info">
            <img
              src={movie.poster}
              alt={movie.title}
              className="seat-header-poster"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
              }}
            />
            <div>
              <span className="badge-pill">Screen 2 &bull; Dolby Atmos</span>
              <h2 className="seat-modal-title">{movie.title}</h2>
              <div className="seat-meta-inline">
                <span>⭐ {movie.rating}/10</span>
                <span>•</span>
                <span>{movie.duration}</span>
                <span>•</span>
                <span>{movie.language}</span>
                <span>•</span>
                <span className="seat-price-highlight">₹{unitPrice}/seat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Showtime & Date Controls */}
        <div className="seat-controls-row">
          <div className="seat-control-group">
            <span className="control-label">Date:</span>
            <div className="seat-date-chips">
              {dates.map((d) => (
                <button
                  key={d.label}
                  type="button"
                  className={`seat-chip ${selectedDate === d.label ? 'active' : ''}`}
                  onClick={() => setSelectedDate(d.label)}
                  disabled={submitting}
                >
                  <span className="chip-main">{d.label}</span>
                  <span className="chip-sub">{d.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="seat-control-group">
            <span className="control-label">Showtime:</span>
            <div className="seat-time-chips">
              {(movie.showtimes || ['06:00 PM']).map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`seat-chip ${selectedShowtime === slot ? 'active' : ''}`}
                  onClick={() => setSelectedShowtime(slot)}
                  disabled={submitting}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="auth-alert error seat-alert">
            <span className="alert-icon">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Cinema Curved Screen */}
        <div className="cinema-screen-area">
          <div className="screen-curve"></div>
          <span className="screen-text">ALL EYES THIS WAY • CINEMA SCREEN</span>
        </div>

        {/* Seat Layout Grid */}
        <div className="seat-map-wrapper">
          {loadingOccupied ? (
            <div className="seat-loading-state">
              <div className="spinner"></div>
              <span>Checking live seat availability...</span>
            </div>
          ) : (
            <div className="seat-grid">
              {ROWS.map((row) => (
                <div key={row} className="seat-row">
                  <span className="row-letter">{row}</span>

                  {/* Left Block (Seats 1-4) */}
                  <div className="seat-block">
                    {Array.from({ length: SEATS_PER_ROW / 2 }, (_, i) => {
                      const seatNum = i + 1;
                      const seatId = `${row}${seatNum}`;
                      const isOccupied = occupiedSeats.includes(seatId);
                      const isSelected = selectedSeats.includes(seatId);

                      let seatClass = 'seat-btn';
                      if (isOccupied) seatClass += ' occupied';
                      else if (isSelected) seatClass += ' selected';
                      else seatClass += ' available';

                      return (
                        <button
                          key={seatId}
                          type="button"
                          className={seatClass}
                          disabled={isOccupied || submitting}
                          onClick={() => handleSeatClick(seatId)}
                          title={
                            isOccupied
                              ? `Seat ${seatId} (Booked)`
                              : isSelected
                              ? `Seat ${seatId} (Selected)`
                              : `Seat ${seatId} (₹${unitPrice})`
                          }
                        >
                          {seatNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Aisle */}
                  <div className="seat-aisle"></div>

                  {/* Right Block (Seats 5-8) */}
                  <div className="seat-block">
                    {Array.from({ length: SEATS_PER_ROW / 2 }, (_, i) => {
                      const seatNum = i + 1 + SEATS_PER_ROW / 2;
                      const seatId = `${row}${seatNum}`;
                      const isOccupied = occupiedSeats.includes(seatId);
                      const isSelected = selectedSeats.includes(seatId);

                      let seatClass = 'seat-btn';
                      if (isOccupied) seatClass += ' occupied';
                      else if (isSelected) seatClass += ' selected';
                      else seatClass += ' available';

                      return (
                        <button
                          key={seatId}
                          type="button"
                          className={seatClass}
                          disabled={isOccupied || submitting}
                          onClick={() => handleSeatClick(seatId)}
                          title={
                            isOccupied
                              ? `Seat ${seatId} (Booked)`
                              : isSelected
                              ? `Seat ${seatId} (Selected)`
                              : `Seat ${seatId} (₹${unitPrice})`
                          }
                        >
                          {seatNum}
                        </button>
                      );
                    })}
                  </div>

                  <span className="row-letter">{row}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="seat-legend">
          <div className="legend-item">
            <span className="legend-box available"></span>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <span className="legend-box selected"></span>
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <span className="legend-box occupied"></span>
            <span>Occupied</span>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="seat-footer-bar">
          <div className="seat-calc-info">
            <div className="selected-seats-row">
              <span className="summary-label">Selected Seats:</span>
              <span className="summary-tags">
                {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected yet'}
              </span>
            </div>
            <div className="seat-price-breakdown">
              {selectedSeats.length > 0 ? (
                <span>
                  {selectedSeats.length} ticket(s) × ₹{unitPrice} ={' '}
                  <strong className="price-total">₹{totalPrice}</strong>
                </span>
              ) : (
                <span className="text-muted">Tap seats to select (up to {MAX_SEATS} seats)</span>
              )}
            </div>
          </div>

          <div className="seat-footer-actions">
            {!user && <span className="auth-hint">🔒 Sign in required to confirm</span>}
            <button
              type="button"
              className="btn-primary"
              disabled={selectedSeats.length === 0 || submitting}
              onClick={handleConfirmBooking}
            >
              {submitting ? (
                <span>Reserving Seats...</span>
              ) : !user ? (
                <span>Sign In & Book (₹{totalPrice})</span>
              ) : (
                <span>Confirm & Book (₹{totalPrice})</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}