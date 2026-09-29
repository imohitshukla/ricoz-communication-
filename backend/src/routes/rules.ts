import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

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

// Update a rule (full update)
router.put('/:id', async (req, res) => {
  try {
    const { keyword, replyText, isActive } = req.body;
    const rule = await prisma.autoReplyRule.update({
      where: { id: req.params.id },
      data: { keyword, replyText, isActive }
    });
    res.json(rule);
  } catch (error) {
    console.error('Error updating rule:', error);
    res.status(500).json({ error: 'Failed to update rule' });
  }
});

export const rulesRouter = router;
