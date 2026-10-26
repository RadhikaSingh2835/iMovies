export default function Footer({ onNavigateSection, onNavigateView }) {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand-col">
          <div className="brand">
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                <line x1="7" y1="2" x2="7" y2="22"></line>
                <line x1="17" y1="2" x2="17" y2="22"></line>
                <line x1="2" y1="12" x2="22" y2="12"></line>
              </svg>
            </div>
            <span className="brand-text">i<span className="brand-accent">Movies</span></span>
          </div>
          <p className="footer-tagline">
            Your premier cinematic movie ticketing experience. Browse movies, view real-time showtimes, and book your cinema seats effortlessly.
          </p>
          <div className="project-badge">
            🎓 College Course-Completion Project &bull; Oct 2026
          </div>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li>
              <button onClick={() => onNavigateSection('home')} className="footer-link-btn">
                Home Banner
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateSection('movies')} className="footer-link-btn">
                All Movies & Showtimes
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateView('my-bookings')} className="footer-link-btn">
                My Bookings
              </button>
            </li>
          </ul>
        </div>

        <div className="footer-tech-col">
          <h4 className="footer-heading">Architecture & Stack</h4>
          <div className="tech-badges-grid">
            <span className="tech-badge">React 19</span>
            <span className="tech-badge">Vite 8</span>
            <span className="tech-badge">Node.js</span>
            <span className="tech-badge">Express.js</span>
            <span className="tech-badge">MongoDB Atlas</span>
            <span className="tech-badge">JWT & bcrypt</span>
            <span className="tech-badge">Seat Booking Engine</span>
            <span className="tech-badge">CSS3 Dark</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} iMovies Web Application. Designed for college course completion.</p>
        <div className="footer-status-pill">
          <span className="status-dot"></span> Full-Stack Booking Active
        </div>
      </div>
    </footer>
  );
}