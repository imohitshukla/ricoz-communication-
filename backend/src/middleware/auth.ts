import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  // Get token from header
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; workspaceId?: string };

    if (decoded.workspaceId) {
      (req as any).user = { id: decoded.userId, workspaceId: decoded.workspaceId };
      return next();
    }

    // Lookup user if workspaceId wasn't embedded in token
    const dbUser = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!dbUser) {
      return res.status(401).json({ error: 'User not found' });
    }

    (req as any).user = {
      id: dbUser.id,
      email: dbUser.email,
      workspaceId: dbUser.workspaceId,
      role: dbUser.role
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
}

