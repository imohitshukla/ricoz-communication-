import { Router } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';
import { io } from '../index';
import axios from 'axios';
import { verifyMetaSignature } from '../middleware/metaWebhookAuth';

export const instagramRouter = Router();

const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID;

// Public webhook endpoint for Meta Instagram Webhooks
instagramRouter.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === (process.env.INSTAGRAM_VERIFY_TOKEN || 'ricoz_instagram_token')) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

instagramRouter.post('/webhook', verifyMetaSignature, async (req, res) => {
  res.sendStatus(200);
  const body = req.body;
  console.log('Incoming Instagram Webhook Event:', JSON.stringify(body).slice(0, 200));

  if (body.object === 'instagram' && body.entry) {
    try {
      for (const entry of body.entry) {
        const instagramAccountId = entry.id;

        // Map to workspace
        const integration = await prisma.channelIntegration.findFirst({
          where: { provider: 'instagram', instagramAccountId }
        });

        if (!integration) continue;

        // Handle direct messages
        if (entry.messaging) {
          for (const event of entry.messaging) {
            if (event.message && event.message.text) {
              const senderId = event.sender.id;
              const text = event.message.text;

              let contact = await prisma.contact.findFirst({
                where: { workspaceId: integration.workspaceId, phoneNumber: `ig_${senderId}` }
              });

              if (!contact) {
                contact = await prisma.contact.create({
                  data: {
                    phoneNumber: `ig_${senderId}`,
                    name: `IG User ${senderId}`,
                    workspaceId: integration.workspaceId
                  }
                });
              }

              let conversation = await prisma.conversation.findFirst({
                where: { contactId: contact.id, status: 'open' }
              });

              if (!conversation) {
                conversation = await prisma.conversation.create({
                  data: { contactId: contact.id, channel: 'instagram', status: 'open' }
                });
              }

              const msg = await prisma.message.create({
                data: {
                  conversationId: conversation.id,
                  text,
                  sender: 'contact',
                  status: 'delivered',
                  channel: 'instagram'
                }
              });

              await prisma.conversation.update({
                where: { id: conversation.id },
                data: { updatedAt: new Date() }
              });

              io.emit('new_message', {
                id: msg.id,
                contactId: contact.id,
                conversationId: conversation.id,
                name: contact.name,
                text: msg.text,
                time: msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                channel: 'instagram',
                sender: 'contact'
              });
            }
          }
        }

        // We can add comment handling under entry.changes here...
      }
    } catch (err) {
      console.error('Error processing IG webhook:', err);
    }
  }
});

// Authenticated routes
instagramRouter.use(authenticate);

/**
 * GET /api/instagram/rules - Fetch Comment-to-DM and Story Mention automation rules
 */
instagramRouter.get('/rules', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    let rules = await prisma.instagramRule.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    });

    if (rules.length === 0) {
      // Seed initial high-conversion Instagram rules
      const seedRules = [
        {
          triggerType: 'comment',
          keyword: 'PRICE',
          replyComment: 'Sent you all the pricing details & secret coupon in your DM! 📩 Check your requests.',
          dmResponse: 'Hey there! 👋 Saw you commented PRICE on our Reel. Here is the direct link with 30% off today: https://ricoz.io/pricing?ref=ig_reel',
          isActive: true,
          workspaceId
        },
        {
          triggerType: 'comment',
          keyword: 'DEMO',
          replyComment: 'Just dropped the demo access link right in your DM! 🚀',
          dmResponse: 'Hey! Thanks for your interest in Ricoz! Here is your exclusive 1-on-1 demo booking link: https://ricoz.io/demo',
          isActive: true,
          workspaceId
        },
        {
          triggerType: 'story_mention',
          keyword: '@mention',
          replyComment: null,
          dmResponse: '🔥 Thank you for tagging us in your story! You are awesome. Here is a $15 credit token on your next billing cycle: IG-STORY15',
          isActive: true,
          workspaceId
        }
      ];

      for (const r of seedRules) {
        await prisma.instagramRule.create({ data: r });
      }

      rules = await prisma.instagramRule.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json(rules);
  } catch (error) {
    console.error('Error fetching Instagram rules:', error);
    res.status(500).json({ error: 'Failed to fetch Instagram rules' });
  }
});

/**
 * POST /api/instagram/rules - Create or update automation rule
 */
instagramRouter.post('/rules', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { triggerType, keyword, replyComment, dmResponse, isActive } = req.body;

    if (!keyword || !dmResponse) {
      return res.status(400).json({ error: 'Keyword and DM response text are required' });
    }

    const rule = await prisma.instagramRule.create({
      data: {
        workspaceId,
        triggerType: triggerType || 'comment',
        keyword: keyword.trim().toUpperCase(),
        replyComment: replyComment || null,
        dmResponse,
        isActive: isActive !== false
      }
    });

    res.json(rule);
  } catch (error) {
    console.error('Error creating Instagram rule:', error);
    res.status(500).json({ error: 'Failed to create Instagram rule' });
  }
});

