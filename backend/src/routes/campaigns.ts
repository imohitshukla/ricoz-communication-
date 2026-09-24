import { Router } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// POST /api/campaigns/send - Broadcast message to contacts in workspace
router.post('/send', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { message, messageText, audience, name } = req.body;
    const textToSend = message || messageText;

    if (!textToSend) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    // Fetch only workspace contacts
    const contacts = await prisma.contact.findMany({
      where: { workspaceId }
    });
    
    let sentCount = 0;
    
    for (const contact of contacts) {
      // Find or create conversation
      let conversation = await prisma.conversation.findFirst({
        where: { contactId: contact.id, status: 'open' }
      });
      
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: { contactId: contact.id, channel: 'whatsapp', status: 'open' }
        });
      }

      // Create message in DB
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          text: textToSend,
          sender: 'agent',
          status: 'sent'
        }
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() }
      });
      
      sentCount++;
    }

    res.json({ 
      success: true, 
      sentCount,
      campaignName: name || 'Broadcast'
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    res.status(500).json({ error: 'Failed to send campaign' });
  }
});

export const campaignsRouter = router;

