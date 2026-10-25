import MovieCard from './MovieCard';

export default function MovieGrid({ movies, onSelectMovie, onBookClick, onResetFilters }) {
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
