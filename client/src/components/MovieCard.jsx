export default function MovieCard({ movie, onSelectMovie, onBookClick }) {
  const handleImageError = (e) => {
    // Elegant fallback SVG poster if image fails to load
    e.target.onerror = null;
    e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
  };

  return (
    <div className="movie-card">
      <div className="poster-wrapper" onClick={() => onSelectMovie(movie)}>
        <img
          src={movie.poster}
          alt={movie.title}
          className="movie-poster"
          loading="lazy"
          onError={handleImageError}
        />
        <div className="poster-overlay">
          <button className="overlay-btn" onClick={(e) => { e.stopPropagation(); onSelectMovie(movie); }}>
            Explore Showtimes
          </button>
        </div>
        {movie.badge && <span className="card-badge">{movie.badge}</span>}
        <div className="card-rating">
          ⭐ {movie.rating}
        </div>
      </div>

      <div className="card-body">
        <div className="card-meta">
          <span className="card-year">{movie.releaseYear}</span>
          <span className="meta-dot">•</span>
          <span className="card-lang">{movie.language}</span>
          <span className="meta-dot">•</span>
          <span className="card-dur">{movie.duration}</span>
        </div>

        <h3 className="card-title" onClick={() => onSelectMovie(movie)}>
          {movie.title}
        </h3>

        <div className="card-genres">
          {movie.genre.slice(0, 2).map((g) => (
            <span key={g} className="card-genre-tag">{g}</span>
          ))}
          {movie.genre.length > 2 && (
            <span className="card-genre-more">+{movie.genre.length - 2}</span>
          )}
        </div>

        <div className="card-footer">
          <div className="ticket-rate">
            <span className="rate-label">From</span>
            <span className="rate-value">₹{movie.ticketPrice}</span>
          </div>

          <div className="card-btn-group">
            <button
              className="btn-card-info"
              onClick={() => onSelectMovie(movie)}
              title="View synopsis and showtimes"
            >
              Info
            </button>
            <button
              className="btn-card-book"
              onClick={() => onBookClick(movie)}
            >
              Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
