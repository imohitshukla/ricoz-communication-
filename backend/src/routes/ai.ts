import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// @route   GET /api/ai/config
// @desc    Get AI Agent Config for the user's workspace
router.get('/config', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Find user's workspace
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return res.status(404).json({ error: 'User not found' });

    let config = await prisma.aIAgentConfig.findUnique({
      where: { workspaceId: dbUser.workspaceId }
    });

    if (!config) {
      config = await prisma.aIAgentConfig.create({
        data: {
          workspaceId: dbUser.workspaceId,
          isActive: false,
          systemPrompt: "You are a helpful customer support agent for Ricoz."
        }
      });
    }

    res.json(config);
  } catch (error) {
    console.error('Get AI config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/ai/config
// @desc    Update AI Agent Config
router.post('/config', authenticate, async (req, res) => {
  const { isActive, systemPrompt, businessContext, faq } = req.body;

  try {
    const user = (req as any).user;
    
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return res.status(404).json({ error: 'User not found' });

    const config = await prisma.aIAgentConfig.upsert({
      where: { workspaceId: dbUser.workspaceId },
      update: {
        isActive,
        systemPrompt,
        businessContext,
        faq
      },
      create: {
        workspaceId: dbUser.workspaceId,
        isActive,
        systemPrompt: systemPrompt || "You are a helpful customer support agent for Ricoz.",
        businessContext,
        faq
      }
    });

    res.json(config);
  } catch (error) {
    console.error('Update AI config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export const aiRouter = router;
