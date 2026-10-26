import { useState } from 'react';

export default function Navbar({
  user,
  currentView = 'movies',
  onOpenAuth,
  onLogout,
  onNavigateView,
  onNavigateSection,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleHomeClick = () => {
    setMobileMenuOpen(false);
    onNavigateView('movies');
    if (onNavigateSection) onNavigateSection('home');
  };

  const handleMoviesClick = () => {
    setMobileMenuOpen(false);
    onNavigateView('movies');
    if (onNavigateSection) onNavigateSection('movies');
  };

  const handleBookingsClick = () => {
    setMobileMenuOpen(false);
    if (!user) {
      onOpenAuth('login');
      return;
    }
    onNavigateView('my-bookings');
  };

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Brand Logo */}
        <div className="brand" onClick={handleHomeClick} role="button" tabIndex={0}>
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
              <line x1="7" y1="2" x2="7" y2="22"></line>
              <line x1="17" y1="2" x2="17" y2="22"></line>
              <line x1="2" y1="12" x2="22" y2="12"></line>
            </svg>
          </div>
          <span className="brand-text">i<span className="brand-accent">Movies</span></span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="nav-links desktop-only">
          <button
            className={`nav-btn ${currentView === 'movies' ? 'active' : ''}`}
            onClick={handleHomeClick}
          >
            Home
          </button>
          <button
            className={`nav-btn ${currentView === 'movies' ? 'active' : ''}`}
            onClick={handleMoviesClick}
          >
            Movies
          </button>
          <button
            className={`nav-btn ${currentView === 'my-bookings' ? 'active' : ''}`}
            onClick={handleBookingsClick}
          >
            My Bookings
          </button>
        </nav>

        {/* Auth CTA / User Account Section */}
        <div className="nav-actions desktop-only">
          {user ? (
            <div className="user-nav-box">
              <div className="user-badge" title={`Signed in as ${user.email}`}>
                <span className="user-avatar-icon">👤</span>
                <span className="user-greeting">Hi, {user.name ? user.name.split(' ')[0] : 'User'}</span>
              </div>
              <button
                className="btn-outline-sm btn-logout"
                onClick={onLogout}
                title="Sign out of your account"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <button className="btn-outline-sm" onClick={() => onOpenAuth('login')}>
                Sign In
              </button>
              <button className="btn-primary-sm" onClick={() => onOpenAuth('register')}>
                Register
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-toggle mobile-only"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <button className="mobile-nav-btn" onClick={handleHomeClick}>
            Home
          </button>
          <button className="mobile-nav-btn" onClick={handleMoviesClick}>
            All Movies
          </button>
          <button className="mobile-nav-btn" onClick={handleBookingsClick}>
            My Bookings
          </button>

          <div className="mobile-drawer-auth">
            {user ? (
              <div className="mobile-user-details">
                <div className="mobile-user-info">
                  <span className="mobile-user-name">👤 {user.name}</span>
                  <span className="mobile-user-email">{user.email}</span>
                </div>
                <button
                  className="btn-outline-sm full-width"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <button
                  className="btn-outline-sm full-width"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                >
                  Sign In
                </button>
                <button
                  className="btn-primary-sm full-width"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}