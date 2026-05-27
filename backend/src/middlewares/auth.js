import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. Authorization token missing.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_phoenix_token_key_123!');
    req.admin = await Admin.findById(decoded.id).select('-password');
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Authorized admin record not found.' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid security token.' });
  }
};
