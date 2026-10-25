import express from 'express';
import cors from 'cors';
import { getDBStatus } from './config/db.js';

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

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to iMovies API Server',
    healthCheck: '/api/health',
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
    error: err.message || 'Internal Server Error',
  });
});

export default app;
