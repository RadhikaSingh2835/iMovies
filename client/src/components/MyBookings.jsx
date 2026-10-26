import { useState, useEffect } from 'react';

export default function MyBookings({ user, onOpenAuth, onBackToMovies }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMyBookings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('imovies_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/bookings/my-bookings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (isMounted) {
          if (res.ok && data.success && Array.isArray(data.data)) {
            setBookings(data.data);
          } else {
            throw new Error(data.error || 'Failed to load bookings');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Could not load your bookings.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMyBookings();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="my-bookings-container">
        <div className="my-bookings-header">
          <button className="btn-back" onClick={onBackToMovies}>
            ← Back to Movies
          </button>
          <h1 className="section-heading">My Bookings</h1>
        </div>

        <div className="bookings-unauth-box">
          <div className="empty-icon">🔒</div>
          <h3 className="empty-title">Sign in to view your bookings</h3>
          <p className="empty-text">
            Your booked movie tickets and cinema showtime receipts are linked to your iMovies account.
          </p>
          <button className="btn-primary" onClick={() => onOpenAuth('login')}>
            Sign In to My Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings-container">
      <div className="my-bookings-header">
        <div>
          <button className="btn-back" onClick={onBackToMovies}>
            ← Back to Movies
          </button>
          <h1 className="section-heading">My Bookings</h1>
          <p className="section-subheading">
            Review your cinema seat reservations and access your e-tickets.
          </p>
        </div>
        <span className="counter-pill">{bookings.length} Tickets Found</span>
      </div>

      {error && (
        <div className="auth-alert error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {loading ? (
        <div className="bookings-grid">
          {[1, 2].map((n) => (
            <div key={n} className="booking-ticket-card skeleton-card">
              <div className="skeleton-line skeleton-title"></div>
              <div className="skeleton-line skeleton-meta"></div>
              <div className="skeleton-line skeleton-footer"></div>
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-movies-state">
          <div className="empty-icon">🎟️</div>
          <h3 className="empty-title">No Bookings Yet</h3>
          <p className="empty-text">
            You haven't reserved any cinema seats yet. Browse our movies and pick a showtime!
          </p>
          <button className="btn-primary" onClick={onBackToMovies}>
            Explore Now Showing Movies
          </button>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((b) => (
            <div key={b._id || b.bookingReference} className="booking-ticket-card">
              <div className="booking-ticket-top">
                <div className="booking-ref-block">
                  <span className="booking-ref-label">Ticket ID</span>
                  <span className="booking-ref-val">{b.bookingReference}</span>
                </div>
                <span className="booking-status-tag confirmed">Confirmed</span>
              </div>

              <div className="booking-ticket-content">
                <div className="booking-movie-details">
                  <h3 className="booking-movie-title">{b.movieTitle}</h3>
                  <p className="booking-cinema-sub">Screen 2 &bull; Dolby Atmos 7.1</p>
                </div>

                <div className="booking-details-grid">
                  <div className="booking-item">
                    <span className="item-label">Show Date</span>
                    <span className="item-val">{b.showDate}</span>
                  </div>
                  <div className="booking-item">
                    <span className="item-label">Showtime</span>
                    <span className="item-val">{b.showtime}</span>
                  </div>
                  <div className="booking-item">
                    <span className="item-label">Seats</span>
                    <div className="seats-pill-row">
                      {b.seats?.map((seat) => (
                        <span key={seat} className="ticket-seat-pill">
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="booking-item">
                    <span className="item-label">Total Paid</span>
                    <span className="item-val booking-price-val">₹{b.totalPrice}</span>
                  </div>
                </div>

                <div className="booking-ticket-footer">
                  <span className="booking-timestamp">
                    Booked on {new Date(b.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                  <button
                    type="button"
                    className="btn-print-ticket"
                    onClick={() => window.print()}
                    title="Print receipt / e-ticket"
                  >
                    🖨️ Print Ticket
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}