import { Router } from 'express';
import { prisma } from '../db';
import { io } from '../index';
import { generateAgentResponse } from '../aiService';
import axios from 'axios';

export const whatsappRouter = Router();

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'ricoz_webhook_token';
const GRAPH_API_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

/**
 * @route   GET /api/whatsapp/webhook
 * @desc    Meta Webhook Verification handshake
 */
whatsappRouter.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
      console.log('WhatsApp Webhook verified successfully');
      return res.status(200).send(challenge);
    } else {
      console.warn('WhatsApp Webhook verification token mismatch');
      return res.sendStatus(403);
    }
  }
  res.sendStatus(400);
});

/**
 * @route   POST /api/whatsapp/webhook
 * @desc    Receive incoming WhatsApp messages, media, and status receipts
 */
whatsappRouter.post('/webhook', async (req, res) => {
  // Quickly acknowledge receipt to Meta to prevent retries
  res.sendStatus(200);

  const body = req.body;
  if (!body.object || !body.entry) return;

  try {
    for (const entry of body.entry) {
      for (const change of entry.changes || []) {
        const value = change.value;
        if (!value) continue;

        // 1. Process delivery / read status updates
        if (value.statuses && value.statuses.length > 0) {
          for (const statusObj of value.statuses) {
            console.log(`WhatsApp Status Update: Message ${statusObj.id} status is now ${statusObj.status}`);
          }
        }

        // 2. Process incoming messages
        if (value.messages && value.messages.length > 0) {
          const contactMetadata = value.contacts?.[0] || {};
          const customerName = contactMetadata.profile?.name || 'WhatsApp Customer';

          for (const message of value.messages) {
            const senderPhone = message.from;
            const messageText = message.text?.body || (message.type !== 'text' ? `[${message.type} attachment]` : '');
            
            console.log(`Inbound WhatsApp message from ${senderPhone} (${customerName}): ${messageText}`);

            // Find or associate workspace (default workspace if webhook isn't multi-account mapped yet)
            let workspace = await prisma.workspace.findFirst();
            if (!workspace) {
              workspace = await prisma.workspace.create({
                data: { name: 'Default Workspace' }
              });
            }

            // Find or create Contact
            let contact = await prisma.contact.findFirst({
              where: { workspaceId: workspace.id, phoneNumber: senderPhone }
            });

            if (!contact) {
              contact = await prisma.contact.create({
                data: {
                  phoneNumber: senderPhone,
                  name: customerName,
                  workspaceId: workspace.id
                }
              });
            } else if (!contact.name || contact.name === senderPhone) {
              await prisma.contact.update({
                where: { id: contact.id },
                data: { name: customerName }
              });
            }

            // Find or create open conversation
            let conversation = await prisma.conversation.findFirst({
              where: { contactId: contact.id, status: 'open' }
            });

            if (!conversation) {
              conversation = await prisma.conversation.create({
                data: {
                  contactId: contact.id,
                  channel: 'whatsapp',
                  status: 'open'
                }
              });
            }

            // Save incoming message in database
            const savedMessage = await prisma.message.create({
              data: {
                conversationId: conversation.id,
                text: messageText,
                sender: 'contact',
                status: 'delivered'
              }
            });

            await prisma.conversation.update({
              where: { id: conversation.id },
              data: { updatedAt: new Date() }
            });

            // Emit live real-time event to agent dashboards
            io.emit('new_message', {
              id: savedMessage.id,
              contactId: contact.id,
              conversationId: conversation.id,
              name: customerName,
              text: savedMessage.text,
              time: savedMessage.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              channel: 'whatsapp',
              sender: 'contact'
            });

            // Automated Auto-Reply / AI Agent response evaluation
            await handleAutoReply(workspace.id, contact, conversation, messageText);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error handling WhatsApp webhook payload:', error);
  }
});

/**
 * Handle auto-reply rule or Gemini AI Agent answer
 */
async function handleAutoReply(workspaceId: string, contact: any, conversation: any, incomingText: string) {
  try {
    // 1. Check auto-reply rules
    const rules = await prisma.autoReplyRule.findMany({ where: { isActive: true } });
    const matchedRule = rules.find(r => incomingText.toLowerCase().includes(r.keyword.toLowerCase()));

    let replyText = '';

    if (matchedRule) {
      replyText = matchedRule.replyText;
    } else {
      // 2. Fallback to Gemini AI Agent if active
      const recentMessages = await prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { timestamp: 'desc' },
        take: 5
      });
      const history = recentMessages.reverse().map(m => ({ text: m.text, sender: m.sender }));

      replyText = await generateAgentResponse(
        contact.name || contact.phoneNumber,
        incomingText,
        history,
        workspaceId
      );
    }

    if (replyText) {
      // Small delay for natural interaction
      setTimeout(async () => {
        // Save bot message in DB
        const botMessage = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            text: replyText,
            sender: 'bot',
            status: 'sent'
          }
        });

        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { updatedAt: new Date() }
        });

        // Broadcast to frontend
        io.emit('new_message', {
          id: botMessage.id,
          contactId: contact.id,
          conversationId: conversation.id,
          name: 'Ricoz AI Agent',
          text: botMessage.text,
          time: botMessage.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          channel: 'whatsapp',
          sender: 'bot'
        });

        // Dispatch outbound to WhatsApp Cloud API if credentials exist
        if (GRAPH_API_TOKEN && PHONE_NUMBER_ID) {
          try {
            await axios.post(
              `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
              {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: contact.phoneNumber,
                type: 'text',
                text: { preview_url: false, body: replyText }
              },
              {
                headers: {
                  Authorization: `Bearer ${GRAPH_API_TOKEN}`,
                  'Content-Type': 'application/json'
                }
              }
            );
          } catch (apiErr: any) {
            console.error('Meta Cloud API outbound error:', apiErr.response?.data || apiErr.message);
          }
        }
      }, 1000);
    }
  } catch (err) {
    console.error('Error in handleAutoReply:', err);
  }
}

/**
 * @route   POST /api/whatsapp/send
 * @desc    Send an outbound message via Meta Cloud API
 */
whatsappRouter.post('/send', async (req, res) => {
  const { to, text, contactId } = req.body;

  if (!to || !text) {
    return res.status(400).json({ error: 'Recipient phone (to) and text are required' });
  }

  try {
    let metaMessageId = 'mock_msg_' + Date.now();

    // Call Meta Cloud API if credentials are present
    if (GRAPH_API_TOKEN && PHONE_NUMBER_ID) {
      try {
        const response = await axios.post(
          `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
          {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'text',
            text: { preview_url: false, body: text }
          },
          {
            headers: {
              Authorization: `Bearer ${GRAPH_API_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );
        metaMessageId = response.data?.messages?.[0]?.id || metaMessageId;
      } catch (cloudErr: any) {
        console.error('Meta Cloud API error:', cloudErr.response?.data || cloudErr.message);
        return res.status(502).json({ 
          error: 'Meta Cloud API dispatch failed',
          details: cloudErr.response?.data || cloudErr.message
        });
      }
    } else {
      console.log(`[SIMULATED OUTBOUND WHATSAPP] To: ${to} | Body: "${text}"`);
    }

    res.json({
      success: true,
      messageId: metaMessageId,
      status: GRAPH_API_TOKEN ? 'dispatched_to_meta' : 'simulated'
    });
  } catch (error: any) {
    console.error('Send WhatsApp error:', error);
    res.status(500).json({ error: 'Failed to send WhatsApp message' });
  }
});

/**
 * @route   GET /api/whatsapp/templates
 * @desc    Fetch approved WhatsApp templates for broadcasting
 */
whatsappRouter.get('/templates', (req, res) => {
  const templates = [
    {
      id: 'welcome_lead',
      name: 'Welcome Lead',
      category: 'MARKETING',
      language: 'en_US',
      status: 'APPROVED',
      body: 'Hi {{1}}, thank you for contacting Ricoz! Our specialist will assist you shortly.'
    },
    {
      id: 'order_update',
      name: 'Order Confirmation',
      category: 'UTILITY',
      language: 'en_US',
      status: 'APPROVED',
      body: 'Hello {{1}}, your order #{{2}} of {{3}} has been confirmed and is being processed!'
    },
    {
      id: 'abandoned_cart',
      name: 'Cart Reminder',
      category: 'MARKETING',
      language: 'en_US',
      status: 'APPROVED',
      body: 'Hi {{1}}, you left items in your cart! Complete your purchase today for 10% off with code SAVE10.'
    },
    {
      id: 'appointment_reminder',
      name: 'Appointment Reminder',
      category: 'UTILITY',
      language: 'en_US',
      status: 'APPROVED',
      body: 'Hello {{1}}, this is a friendly reminder for your scheduled appointment on {{2}} at {{3}}.'
    }
  ];

  res.json(templates);
});
