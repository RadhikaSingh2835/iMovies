import mongoose from 'mongoose';
import Movie from '../models/Movie.js';
import { getDBStatus } from '../config/db.js';
import { SEED_MOVIES } from '../data/seedMovies.js';

// Auto-seed database if connected but empty
let isSeeded = false;
const ensureDatabaseSeeded = async () => {
  if (isSeeded) return;
  try {
    const count = await Movie.countDocuments();
    if (count === 0) {
      console.log('🌱 Database is empty. Seeding initial movie data...');
      // Strip mock string IDs so MongoDB generates proper ObjectId
      const moviesToInsert = SEED_MOVIES.map(({ id, ...movie }) => movie);
      await Movie.insertMany(moviesToInsert);
      console.log(`✅ Seeded ${moviesToInsert.length} movies into MongoDB.`);
    }
    isSeeded = true;
  } catch (err) {
    console.warn(`⚠️ Auto-seed check failed: ${err.message}`);
  }
};

/**
 * @desc   Get all movies with search, genre, language, and sort filters
 * @route  GET /api/movies
 * @access Public
 */
export const getMovies = async (req, res, next) => {
  try {
    const { search, genre, language, sortBy = 'rating' } = req.query;
    const dbStatus = getDBStatus();

    // 1. If MongoDB is connected, query the database
    if (dbStatus.connected) {
      await ensureDatabaseSeeded();

      const query = {};

      // Search filter (title, synopsis, director, or cast)
      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [
          { title: searchRegex },
          { synopsis: searchRegex },
          { director: searchRegex },
          { cast: searchRegex },
        ];
      }

      // Genre filter
      if (genre && genre !== 'All') {
        query.genre = genre;
      }

      // Language filter
      if (language && language !== 'All') {
        query.language = new RegExp(`^${language.trim()}$`, 'i');
      }

      // Sorting
      let sort = { rating: -1 };
      if (sortBy === 'latest') sort = { releaseYear: -1 };
      else if (sortBy === 'price-low') sort = { ticketPrice: 1 };
      else if (sortBy === 'title') sort = { title: 1 };

      const movies = await Movie.find(query).sort(sort);

      return res.status(200).json({
        success: true,
        count: movies.length,
        source: 'database',
        data: movies,
      });
    }

    // 2. If MongoDB is disconnected / unavailable, use curated in-memory fallback
    let filtered = [...SEED_MOVIES];

    // Search filter
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.synopsis.toLowerCase().includes(q) ||
          m.director.toLowerCase().includes(q) ||
          m.cast.some((actor) => actor.toLowerCase().includes(q))
      );
    }

    // Genre filter
    if (genre && genre !== 'All') {
      filtered = filtered.filter((m) => m.genre.includes(genre));
    }

    // Language filter
    if (language && language !== 'All') {
      filtered = filtered.filter(
        (m) => m.language.toLowerCase() === language.trim().toLowerCase()
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'latest') return b.releaseYear - a.releaseYear;
      if (sortBy === 'price-low') return a.ticketPrice - b.ticketPrice;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return b.rating - a.rating; // default: rating
    });

    return res.status(200).json({
      success: true,
      count: filtered.length,
      source: 'sample_data',
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get single movie by ID
 * @route  GET /api/movies/:id
 * @access Public
 */
export const getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !id.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Movie ID parameter is required',
      });
    }

    const cleanId = id.trim();
    const dbStatus = getDBStatus();

    // 1. If MongoDB is connected, query DB
    if (dbStatus.connected) {
      await ensureDatabaseSeeded();

      // Check if valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(cleanId)) {
        // Also check if matches sample id (e.g. 'mov-1')
        const sampleMatch = SEED_MOVIES.find((m) => m.id === cleanId);
        if (!sampleMatch) {
          return res.status(400).json({
            success: false,
            error: 'Invalid movie ID format',
          });
        }
      }

      let movie = null;
      if (mongoose.Types.ObjectId.isValid(cleanId)) {
        movie = await Movie.findById(cleanId);
      } else {
        movie = await Movie.findOne({ title: SEED_MOVIES.find((m) => m.id === cleanId)?.title });
      }

      if (!movie) {
        return res.status(404).json({
          success: false,
          error: `Movie with ID "${cleanId}" not found`,
        });
      }

      return res.status(200).json({
        success: true,
        source: 'database',
        data: movie,
      });
    }

    // 2. If MongoDB is disconnected / fallback mode
    const movie = SEED_MOVIES.find((m) => m.id === cleanId || m._id === cleanId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        error: `Movie with ID "${cleanId}" not found`,
      });
    }

    return res.status(200).json({
      success: true,
      source: 'sample_data',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};
