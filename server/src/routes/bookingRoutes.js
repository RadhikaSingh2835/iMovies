import express from 'express';
import jwt from 'jsonwebtoken';
import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';
import User from '../models/User.js';

const router = express.Router();

// Fallback in-memory storage if MongoDB is temporarily unreachable
const memoryBookings = [];

// JWT Authentication Guard
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token required. Please sign in to book tickets.',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'imovies_jwt_super_secret_dev_key_2026'
    );

    req.user = decoded;

    // Attach full database user if MongoDB is active
    if (User && User.db?.readyState === 1 && decoded.id) {
      const dbUser = await User.findById(decoded.id).select('-password');
      if (dbUser) req.user = dbUser;
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Session expired or invalid. Please sign in again.',
    });
  }
};

// Generate booking reference like IMV-482019
const generateBookingReference = () => {
  const timeSuffix = Date.now().toString().slice(-4);
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `IMV-${timeSuffix}${randomPart}`;
};

/**
 * @route   GET /api/bookings/occupied
 * @desc    Fetch already-booked seats for a movie, date, and showtime
 * @access  Public
 */
router.get('/occupied', async (req, res) => {
  try {
    const { movieId, showDate, showtime } = req.query;

    if (!movieId || !showDate || !showtime) {
      return res.status(400).json({
        success: false,
        error: 'Missing required query parameters: movieId, showDate, showtime',
      });
    }

    let occupiedSeats = [];

    if (Booking.db?.readyState === 1) {
      const bookings = await Booking.find({
        movieId: String(movieId),
        showDate: String(showDate),
        showtime: String(showtime),
        status: 'confirmed',
      }).select('seats');

      occupiedSeats = bookings.flatMap((b) => b.seats);
    } else {
      occupiedSeats = memoryBookings
        .filter(
          (b) =>
            b.movieId === String(movieId) &&
            b.showDate === String(showDate) &&
            b.showtime === String(showtime) &&
            b.status === 'confirmed'
        )
        .flatMap((b) => b.seats);
    }

    const uniqueOccupied = [...new Set(occupiedSeats)];

    res.json({
      success: true,
      data: uniqueOccupied,
      count: uniqueOccupied.length,
    });
  } catch (err) {
    console.error('Error fetching occupied seats:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve occupied seats' });
  }
});

/**
 * @route   POST /api/bookings
 * @desc    Create a new seat booking linked to authenticated user
 * @access  Private (Bearer JWT)
 */
