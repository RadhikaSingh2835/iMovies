import { GENRES } from '../data/movies';

export default function MovieFilters({
  searchQuery,
  onSearchChange,
  selectedGenre,
  onGenreChange,
  selectedLanguage,
  onLanguageChange,
  sortBy,
  onSortChange,
  totalResults,
  onResetFilters,
  apiStatus,
}) {
  return (
    <div className="filters-container" id="movies-section">
      <div className="filters-header">
        <div>
          <h2 className="section-heading">Now Showing & Upcoming</h2>
          <p className="section-subheading">
            Browse the latest blockbusters, select showtimes, and book tickets
          </p>
        </div>
        <div className="results-counter">
          {apiStatus && (
            <span className={`api-status-pill ${apiStatus.source || 'loading'}`} title={apiStatus.message}>
              <span className="api-dot"></span>
              {apiStatus.source === 'database'
                ? 'MongoDB Atlas'
                : apiStatus.source === 'sample_data'
                ? 'REST API (Sample Data)'
                : 'Offline Mode'}
            </span>
          )}
          <span className="counter-pill">{totalResults} Movies Available</span>
        </div>
      </div>

      <div className="filters-bar">
        {/* Search Input */}
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search by movie title, cast, or director..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Language Filter */}
        <div className="filter-select-group">
          <label className="select-label" htmlFor="lang-select">Language:</label>
          <select
            id="lang-select"
            className="filter-select"
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
          >
            <option value="All">All Languages</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
          </select>
        </div>

        {/* Sort By Filter */}
        <div className="filter-select-group">
          <label className="select-label" htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            className="filter-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="rating">Top Rated ⭐</option>
            <option value="latest">Latest Release 📅</option>
            <option value="price-low">Price: Low to High 🏷️</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Genre Pills */}
      <div className="genre-scroll-wrapper">
        <div className="genre-pills">
          {GENRES.map((genre) => (
            <button
              key={genre}
              className={`genre-pill ${selectedGenre === genre ? 'active' : ''}`}
              onClick={() => onGenreChange(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
        {(searchQuery || selectedGenre !== 'All' || selectedLanguage !== 'All') && (
          <button className="reset-filter-btn" onClick={onResetFilters}>
            Reset Filters ↺
          </button>
        )}
      </div>
    </div>
  );
}
