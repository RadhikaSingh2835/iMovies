import { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieFilters from './components/MovieFilters';
import MovieGrid from './components/MovieGrid';
import MovieDetailsModal from './components/MovieDetailsModal';
import NotificationModal from './components/NotificationModal';
import Footer from './components/Footer';
import { SAMPLE_MOVIES } from './data/movies';
import './App.css';

export default function App() {
  const [moviesList, setMoviesList] = useState(SAMPLE_MOVIES);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState({
    connected: false,
    source: 'loading',
    message: 'Connecting to iMovies API...',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [noticeMessage, setNoticeMessage] = useState(null);

  // Fetch movies from Express REST API
  useEffect(() => {
    let isMounted = true;

    const fetchMoviesFromApi = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/movies');

        if (!res.ok) {
          throw new Error(`API responded with status: ${res.status}`);
        }

        const json = await res.json();

        if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
          // Normalize items to ensure id property exists
          const normalized = json.data.map((m) => ({
            ...m,
            id: m.id || m._id,
          }));

          setMoviesList(normalized);
          setApiStatus({
            connected: true,
            source: json.source || 'sample_data',
            message:
              json.source === 'database'
                ? 'Connected to MongoDB Atlas'
                : 'API Active (Sample Data Fallback)',
          });
        }
      } catch (error) {
        console.warn('iMovies API fetch error, using local fallback:', error.message);
        if (isMounted) {
          setApiStatus({
            connected: false,
            source: 'offline_fallback',
            message: 'Server offline (Using local dataset)',
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMoviesFromApi();

    return () => {
      isMounted = false;
    };
  }, []);

  // Featured Hero movie (first blockbuster in list)
  const featuredMovie = moviesList[0] || SAMPLE_MOVIES[0];

  // Filter and sort movies dynamically
  const filteredMovies = useMemo(() => {
    return moviesList.filter((movie) => {
      // Search matching (title, synopsis, cast, director)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        movie.title.toLowerCase().includes(q) ||
        movie.synopsis.toLowerCase().includes(q) ||
        movie.director.toLowerCase().includes(q) ||
        movie.cast.some((actor) => actor.toLowerCase().includes(q));

      // Genre matching
      const matchesGenre =
        selectedGenre === 'All' || movie.genre.includes(selectedGenre);

      // Language matching
      const matchesLanguage =
        selectedLanguage === 'All' || movie.language.toLowerCase() === selectedLanguage.toLowerCase();

      return matchesSearch && matchesGenre && matchesLanguage;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'latest') return b.releaseYear - a.releaseYear;
      if (sortBy === 'price-low') return a.ticketPrice - b.ticketPrice;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [moviesList, searchQuery, selectedGenre, selectedLanguage, sortBy]);

  // Section smooth scrolling
  const handleNavigateSection = (sectionId) => {
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId === 'movies') {
      const el = document.getElementById('movies-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Reset filters handler
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('All');
    setSelectedLanguage('All');
    setSortBy('rating');
  };

  // Select movie & verify GET /api/movies/:id
  const handleSelectMovie = async (movie) => {
    setSelectedMovie(movie);

    try {
      const movieId = movie.id || movie._id;
      const res = await fetch(`/api/movies/${movieId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSelectedMovie((prev) =>
            prev && (prev.id === movieId || prev._id === movieId)
              ? { ...json.data, id: json.data.id || json.data._id }
              : prev
          );
        }
      }
    } catch {
      // Keep existing movie state on network issue
    }
  };

  // Booking modal/notice trigger
  const handleBookClick = (movie) => {
    setNoticeMessage(
      `Booking seats for "${movie.title}" (₹${movie.ticketPrice}) will be activated in Phase 5 with real-time seat availability & selection grid!`
    );
  };

  // Showtime selection booking handler
  const handleBookWithShowtime = (movie, date, time) => {
    setSelectedMovie(null);
    setNoticeMessage(
      `Selected showtime: "${movie.title}" on ${date} at ${time}. The interactive cinema seat map will be activated in Phase 5!`
    );
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        onOpenNotice={(msg) => setNoticeMessage(msg)}
        onNavigateSection={handleNavigateSection}
      />

      <main className="main-content">
        {/* Spotlight Hero Banner */}
        <Hero
          featuredMovie={featuredMovie}
          onSelectMovie={handleSelectMovie}
          onOpenNotice={(msg) => setNoticeMessage(msg)}
        />

        {/* Discovery & Filters */}
        <MovieFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedGenre={selectedGenre}
          onGenreChange={setSelectedGenre}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalResults={filteredMovies.length}
          onResetFilters={handleResetFilters}
          apiStatus={apiStatus}
        />

        {/* Movie Cards Grid */}
        <section className="movie-grid-section">
          <MovieGrid
            movies={filteredMovies}
            isLoading={isLoading}
            onSelectMovie={handleSelectMovie}
            onBookClick={handleBookClick}
            onResetFilters={handleResetFilters}
          />
        </section>
      </main>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onBookWithShowtime={handleBookWithShowtime}
        />
      )}

      {/* Feature / Phase Roadmap Notice */}
      {noticeMessage && (
        <NotificationModal
          notice={noticeMessage}
          onClose={() => setNoticeMessage(null)}
        />
      )}

      {/* Footer */}
      <Footer
        onNavigateSection={handleNavigateSection}
        onOpenNotice={(msg) => setNoticeMessage(msg)}
      />
    </div>
  );
}
