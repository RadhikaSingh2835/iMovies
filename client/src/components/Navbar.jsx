import { useState } from 'react';

export default function Navbar({ user, onOpenAuth, onLogout, onOpenNotice, onNavigateSection }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    }
  };

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Brand Logo */}
        <div className="brand" onClick={() => handleNavClick('home')} role="button" tabIndex={0}>
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
              <line x1="7" y1="2" x2="7" y2="22"></line>
              <line x1="17" y1="2" x2="17" y2="22"></line>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <line x1="2" y1="7" x2="7" y2="7"></line>
              <line x1="2" y1="17" x2="7" y2="17"></line>
              <line x1="17" y1="17" x2="22" y2="17"></line>
              <line x1="17" y1="7" x2="22" y2="7"></line>
            </svg>
          </div>
          <span className="brand-text">i<span className="brand-accent">Movies</span></span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="nav-links desktop-only">
          <button className="nav-btn active" onClick={() => handleNavClick('home')}>
            Home
          </button>
          <button className="nav-btn" onClick={() => handleNavClick('movies')}>
            Movies
          </button>
          <button
            className="nav-btn"
            onClick={() => onOpenNotice('My Bookings is part of Phase 5. In this phase you can explore movies, ratings, and showtimes!')}
          >
            My Bookings
            <span className="badge-pill">Phase 5</span>
          </button>
        </nav>

        {/* Auth CTA / User Account Section */}
        <div className="nav-actions desktop-only">
          {user ? (
            <div className="user-nav-box">
              <div className="user-badge" title={`Signed in as ${user.email}`}>
                <span className="user-avatar-icon">👤</span>
                <span className="user-greeting">Hi, {user.name.split(' ')[0]}</span>
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
              <button
                className="btn-outline-sm"
                onClick={() => onOpenAuth('login')}
              >
                Sign In
              </button>
              <button
                className="btn-primary-sm"
                onClick={() => onOpenAuth('register')}
              >
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

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <button className="mobile-nav-btn" onClick={() => handleNavClick('home')}>
            Home
          </button>
          <button className="mobile-nav-btn" onClick={() => handleNavClick('movies')}>
            All Movies
          </button>
          <button
            className="mobile-nav-btn"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenNotice('My Bookings is part of Phase 5.');
            }}
          >
            My Bookings <span className="badge-pill">Phase 5</span>
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
