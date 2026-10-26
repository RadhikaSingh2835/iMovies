import express from 'express';
import cors from 'cors';
import { getDBStatus } from './config/db.js';
import movieRoutes from './routes/movieRoutes.js';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    status: 'OK',
    service: 'iMovies API',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    database: {
      connected: dbStatus.connected,
      state: dbStatus.readyState === 1 ? 'Connected' : 'Disconnected / Fallback mode',
    },
  });
});

// API Routes
app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to iMovies API Server',
    healthCheck: '/api/health',
    endpoints: {
      movies: '/api/movies',
      movieById: '/api/movies/:id',
      authRegister: 'POST /api/auth/register',
      authLogin: 'POST /api/auth/login',
      authProfile: 'GET /api/auth/me',
    },
  });
});

// 404 Route Handler for undefined routes
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

export default app;
