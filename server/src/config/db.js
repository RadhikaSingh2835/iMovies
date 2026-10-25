import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️ MONGODB_URI is not defined in environment variables. Running in fallback/offline mode.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if MongoDB is not reachable
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.warn('ℹ️ Running in fallback mode. Persistent DB features require a valid MongoDB connection.');
    return false;
  }
};

export const getDBStatus = () => {
  return {
    connected: isConnected,
    readyState: mongoose.connection.readyState, // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  };
};
