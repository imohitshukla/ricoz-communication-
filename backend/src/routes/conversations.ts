import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all conversations with contact details and latest message
router.get('/', async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        contact: true,
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages for a specific conversation
router.get('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { timestamp: 'asc' }
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create a new conversation for a contact (if none exists)
router.post('/', async (req, res) => {
  try {
    const { contactId, channel = 'whatsapp' } = req.body;
    
    // Check if open conversation already exists
    let conv = await prisma.conversation.findFirst({
      where: { contactId, status: 'open' }
    });

    if (!conv) {
      conv = await prisma.conversation.create({
        data: {
          contactId,
          channel,
          status: 'open'
        }
      });
    }

    res.json(conv);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

export const conversationsRouter = router;
