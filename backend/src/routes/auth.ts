import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev';

// @route   POST /api/auth/signup
// @desc    Register a new user
router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Provide a default workspace for now
    let workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: 'Default Workspace' }
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        workspaceId: workspace.id,
        role: 'Admin'
      }
    });

    // Create token
    const token = jwt.sign({ userId: user.id, workspaceId: user.workspaceId }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        workspaceId: user.workspaceId
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Check for user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Match password
    if (!user.password) {
      return res.status(400).json({ error: 'Invalid credentials. Please use OAuth if you created your account with Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign({ userId: user.id, workspaceId: user.workspaceId }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        workspaceId: user.workspaceId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user data
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        workspaceId: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/auth/social
// @desc    OAuth / Social Sign Up & Sign In for Google, Shopify, Tally
router.post('/social', async (req, res) => {

  const { provider, email, name, storeUrl, companyName } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required for social authentication' });
    }

    const userName = name || email.split('@')[0];
    const wsName = companyName || (storeUrl ? storeUrl.replace('.myshopify.com', '') : `${userName}'s Workspace`);

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
      include: { workspace: true }
    });

    let isNew = false;

    if (!user) {
      isNew = true;
      // Create new workspace
      const workspace = await prisma.workspace.create({
        data: {
          name: wsName,
          planTier: 'Free Trial',
          subscriptionStatus: 'trialing',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
      });

      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name: userName,
          role: 'Admin',
          workspaceId: workspace.id
        },
        include: { workspace: true }
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, workspaceId: user.workspaceId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      isNew,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        workspaceId: user.workspaceId
      }
    });
  } catch (error) {
    console.error('Social auth error:', error);
    res.status(500).json({ error: 'Failed to authenticate with ' + (provider || 'social provider') });
  }
});

export default router;

