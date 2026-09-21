import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all rules
router.get('/', async (req, res) => {
  try {
    const rules = await prisma.autoReplyRule.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(rules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
});

// Create a new rule
router.post('/', async (req, res) => {
  try {
    const { keyword, replyText } = req.body;
    const rule = await prisma.autoReplyRule.create({
      data: { keyword, replyText }
    });
    res.json(rule);
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(500).json({ error: 'Failed to create rule' });
  }
});

// Delete a rule
router.delete('/:id', async (req, res) => {
  try {
    await prisma.autoReplyRule.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting rule:', error);
    res.status(500).json({ error: 'Failed to delete rule' });
  }
});

// Toggle rule active status
router.put('/:id/toggle', async (req, res) => {
  try {
    const { isActive } = req.body;
    const rule = await prisma.autoReplyRule.update({
      where: { id: req.params.id },
      data: { isActive }
    });
    res.json(rule);
  } catch (error) {
    console.error('Error toggling rule:', error);
    res.status(500).json({ error: 'Failed to toggle rule' });
  }
});

export const rulesRouter = router;
