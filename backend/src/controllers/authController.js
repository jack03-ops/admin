import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';

// Generate JWT token utility
const generateToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || 'super_secret_phoenix_token_key_123!', 
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Admin login authentication gateway
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both username and password' });
    }

    // Locate administrative database entry
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid administrative security credentials' });
    }

    // Authenticate encrypted bcrypt passwords
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid administrative security credentials' });
    }

    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active admin context
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      admin: req.admin
    });
  } catch (error) {
    next(error);
  }
};
