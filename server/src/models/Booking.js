import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    movieId: {
      type: String,
      required: true,
    },
    movieTitle: {
      type: String,
      required: true,
      trim: true,
    },
    moviePoster: {
      type: String,
      default: '',
    },
    showDate: {
      type: String,
      required: true,
      trim: true,
    },
    showtime: {
      type: String,
      required: true,
      trim: true,
    },
    seats: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0 && v.length <= 10;
        },
        message: 'A booking must contain between 1 and 10 seats.',
      },
    },
    seatCount: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

// Database-level uniqueness: prevents duplicate seat bookings for the same movie and showtime
// Compound index on multikey array field 'seats' rejects race conditions with E11000
bookingSchema.index(
  { movieId: 1, showDate: 1, showtime: 1, seats: 1 },
  { unique: true }
);

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

export default Booking;