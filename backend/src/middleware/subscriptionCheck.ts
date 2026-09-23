import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const requireActiveSubscription = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { workspace: true }
    });

    if (!dbUser || !dbUser.workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const { subscriptionStatus, trialEndsAt, currentPeriodEnd } = dbUser.workspace;

    // Check if they are trialing and the trial hasn't expired
    if (subscriptionStatus === 'trialing') {
      const now = new Date();
      // If trialEndsAt is set and has passed, they are expired
      // (For this project, we'll assume a fresh account is a valid trial unless we set an expired date)
      if (trialEndsAt && now > trialEndsAt) {
        return res.status(402).json({ error: 'Trial expired. Payment required.' });
      }
      return next(); // Valid trial
    }

    // Check if they are active
    if (subscriptionStatus === 'active') {
      return next();
    }

    // Otherwise, past_due, canceled, unpaid, etc.
    return res.status(402).json({ error: 'Active subscription required. Payment required.' });
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
