import { useState, useMemo, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MovieFilters from "./components/MovieFilters";
import MovieGrid from "./components/MovieGrid";
import AuthModal from "./components/AuthModal";
import Footer from "./components/Footer";
import { SAMPLE_MOVIES } from "./data/movies";
import MovieDetailsModal from "./components/MovieDetailsModal";
import SeatSelectionModal from "./components/SeatSelectionModal";
import BookingConfirmationModal from "./components/BookingConfirmationModal";
import MyBookings from "./components/MyBookings";
import "./App.css";
import { apiUrl } from "./config/api";

export default function App() {
  const [moviesList, setMoviesList] = useState(SAMPLE_MOVIES);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState({
    connected: false,
    source: "loading",
    message: "Connecting to iMovies API...",
  });

  // Authentication State
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("imovies_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [toastMessage, setToastMessage] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [seatModalMovie, setSeatModalMovie] = useState(null);
  const [bookingDate, setBookingDate] = useState("Today");
  const [bookingShowtime, setBookingShowtime] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [currentView, setCurrentView] = useState("movies");
  // Auto-dismiss toast notification
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Verify stored JWT session with GET /api/auth/me on mount
  useEffect(() => {
    const token = localStorage.getItem("imovies_token");
    if (token) {
      fetch(apiUrl("/api/auth/me"), {
  headers: { Authorization: `Bearer ${token}` },
})
        .then((res) => {
          if (!res.ok) {
            // Token invalid or expired
            localStorage.removeItem("imovies_token");
            localStorage.removeItem("imovies_user");
            setUser(null);
          } else {
            return res.json();
          }
        })
        .then((data) => {
          if (data && data.success && data.user) {
            setUser(data.user);
          }
        })
        .catch(() => {
          // Keep existing cached user if offline
        });
    }
  }, []);

  // Fetch movies from Express REST API
  useEffect(() => {
    let isMounted = true;

    const fetchMoviesFromApi = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(apiUrl("/api/movies"));

        if (!res.ok) {
          throw new Error(`API responded with status: ${res.status}`);
        }

        const json = await res.json();

        if (
          isMounted &&
          json.success &&
          Array.isArray(json.data) &&
          json.data.length > 0
        ) {
          // Normalize items to ensure id property exists
          const normalized = json.data.map((m) => ({
            ...m,
            id: m.id || m._id,
          }));

          setMoviesList(normalized);
          setApiStatus({
            connected: true,
            source: json.source || "sample_data",
            message:
              json.source === "database"
                ? "Connected to MongoDB Atlas"
                : "API Active (Sample Data Fallback)",
          });
        }
      } catch (error) {
        console.warn(
          "iMovies API fetch error, using local fallback:",
          error.message,
        );
        if (isMounted) {
          setApiStatus({
            connected: false,
            source: "offline_fallback",
            message: "Server offline (Using local dataset)",
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

  // Authentication Handlers
  const handleOpenAuth = (mode = "login") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // AuthModal calls onAuthSuccess(data.user, data.token).
  // Token is already persisted to localStorage inside AuthModal before this fires.
  // We only need userData here to update React state.
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setToastMessage(`Welcome, ${userData.name}! You are now signed in.`);
  };

  const handleLogout = () => {
    localStorage.removeItem("imovies_token");
    localStorage.removeItem("imovies_user");
    setUser(null);
    setToastMessage("You have been signed out successfully.");
  };

  // Featured Hero movie (first blockbuster in list)
  const featuredMovie = moviesList[0] || SAMPLE_MOVIES[0];

  // Filter and sort movies dynamically
  const filteredMovies = useMemo(() => {
    return moviesList
      .filter((movie) => {
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
          selectedGenre === "All" || movie.genre.includes(selectedGenre);

        // Language matching
        const matchesLanguage =
          selectedLanguage === "All" ||
          movie.language.toLowerCase() === selectedLanguage.toLowerCase();

        return matchesSearch && matchesGenre && matchesLanguage;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "latest") return b.releaseYear - a.releaseYear;
        if (sortBy === "price-low") return a.ticketPrice - b.ticketPrice;
        if (sortBy === "title") return a.title.localeCompare(b.title);
        return 0;
      });
  }, [moviesList, searchQuery, selectedGenre, selectedLanguage, sortBy]);

  // Section smooth scrolling
  const handleNavigateSection = (sectionId) => {
    if (sectionId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (sectionId === "movies") {
      const el = document.getElementById("movies-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Reset filters handler
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedGenre("All");
    setSelectedLanguage("All");
    setSortBy("rating");
  };

  // Select movie & verify GET /api/movies/:id
  const handleSelectMovie = async (movie) => {
    setSelectedMovie(movie);

    try {
      const movieId = movie.id || movie._id;
      const res = await fetch(apiUrl(`/api/movies/${movieId}`));
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSelectedMovie((prev) =>
            prev && (prev.id === movieId || prev._id === movieId)
              ? { ...json.data, id: json.data.id || json.data._id }
              : prev,
          );
        }
      }
    } catch {
      // Keep existing movie state on network issue
    }
  };

  // Booking modal/notice trigger
  const handleBookClick = (movie) => {
    setBookingDate("Today");
    setBookingShowtime(movie.showtimes?.[0] || "06:00 PM");
    setSeatModalMovie(movie);
  };

  const handleBookWithShowtime = (movie, date, time) => {
    setSelectedMovie(null);
    setBookingDate(date);
    setBookingShowtime(time);
    setSeatModalMovie(movie);
  };

  return (
    <div className="app-container">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="toast-notification">
          <span className="toast-dot"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        user={user}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onNavigateView={setCurrentView}
        onNavigateSection={handleNavigateSection}
      />

      {currentView === "movies" ? (
        <main className="main-content">
          <Hero
            featuredMovie={featuredMovie}
            onSelectMovie={handleSelectMovie}
            onBookClick={handleBookClick}
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
      ) : (
        <MyBookings
          user={user}
          onOpenAuth={handleOpenAuth}
          onBackToMovies={() => setCurrentView("movies")}
        />
      )}

      {/* Movie Details Modal */}
      {selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onBookWithShowtime={handleBookWithShowtime}
        />
      )}

      {/* Auth Modal (Sign In / Register) */}
      {authModalOpen && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Seat Selection Modal */}
{seatModalMovie && (
  <SeatSelectionModal
    movie={seatModalMovie}
    initialDate={bookingDate}
    initialShowtime={bookingShowtime}
    user={user}
    onClose={() => setSeatModalMovie(null)}
    onOpenAuth={handleOpenAuth}
    onBookingSuccess={(booking) => {
      setSeatModalMovie(null);
      setConfirmedBooking(booking);
    }}
  />
)}

{/* Booking Confirmation Modal */}
{confirmedBooking && (
  <BookingConfirmationModal
    booking={confirmedBooking}
    onClose={() => setConfirmedBooking(null)}
    onViewBookings={() => {
      setConfirmedBooking(null);
      setCurrentView('my-bookings');
    }}
  />
)}

      {/* Footer */}
      <Footer
        onNavigateSection={handleNavigateSection}
      />
    </div>
  );
}
