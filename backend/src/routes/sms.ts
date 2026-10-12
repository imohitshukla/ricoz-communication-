import { Router } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';
import { io } from '../index';
import { sendSms, isTwilioConfigured, validateTwilioSignature } from '../services/twilioService';

export const smsRouter = Router();

// -----------------------------------------------------------------
// PUBLIC — Inbound SMS Webhook (Twilio POST)
// -----------------------------------------------------------------
smsRouter.post('/webhook', async (req, res) => {
  // Validate Twilio signature in production
  const twilioSignature = req.headers['x-twilio-signature'] as string;
  if (isTwilioConfigured() && twilioSignature) {
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const isValid = validateTwilioSignature(fullUrl, req.body, twilioSignature);
    if (!isValid) {
      console.warn('[SMS Webhook] Invalid Twilio signature — rejecting');
      return res.status(403).send('Forbidden');
    }
  }

  const { From, To, Body, MessageSid, NumMedia, MediaUrl0, MediaContentType0 } = req.body;

  console.log(`[SMS Inbound] From: ${From} | Body: "${Body}" | SID: ${MessageSid}`);

  // Acknowledge immediately
  res.type('text/xml');
  res.send('<Response></Response>');

  try {
    // Find workspace by matching Twilio phone number — use first workspace for now
    let workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await prisma.workspace.create({ data: { name: 'Default Workspace' } });
    }

    // Find or create contact
    let contact = await prisma.contact.findFirst({
      where: { workspaceId: workspace.id, phoneNumber: From },
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          phoneNumber: From,
          name: `SMS ${From}`,
          workspaceId: workspace.id,
        },
      });
    }

    // Find or create open conversation
    let conversation = await prisma.conversation.findFirst({
      where: { contactId: contact.id, status: 'open' },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { contactId: contact.id, channel: 'sms', status: 'open' },
      });
    }

    // Handle media attachments
    let messageText = Body || '';
    if (parseInt(NumMedia || '0') > 0 && MediaUrl0) {
      messageText += messageText ? `\n[Media: ${MediaContentType0}] ${MediaUrl0}` : `[Media: ${MediaContentType0}] ${MediaUrl0}`;
    }

    // Save message
    const savedMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        text: messageText,
        sender: 'contact',
        status: 'delivered',
        channel: 'sms',
        mediaUrl: MediaUrl0 || null,
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // Emit real-time to dashboard
    io.emit('new_message', {
      id: savedMessage.id,
      contactId: contact.id,
      conversationId: conversation.id,
      name: contact.name || From,
      text: savedMessage.text,
      time: savedMessage.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: 'sms',
      sender: 'contact',
    });

    // Auto-reply check
    const rules = await prisma.autoReplyRule.findMany({ where: { isActive: true } });
    const matchedRule = rules.find(r => messageText.toLowerCase().includes(r.keyword.toLowerCase()));

    if (matchedRule) {
      setTimeout(async () => {
        // Send reply via Twilio SMS
        const smsResult = await sendSms({ to: From, body: matchedRule.replyText });

        const botMsg = await prisma.message.create({
          data: {
            conversationId: conversation!.id,
            text: matchedRule.replyText,
            sender: 'bot',
            status: smsResult.success ? 'delivered' : 'failed',
            channel: 'sms',
          },
        });

        io.emit('new_message', {
          id: botMsg.id,
          contactId: contact!.id,
          conversationId: conversation!.id,
          name: 'Ricoz SMS Bot',
          text: botMsg.text,
          time: botMsg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          channel: 'sms',
          sender: 'bot',
        });
      }, 1500);
    }
  } catch (err) {
    console.error('[SMS Webhook] Error:', err);
  }
});

// -----------------------------------------------------------------
// SMS Status Callback (delivery receipts)
// -----------------------------------------------------------------
smsRouter.post('/status', async (req, res) => {
  const { MessageSid, MessageStatus, To, ErrorCode } = req.body;
  console.log(`[SMS Status] ${MessageSid}: ${MessageStatus}${ErrorCode ? ` (Error: ${ErrorCode})` : ''}`);

  // Emit status update to frontend
  io.emit('sms_status_update', { messageSid: MessageSid, status: MessageStatus, to: To, errorCode: ErrorCode });

  res.sendStatus(200);
});