router.post('/', protect, async (req, res) => {
  try {
    const { movieId, showDate, showtime, seats } = req.body;

    // 1. Input validations
    if (!movieId || !showDate || !showtime) {
      return res.status(400).json({
        success: false,
        error: 'Movie ID, show date, and showtime are required.',
      });
    }

    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please select at least one seat to book.',
      });
    }

    if (seats.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 seats allowed per booking.',
      });
    }

    // Validate seat formats (A1 to F8)
    const validSeatPattern = /^[A-F][1-8]$/;
    const formattedSeats = seats.map((s) => String(s).toUpperCase().trim());
    const invalidSeat = formattedSeats.find((s) => !validSeatPattern.test(s));

    if (invalidSeat) {
      return res.status(400).json({
        success: false,
        error: `Invalid seat identifier: "${invalidSeat}". Seats must be rows A-F and numbers 1-8.`,
      });
    }

    // Check for duplicate seat inputs in the same request
    const uniqueSeats = [...new Set(formattedSeats)];
    if (uniqueSeats.length !== formattedSeats.length) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate seat selections detected in request.',
      });
    }

    // 2. Movie lookup & price verification
    let movieTitle = req.body.movieTitle || 'Cinema Ticket';
    let moviePoster = req.body.moviePoster || '';
    let unitPrice = typeof req.body.unitPrice === 'number' ? req.body.unitPrice : 250;

    if (Movie.db?.readyState === 1) {
      const foundMovie = await Movie.findById(movieId).catch(() => null);
      if (foundMovie) {
        movieTitle = foundMovie.title;
        moviePoster = foundMovie.poster;
        unitPrice = foundMovie.ticketPrice;

        if (
          Array.isArray(foundMovie.showtimes) &&
          foundMovie.showtimes.length > 0 &&
          !foundMovie.showtimes.includes(showtime)
        ) {
          return res.status(400).json({
            success: false,
            error: `Showtime "${showtime}" is not offered for ${movieTitle}.`,
          });
        }
      }
    }

    // 3. Server-side authoritative price calculation
    const seatCount = uniqueSeats.length;
    const totalPrice = unitPrice * seatCount;

    // 4. Sequential check for existing bookings (application layer)
    if (Booking.db?.readyState === 1) {
      const conflictingBooking = await Booking.findOne({
        movieId: String(movieId),
        showDate: String(showDate),
        showtime: String(showtime),
        status: 'confirmed',
        seats: { $in: uniqueSeats },
      });

      if (conflictingBooking) {
        const overlap = uniqueSeats.filter((s) => conflictingBooking.seats.includes(s));
        return res.status(409).json({
          success: false,
          error: `Seat(s) ${overlap.join(', ')} were already booked. Please choose other seats.`,
          conflictedSeats: overlap,
        });
      }
    } else {
      const conflicting = memoryBookings.find(
        (b) =>
          b.movieId === String(movieId) &&
          b.showDate === String(showDate) &&
          b.showtime === String(showtime) &&
          b.status === 'confirmed' &&
          b.seats.some((s) => uniqueSeats.includes(s))
      );

      if (conflicting) {
        const overlap = uniqueSeats.filter((s) => conflicting.seats.includes(s));
        return res.status(409).json({
          success: false,
          error: `Seat(s) ${overlap.join(', ')} were already booked. Please choose other seats.`,
          conflictedSeats: overlap,
        });
      }
    }

    // 5. Build and save booking record
    const bookingReference = generateBookingReference();
    const userId = req.user._id || req.user.id;

    let savedBooking;

    if (Booking.db?.readyState === 1) {
      try {
        savedBooking = await Booking.create({
          bookingReference,
          userId,
          movieId: String(movieId),
          movieTitle,
          moviePoster,
          showDate: String(showDate),
          showtime: String(showtime),
          seats: uniqueSeats,
          seatCount,
          unitPrice,
          totalPrice,
          status: 'confirmed',
        });
      } catch (dbErr) {
        // Intercept concurrent double-booking error from MongoDB compound unique index
        if (dbErr.code === 11000) {
          return res.status(409).json({
            success: false,
            error: 'One or more of the selected seats were just reserved by another customer. Please choose different seats.',
          });
        }
        throw dbErr;
      }
    } else {
      savedBooking = {
        _id: 'mem_' + Date.now(),
        bookingReference,
        userId: String(userId),
        movieId: String(movieId),
        movieTitle,
        moviePoster,
        showDate: String(showDate),
        showtime: String(showtime),
        seats: uniqueSeats,
        seatCount,
        unitPrice,
        totalPrice,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };
      memoryBookings.push(savedBooking);
    }

    res.status(201).json({
      success: true,
      message: 'Tickets booked successfully!',
      data: savedBooking,
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to complete booking. Please try again.',
    });
  }
});

/**
 * @route   GET /api/bookings/my-bookings
 * @desc    Fetch only the logged-in user's bookings, newest first
 * @access  Private (Bearer JWT)
 */
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let userBookings = [];

    if (Booking.db?.readyState === 1) {
      userBookings = await Booking.find({ userId }).sort({ createdAt: -1 });
    } else {
      userBookings = memoryBookings
        .filter((b) => String(b.userId) === String(userId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({
      success: true,
      count: userBookings.length,
      data: userBookings,
    });
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve your bookings',
    });
  }
});

/**
 * @route   GET /api/bookings/:id
 * @desc    Get single booking receipt by ID
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let booking;

    if (Booking.db?.readyState === 1) {
      booking = await Booking.findOne({
        _id: req.params.id,
        userId,
      });
    } else {
      booking = memoryBookings.find(
        (b) => b._id === req.params.id && String(b.userId) === String(userId)
      );
    }

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve booking' });
  }
});

export default router;