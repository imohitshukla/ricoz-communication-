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

// ── GET /api/campaigns/cascades ───────────────────────────────────────────
router.get('/cascades', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const rules = await prisma.cascadeRule.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(rules);
  } catch (error) {
    console.error('Error fetching cascade rules:', error);
    res.status(500).json({ error: 'Failed to fetch cascade rules' });
  }
});

// ── POST /api/campaigns/cascades ──────────────────────────────────────────
router.post('/cascades', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { 
      name, 
      primaryChannel = 'rcs', 
      primaryCondition = 'undelivered_or_unread',
      secondaryChannel = 'whatsapp', 
      secondaryCondition = 'failed',
      tertiaryChannel = 'voice', 
      timeoutMinutes = 5,
      messageText = 'Hi {{name}}, here is your urgent Ricoz update.'
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Cascade rule name is required' });
    }

    const rule = await prisma.cascadeRule.create({
      data: {
        name,
        primaryChannel,
        primaryCondition,
        secondaryChannel,
        secondaryCondition,
        tertiaryChannel,
        timeoutMinutes: parseInt(timeoutMinutes) || 5,
        messageText,
        workspaceId
      }
    });

    res.status(201).json(rule);
  } catch (error) {
    console.error('Error creating cascade rule:', error);
    res.status(500).json({ error: 'Failed to create cascade rule' });
  }
});

// ── DELETE /api/campaigns/cascades/:id ────────────────────────────────────
router.delete('/cascades/:id', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { id } = req.params;

    await prisma.cascadeRule.delete({
      where: { id, workspaceId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting cascade rule:', error);
    res.status(500).json({ error: 'Failed to delete cascade rule' });
  }
});

// ── POST /api/campaigns/cascades/simulate ─────────────────────────────────
router.post('/cascades/simulate', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { 
      ruleId, 
      contactPhone = '+1 (555) 019-2831', 
      contactName = 'Valued Customer',
      forceFailover = 'secondary' // 'primary_succeed', 'secondary', 'tertiary'
    } = req.body;

    const trace = [];
    const startTime = Date.now();

    // Step 1: Primary attempt (e.g. RCS)
    trace.push({
      step: 1,
      channel: 'Google RCS Business',
      status: forceFailover === 'primary_succeed' ? 'DELIVERED' : 'UNREACHABLE / TIMEOUT (5m)',
      icon: 'rcs',
      detail: forceFailover === 'primary_succeed' 
        ? 'Verified Carrier Handshake ACK: Message delivered to RCS-capable handset.' 
        : 'Handset does not support RCS or network timeout exceeded. Triggering Failover Cascade.',
      timestamp: new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });

    if (forceFailover === 'primary_succeed') {
      return res.json({
        success: true,
        finalStatus: 'DELIVERED_PRIMARY',
        deliveredVia: 'Google RCS',
        totalLatencyMs: 420,
        trace
      });
    }

    // Step 2: Secondary Failover (e.g. WhatsApp)
    const step2Time = startTime + 1200;
    const isStep2Success = forceFailover === 'secondary';

    trace.push({
      step: 2,
      channel: 'WhatsApp Cloud API',
      status: isStep2Success ? 'DELIVERED & READ' : 'FAILED (Unsubscribed / Opted-out)',
      icon: 'whatsapp',
      detail: isStep2Success 
        ? 'Failover Dispatched: Meta API confirmed delivery receipt and two blue ticks.' 
        : 'Recipient is not reachable on WhatsApp. Escalating to Tertiary Tier.',
      timestamp: new Date(step2Time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });

    if (isStep2Success) {
      // Update stats in rule if ruleId provided
      if (ruleId) {
        await prisma.cascadeRule.updateMany({
          where: { id: ruleId, workspaceId },
          data: { statsSent: { increment: 1 }, statsSecondary: { increment: 1 } }
        });
      }

      return res.json({
        success: true,
        finalStatus: 'DELIVERED_SECONDARY',
        deliveredVia: 'WhatsApp Cloud API',
        totalLatencyMs: 1480,
        trace
      });
    }

    // Step 3: Tertiary Failover (e.g. Voice Call / SMS)
    const step3Time = startTime + 2600;
    trace.push({
      step: 3,
      channel: 'AI Voice Cold Caller & Dispatcher',
      status: 'CALL COMPLETED & VOICE MEMO DELIVERED',
      icon: 'voice',
      detail: 'Telephony Carrier Connected: ElevenLabs neural voice answered, delivered notification and confirmed receipt.',
      timestamp: new Date(step3Time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });

    if (ruleId) {
      await prisma.cascadeRule.updateMany({
        where: { id: ruleId, workspaceId },
        data: { statsSent: { increment: 1 }, statsTertiary: { increment: 1 } }
      });
    }

    res.json({
      success: true,
      finalStatus: 'DELIVERED_TERTIARY',
      deliveredVia: 'AI Voice Dialer',
      totalLatencyMs: 2840,
      trace
    });

  } catch (error) {
    console.error('Cascade simulation error:', error);
    res.status(500).json({ error: 'Failed to run cascade simulation' });
  }
});

export const campaignsRouter = router;

