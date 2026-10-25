import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // Check Authorization header for Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token || token.trim() === '') {
        return res.status(401).json({
          success: false,
          error: 'Access denied. Malformed authorization token.',
        });
      }

      // Verify token with JWT secret — must match the secret used to sign it.
      // JWT_SECRET must be set in environment variables; no hardcoded fallback.
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return res.status(500).json({
          success: false,
          error: 'Server misconfiguration: JWT_SECRET is not set.',
        });
      }
      const decoded = jwt.verify(token, jwtSecret);

      // Fetch user without password hash
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User associated with this token no longer exists.',
        });
      }

      // Attach user object to request
      req.user = user;
      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Authentication session expired. Please sign in again.',
        });
      }
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token.',
      });
    }
  }

  // No token provided
  return res.status(401).json({
    success: false,
    error: 'Access denied. Please provide a Bearer token in Authorization header.',
  });
};
