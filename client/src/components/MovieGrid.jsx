import MovieCard from './MovieCard';

export default function MovieGrid({ movies, isLoading, onSelectMovie, onBookClick, onResetFilters }) {
  if (isLoading) {
    return (
      <div className="movie-grid">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="movie-card skeleton-card">
            <div className="skeleton-poster"></div>
            <div className="card-body">
              <div className="skeleton-line skeleton-meta"></div>
              <div className="skeleton-line skeleton-title"></div>
              <div className="skeleton-line skeleton-genres"></div>
              <div className="skeleton-line skeleton-footer"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="empty-movies-state">
        <div className="empty-icon">🎬</div>
        <h3 className="empty-title">No movies match your criteria</h3>
        <p className="empty-text">
          Try adjusting your search terms or genre filter to discover more titles.
        </p>
        <button className="btn-primary" onClick={onResetFilters}>
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onSelectMovie={onSelectMovie}
          onBookClick={onBookClick}
        />
      ))}
    </div>
  );
}
