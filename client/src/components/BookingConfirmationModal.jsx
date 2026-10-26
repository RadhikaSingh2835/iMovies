import { useEffect } from 'react';

export default function BookingConfirmationModal({ booking, onClose, onViewMyBookings }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!booking) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="confirm-modal-window" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div className="confirm-header">
          <div className="confirm-icon-bubble">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="28" height="28">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2 className="confirm-title">Booking Confirmed!</h2>
          <p className="confirm-subtitle">
            Your e-ticket has been generated. Present this reference number at the cinema box office.
          </p>
        </div>

        {/* Perforated Cinema Ticket */}
        <div className="e-ticket-card">
          <div className="ticket-top">
            <div className="ticket-ref-row">
              <span className="ticket-ref-label">Booking Reference</span>
              <span className="ticket-ref-number">{booking.bookingReference}</span>
            </div>
            <div className="ticket-badge-confirmed">CONFIRMED</div>
          </div>

          <div className="ticket-divider">
            <span className="notch-left"></span>
            <div className="perforated-line"></div>
            <span className="notch-right"></span>
          </div>

          <div className="ticket-body">
            <h3 className="ticket-movie-title">{booking.movieTitle}</h3>
            <p className="ticket-hall">Screen 2 &bull; Audi 4 &bull; Dolby Atmos</p>

            <div className="ticket-grid">
              <div className="ticket-grid-item">
                <span className="ticket-label">Date</span>
                <span className="ticket-val">{booking.showDate}</span>
              </div>
              <div className="ticket-grid-item">
                <span className="ticket-label">Time</span>
                <span className="ticket-val">{booking.showtime}</span>
              </div>
              <div className="ticket-grid-item">
                <span className="ticket-label">Seats ({booking.seatCount})</span>
                <span className="ticket-val ticket-seats">
                  {booking.seats?.join(', ')}
                </span>
              </div>
              <div className="ticket-grid-item">
                <span className="ticket-label">Total Amount</span>
                <span className="ticket-val ticket-total">₹{booking.totalPrice}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="confirm-actions">
          <button
            type="button"
            className="btn-primary full-width"
            onClick={onViewMyBookings}
          >
            View in My Bookings
          </button>
          <button
            type="button"
            className="btn-outline-sm full-width"
            onClick={onClose}
          >
            Continue Browsing Movies
          </button>
        </div>
      </div>
    </div>
  );
}