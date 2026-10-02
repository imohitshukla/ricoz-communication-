import { Router } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// In-memory campaign store (persists per-process; replace with DB model if needed)
const campaigns: any[] = [];

// ── GET /api/campaigns ─────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const wsCampaigns = campaigns.filter(c => c.workspaceId === workspaceId);
    res.json(wsCampaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// ── POST /api/campaigns/broadcast ─────────────────────────────────────────
router.post('/broadcast', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { name, message, channel = 'whatsapp', contacts: contactList } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Resolve contacts: use provided phone numbers or all workspace contacts
    let targetContacts: any[];
    if (contactList && contactList.length > 0) {
      targetContacts = await prisma.contact.findMany({
        where: { workspaceId, phoneNumber: { in: contactList } }
      });
      // Create missing contacts on the fly
      for (const phone of contactList) {
        const exists = targetContacts.find(c => c.phoneNumber === phone);
        if (!exists) {
          const nc = await prisma.contact.create({
            data: { phoneNumber: phone, workspaceId }
          });
          targetContacts.push(nc);
        }
      }
    } else {
      targetContacts = await prisma.contact.findMany({ where: { workspaceId } });
    }

    let sentCount = 0;
    for (const contact of targetContacts) {
      let conversation = await prisma.conversation.findFirst({
        where: { contactId: contact.id, status: 'open' }
      });
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: { contactId: contact.id, channel, status: 'open' }
        });
      }

      const personalised = message
        .replace(/\{\{name\}\}/gi, contact.name || contact.phoneNumber)
        .replace(/\{\{1\}\}/g, contact.name || 'there');

      await prisma.message.create({
        data: { conversationId: conversation.id, text: personalised, sender: 'agent', status: 'sent', channel }
      });
      await prisma.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });
      sentCount++;
    }

    const campaign = {
      id: 'camp_' + Date.now(),
      workspaceId,
      name: name || 'Broadcast Campaign',
      message,
      channel,
      sentCount,
      status: 'sent',
      createdAt: new Date().toISOString()
    };
    campaigns.unshift(campaign);

    res.json({ success: true, ...campaign });
  } catch (error) {
    console.error('Error broadcasting campaign:', error);
    res.status(500).json({ error: 'Failed to broadcast campaign' });
  }
});

// ── POST /api/campaigns/send (legacy alias) ────────────────────────────────
router.post('/send', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { message, messageText, name } = req.body;
    const textToSend = message || messageText;

    if (!textToSend) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    const contacts = await prisma.contact.findMany({ where: { workspaceId } });
    let sentCount = 0;
    
    for (const contact of contacts) {
      let conversation = await prisma.conversation.findFirst({
        where: { contactId: contact.id, status: 'open' }
      });
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: { contactId: contact.id, channel: 'whatsapp', status: 'open' }
        });
      }
      await prisma.message.create({
        data: { conversationId: conversation.id, text: textToSend, sender: 'agent', status: 'sent' }
      });
      await prisma.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });
      sentCount++;
    }

    res.json({ success: true, sentCount, campaignName: name || 'Broadcast' });
  } catch (error) {
    console.error('Error sending campaign:', error);
    res.status(500).json({ error: 'Failed to send campaign' });
  }
});

export const campaignsRouter = router;
