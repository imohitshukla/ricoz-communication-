import { Router } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Get all conversations with contact details and latest message for current workspace
router.get('/', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;

    const conversations = await prisma.conversation.findMany({
      where: {
        contact: {
          workspaceId
        }
      },
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
    const workspaceId = (req as any).user.workspaceId;
    const { id } = req.params;

    // Verify conversation belongs to current workspace
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        contact: { workspaceId }
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

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
    const workspaceId = (req as any).user.workspaceId;
    const { contactId, channel = 'whatsapp' } = req.body;

    const contact = await prisma.contact.findFirst({
      where: { id: contactId, workspaceId }
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
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

// POST /api/conversations/:id/messages - Send a message from agent
router.post('/:id/messages', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { id } = req.params;
    const { text, sender = 'agent' } = req.body;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        contact: { workspaceId }
      },
      include: { contact: true }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        text,
        sender,
        status: 'sent'
      }
    });

    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error posting message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export const conversationsRouter = router;


