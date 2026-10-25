import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
      default: '',
    },
    synopsis: {
      type: String,
      required: [true, 'Movie synopsis is required'],
      trim: true,
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'A movie must have at least one genre',
      },
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be less than 0'],
      max: [10, 'Rating cannot be more than 10'],
      default: 0,
    },
    duration: {
      type: String,
      required: [true, 'Movie duration is required'],
      trim: true,
    },
    releaseYear: {
      type: Number,
      required: [true, 'Release year is required'],
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      trim: true,
      default: 'English',
    },
    director: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    cast: {
      type: [String],
      default: [],
    },
    poster: {
      type: String,
      required: [true, 'Movie poster URL is required'],
    },
    backdrop: {
      type: String,
      default: '',
    },
    badge: {
      type: String,
      trim: true,
      default: '',
    },
    ticketPrice: {
      type: Number,
      required: [true, 'Ticket price is required'],
      min: [0, 'Ticket price cannot be negative'],
      default: 200,
    },
    showtimes: {
      type: [String],
      default: ['10:00 AM', '01:30 PM', '05:00 PM', '08:45 PM'],
    },
  },
  {
    timestamps: true,
  }
);

// Virtual id field mapping for clean frontend compatibility
movieSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

movieSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    return ret;
  },
});

const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema);

export default Movie;
