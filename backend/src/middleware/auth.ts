import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  // Get token from header
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // Add user from payload
    (req as any).user = { id: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
}
