import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { io } from '../index'; // Need to export io from index.ts or just handle DB

const router = Router();
const prisma = new PrismaClient();

router.post('/send', async (req, res) => {
  try {
    const { messageText, audience } = req.body; // audience is 'all' or 'tags'
    
    // Fetch contacts
    let contacts = await prisma.contact.findMany();
    
    // In a real app, we'd filter by audience/tags here
    
    let sentCount = 0;
    
    // Send message to each contact
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
          text: messageText,
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

    res.json({ success: true, sentCount });
  } catch (error) {
    console.error('Error sending campaign:', error);
    res.status(500).json({ error: 'Failed to send campaign' });
  }
});

export const campaignsRouter = router;
