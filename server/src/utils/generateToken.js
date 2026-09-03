import jwt from 'jsonwebtoken';

export const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'crisisconnect_super_secure_jwt_secret_key_2026!';
  const expiresIn = process.env.JWT_EXPIRE || '30d';

  return jwt.sign({ id: userId, role }, secret, { expiresIn });
};
