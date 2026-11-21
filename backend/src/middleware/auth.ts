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
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; workspaceId?: string; role?: string; email?: string };

    if (decoded.workspaceId && decoded.role) {
      (req as any).user = { 
        id: decoded.userId, 
        workspaceId: decoded.workspaceId, 
        role: decoded.role,
        email: decoded.email
      };
      (req as any).workspaceId = decoded.workspaceId;
      return next();
    }

    // Lookup user if workspaceId or role wasn't embedded in token
    const dbUser = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!dbUser) {
      return res.status(401).json({ error: 'User not found' });
    }

    (req as any).user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      workspaceId: dbUser.workspaceId,
      role: dbUser.role || 'Agent'
    };
    (req as any).workspaceId = dbUser.workspaceId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
}

/**
 * Middleware to enforce role-based access control (RBAC)
 * e.g. requireRole(['Owner', 'Admin'])
 */
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;
    if (!userRole) {
      return res.status(403).json({ error: 'Access denied: role not resolved' });
    }

    const hasPermission = allowedRoles.some(
      (role) => role.toLowerCase() === userRole.toLowerCase()
    );

    if (!hasPermission) {
      return res.status(403).json({
        error: `Access denied: action requires one of [${allowedRoles.join(', ')}] role`
      });
    }

    next();
  };
}