/**
 * POST /api/instagram/test-trigger - Live test simulation of Comment-to-DM or Story Mention
 */
instagramRouter.post('/test-trigger', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { username, commentText, triggerType } = req.body;

    const igUser = username || 'growth_founder';
    const text = (commentText || 'PRICE').toUpperCase();

    // Find matching rule
    const rules = await prisma.instagramRule.findMany({
      where: { workspaceId, isActive: true }
    });

    const match = rules.find(r => text.includes(r.keyword.toUpperCase())) || rules[0];

    // Find or create Contact
    let contact = await prisma.contact.findFirst({
      where: { workspaceId, phoneNumber: `@${igUser}` }
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          phoneNumber: `@${igUser}`,
          name: `${igUser} (Instagram)`,
          workspaceId
        }
      });
    }

    // Find or create Conversation
    let conversation = await prisma.conversation.findFirst({
      where: { contactId: contact.id, status: 'open' }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { contactId: contact.id, channel: 'instagram', status: 'open' }
      });
    }

    // 1. Inbound comment event
    const inboundMsg = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        text: `💬 [Post Comment] ${text}`,
        sender: 'contact',
        status: 'delivered',
        channel: 'instagram'
      }
    });

    // Broadcast comment
    io.emit('new_message', {
      id: inboundMsg.id,
      contactId: contact.id,
      conversationId: conversation.id,
      name: contact.name,
      text: inboundMsg.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: 'instagram',
      sender: 'contact'
    });

    // 2. Automated outbound DM response
    const dmText = match ? match.dmResponse : "Hey! Thanks for reaching out via Instagram. How can we help?";
    const outboundMsg = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        text: `📸 [Direct Message] ${dmText}`,
        sender: 'bot',
        status: 'sent',
        channel: 'instagram'
      }
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    // Broadcast DM
    io.emit('new_message', {
      id: outboundMsg.id,
      contactId: contact.id,
      conversationId: conversation.id,
      name: 'Ricoz Instagram Bot',
      text: outboundMsg.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: 'instagram',
      sender: 'bot'
    });

    res.json({
      success: true,
      matchedRule: match?.keyword,
      publicReply: match?.replyComment,
      dmSent: dmText,
      username: igUser,
      contactId: contact.id
    });
  } catch (error) {
    console.error('Error testing Instagram trigger:', error);
    res.status(500).json({ error: 'Failed to test trigger' });
  }
});

/**
 * POST /api/instagram/send-dm - Send direct message to Instagram lead
 */
instagramRouter.post('/send-dm', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { contactId, instagramHandle, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const integration = await prisma.channelIntegration.findFirst({
      where: { workspaceId, provider: 'instagram' }
    });

    let contact;
    if (contactId) {
      contact = await prisma.contact.findUnique({ where: { id: contactId } });
    } else if (instagramHandle) {
      const handle = instagramHandle.startsWith('@') ? instagramHandle : `@${instagramHandle}`;
      contact = await prisma.contact.findFirst({ where: { phoneNumber: handle, workspaceId } });
      if (!contact) {
        contact = await prisma.contact.create({
          data: { phoneNumber: handle, name: `${handle} (Instagram)`, workspaceId }
        });
      }
    }

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    let conversation = await prisma.conversation.findFirst({
      where: { contactId: contact.id, status: 'open' }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { contactId: contact.id, channel: 'instagram', status: 'open' }
      });
    }

    // Call Meta API if configured
    let externalStatus = 'sent';
    if (integration && integration.accessToken && integration.instagramAccountId) {
      try {
        // ID depends if it was created via webhook (`ig_<id>`)
        const recipientId = contact.phoneNumber.startsWith('ig_') ? contact.phoneNumber.split('_')[1] : null;
        if (recipientId) {
          await axios.post(
            `https://graph.facebook.com/v20.0/${integration.instagramAccountId}/messages`,
            {
              recipient: { id: recipientId },
              message: { text: message }
            },
            {
              headers: { Authorization: `Bearer ${integration.accessToken}` }
            }
          );
        }
      } catch (err: any) {
        console.error('Meta IG Send Error:', err.response?.data || err.message);
        externalStatus = 'failed';
      }
    }

    const savedMsg = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        text: message,
        sender: 'agent',
        status: externalStatus,
        channel: 'instagram'
      }
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    io.emit('new_message', {
      id: savedMsg.id,
      contactId: contact.id,
      conversationId: conversation.id,
      name: contact.name || contact.phoneNumber,
      text: savedMsg.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: 'instagram',
      sender: 'agent'
    });

    res.json({
      success: true,
      messageId: savedMsg.id,
      channel: 'instagram'
    });
  } catch (error) {
    console.error('Error sending Instagram DM:', error);
    res.status(500).json({ error: 'Failed to send Instagram DM' });
  }
});
