import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Initialize Database connection and start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 iMovies server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
    console.log(`📡 Health Check endpoint: http://localhost:${PORT}/api/health`);
  });
};

startServer();
