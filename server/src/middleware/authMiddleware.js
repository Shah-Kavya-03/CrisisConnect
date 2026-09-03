import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'crisisconnect_super_secure_jwt_secret_key_2026!');
      
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        // Mock fallback user if running demo without persistent DB
        req.user = {
          _id: decoded.id,
          id: decoded.id,
          role: decoded.role || 'Requester',
          name: 'Authorized User',
          trustScore: 90
        };
        return next();
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token validation failed'
      });
    }
  }

  if (!token) {
    // Check if demo bypass is active or allow demo fallback
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no bearer token provided'
    });
  }
};
