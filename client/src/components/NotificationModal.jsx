import { useEffect } from 'react';

export default function NotificationModal({ notice, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!notice) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="notice-window" onClick={(e) => e.stopPropagation()}>
        <div className="notice-icon-bubble">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>

        <h3 className="notice-title">Feature Roadmap Notice</h3>
        <p className="notice-message">{notice}</p>

        <div className="notice-roadmap-box">
          <div className="roadmap-step done">
            <span className="step-badge">Phase 1</span>
            <span className="step-desc">Project & Server Health Check</span>
          </div>
          <div className="roadmap-step active">
            <span className="step-badge">Phase 2</span>
            <span className="step-desc">Cinematic Movie Browsing & Details (Active)</span>
          </div>
          <div className="roadmap-step next">
            <span className="step-badge">Phase 3</span>
            <span className="step-desc">MongoDB Models & APIs</span>
          </div>
          <div className="roadmap-step next">
            <span className="step-badge">Phase 4 & 5</span>
            <span className="step-desc">User Auth & Cinema Seat Grid Booking</span>
          </div>
        </div>

        <button className="btn-primary full-width" onClick={onClose}>
          Continue Exploring Movies
        </button>
      </div>
    </div>
  );
}
