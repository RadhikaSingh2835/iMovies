import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT token.
// Requires JWT_SECRET to be set in environment variables — no insecure hardcoded fallback.
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'JWT_SECRET is not configured. Set it in your server .env file before running the auth service.'
    );
  }
  return jwt.sign(
    { id: userId },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Simple email regex for server validation
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * @desc   Register a new user
 * @route  POST /api/auth/register
 * @access Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Input presence validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields: name, email, and password.',
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.toLowerCase().trim();

    // 2. Format validations
    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Name must be at least 2 characters long.',
      });
    }

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.',
      });
    }

    // 3. Check for duplicate account
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists. Please sign in instead.',
      });
    }

    // 4. Create new user (password is automatically hashed via Mongoose pre-save hook)
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password,
    });

    // 5. Generate secure JWT token
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Authenticate user & obtain JWT token
 * @route  POST /api/auth/login
 * @access Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both email and password.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find user by normalized email
    const user = await User.findOne({ email: cleanEmail });

    // Use generic error message to prevent account enumeration
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    // Verify password match using bcrypt
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get authenticated user profile
 * @route  GET /api/auth/me
 * @access Private (Protected by JWT)
 */
export const getUserProfile = async (req, res) => {
  // req.user is attached by the 'protect' middleware
  return res.status(200).json({
    success: true,
    user: {
      id: req.user.id || req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    },
  });
};
