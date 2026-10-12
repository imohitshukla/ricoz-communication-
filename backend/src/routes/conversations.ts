import { Router } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';
import axios from 'axios';
import { sendSms } from '../services/twilioService';
import { sendRcsTextMessage } from '../services/rcsService';
import { sendEmail } from '../services/emailService';

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

    const channel = conversation.channel;
    
    // Find integration credentials for the specific channel
    const integration = await prisma.channelIntegration.findFirst({
      where: { workspaceId, provider: channel }
    });

    let externalStatus = 'sent';
    
    try {
      if (channel === 'whatsapp') {
        const token = integration?.accessToken || process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneId = integration?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
        if (token && phoneId) {
          await axios.post(
            `https://graph.facebook.com/v20.0/${phoneId}/messages`,
            {
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: conversation.contact.phoneNumber.replace(/[^0-9]/g, ''),
              type: 'text',
              text: { preview_url: false, body: text }
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
        }
      } else if (channel === 'instagram') {
        const token = integration?.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN;
        const accountId = integration?.instagramAccountId || process.env.INSTAGRAM_ACCOUNT_ID;
        const recipientId = conversation.contact.phoneNumber.startsWith('ig_') 
          ? conversation.contact.phoneNumber.split('_')[1] 
          : conversation.contact.phoneNumber;
          
        if (token && accountId && recipientId) {
          await axios.post(
            `https://graph.facebook.com/v20.0/${accountId}/messages`,
            {
              recipient: { id: recipientId },
              message: { text }
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
        }
      } else if (channel === 'sms') {
        const res = await sendSms({
          to: conversation.contact.phoneNumber,
          body: text,
        });
        if (!res.success) {
          console.warn('Twilio SMS outbound send warning:', res.error);
        }
      } else if (channel === 'rcs') {
        const res = await sendRcsTextMessage({
          phoneNumber: conversation.contact.phoneNumber,
          text,
        });
        if (!res.success) {
          console.warn('RCS outbound send warning:', res.error);
        }
      } else if (channel === 'email') {
        await sendEmail({
          to: conversation.contact.phoneNumber,
          subject: 'Support Response — Ricoz',
          html: `<div style="font-family:sans-serif;padding:16px;"><p>${text}</p></div>`,
        });
      }
    } catch (err: any) {
      console.error(`Live channel send error (${channel}):`, err.response?.data || err.message);
      externalStatus = 'failed';
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        text,
        sender,
        status: externalStatus,
        channel: channel
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


