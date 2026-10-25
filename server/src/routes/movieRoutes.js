import express from 'express';
import { getMovies, getMovieById } from '../controllers/movieController.js';

const router = express.Router();

// GET /api/movies
router.get('/', getMovies);

// GET /api/movies/:id
router.get('/:id', getMovieById);

export default router;