// -----------------------------------------------------------------
// AUTHENTICATED ROUTES
// -----------------------------------------------------------------
smsRouter.use(authenticate);

/**
 * POST /api/sms/send — Send an outbound SMS
 */
smsRouter.post('/send', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { to, text, contactId } = req.body;

    if (!to || !text) {
      return res.status(400).json({ error: 'Recipient phone (to) and text are required' });
    }

    // Send via Twilio
    const result = await sendSms({
      to,
      body: text,
      statusCallback: `${process.env.BACKEND_URL || 'https://your-api.railway.app'}/api/sms/status`,
    });

    // Save to DB
    let contact;
    if (contactId) {
      contact = await prisma.contact.findUnique({ where: { id: contactId } });
    } else {
      contact = await prisma.contact.findFirst({ where: { phoneNumber: to, workspaceId } });
      if (!contact) {
        contact = await prisma.contact.create({
          data: { phoneNumber: to, name: `SMS ${to}`, workspaceId },
        });
      }
    }

    if (contact) {
      let conversation = await prisma.conversation.findFirst({
        where: { contactId: contact.id, status: 'open' },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: { contactId: contact.id, channel: 'sms', status: 'open' },
        });
      }

      const savedMsg = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          text,
          sender: 'agent',
          status: result.success ? 'sent' : 'failed',
          channel: 'sms',
        },
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });

      io.emit('new_message', {
        id: savedMsg.id,
        contactId: contact.id,
        conversationId: conversation.id,
        name: contact.name || to,
        text: savedMsg.text,
        time: savedMsg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: 'sms',
        sender: 'agent',
      });
    }

    res.json({
      success: result.success,
      messageSid: result.messageSid,
      status: result.success ? 'dispatched_via_twilio' : 'failed',
      error: result.error,
    });
  } catch (error: any) {
    console.error('[SMS Send] Error:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

/**
 * POST /api/sms/broadcast — Broadcast SMS to all contacts (or filtered)
 */
smsRouter.post('/broadcast', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { text, tag, limit } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const contacts = await prisma.contact.findMany({
      where: { workspaceId },
      take: limit || 100,
    });

    let sent = 0;
    let failed = 0;

    for (const contact of contacts) {
      if (!contact.phoneNumber || contact.phoneNumber.startsWith('@') || contact.phoneNumber.startsWith('ig_')) {
        continue; // Skip non-phone contacts
      }

      const personalizedText = text.replace(/\{\{name\}\}/g, contact.name || 'there');
      const result = await sendSms({ to: contact.phoneNumber, body: personalizedText });

      if (result.success) {
        sent++;

        // Save to DB
        let conversation = await prisma.conversation.findFirst({
          where: { contactId: contact.id, status: 'open' },
        });
        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: { contactId: contact.id, channel: 'sms', status: 'open' },
          });
        }

        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            text: personalizedText,
            sender: 'agent',
            status: 'sent',
            channel: 'sms',
          },
        });
      } else {
        failed++;
      }
    }

    res.json({
      success: true,
      totalContacts: contacts.length,
      sent,
      failed,
      mode: isTwilioConfigured() ? 'live_twilio' : 'simulation',
    });
  } catch (error) {
    console.error('[SMS Broadcast] Error:', error);
    res.status(500).json({ error: 'Failed to broadcast SMS' });
  }
});

/**
 * GET /api/sms/settings — Get SMS channel configuration status
 */
smsRouter.get('/settings', (_req, res) => {
  res.json({
    configured: isTwilioConfigured(),
    mode: isTwilioConfigured() ? 'live' : 'simulation',
    features: ['send', 'receive', 'broadcast', 'auto_reply', 'media_mms', 'delivery_receipts'],
  });
});
