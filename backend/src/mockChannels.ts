import { Server } from 'socket.io';
import { prisma } from './db';
import { generateAgentResponse } from './aiService';

const messages = [
  "Hello, I need help with my order.",
  "Is this item back in stock?",
  "Thanks, I received it today!",
  "Do you ship internationally?",
  "What are your business hours?"
];

// Guard flag: prevents a new interval tick from firing if the previous one
// is still awaiting DB responses. This eliminates connection pool exhaustion (P2024).
let mockChannelRunning = false;

async function runMockChannelCycle(io: Server) {
  if (mockChannelRunning) return; // Skip tick if previous is still in-flight
  mockChannelRunning = true;

  try {
    // 1. Load a random contact (single query)
    const contacts = await prisma.contact.findMany({ take: 50 });
    if (contacts.length === 0) return;

    const contact = contacts[Math.floor(Math.random() * contacts.length)];
    const text = messages[Math.floor(Math.random() * messages.length)];

    // 2. Find or create conversation (sequential – avoids race conditions)
    let conversation = await prisma.conversation.findFirst({
      where: { contactId: contact.id, status: 'open' }
    });
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { contactId: contact.id, channel: 'whatsapp', status: 'open' }
      });
    }

    // 3. Persist incoming message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        text,
        sender: 'contact',
        status: 'delivered'
      }
    });

    // 4. Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    // 5. Emit to connected frontend clients
    io.emit('new_message', {
      id: message.id,
      contactId: contact.id,
      conversationId: conversation.id,
      name: contact.name || contact.phoneNumber,
      text: message.text,
      time: message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: conversation.channel,
      sender: 'contact'
    });
    console.log(`[MockChannel] Emitted from ${contact.name || contact.phoneNumber}`);

    // 6. Auto-reply logic (still sequential, no nested DB calls inside setTimeout)
    const rules = await prisma.autoReplyRule.findMany({ where: { isActive: true } });
    const matchedRule = rules.find(r => text.toLowerCase().includes(r.keyword.toLowerCase()));

    let replyText = '';
    if (matchedRule) {
      replyText = matchedRule.replyText;
      console.log(`[MockChannel] Auto-reply keyword hit: "${matchedRule.keyword}"`);
    } else {
      const recentMessages = await prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { timestamp: 'desc' },
        take: 5
      });
      const history = recentMessages.reverse().map(m => ({ text: m.text, sender: m.sender }));
      replyText = await generateAgentResponse(
        contact.name || contact.phoneNumber,
        text,
        history,
        contact.workspaceId
      );
      console.log(`[MockChannel] AI Agent generated response.`);
    }

    // 7. Persist bot reply after a simulated typing delay
    //    We schedule this outside the guard so the flag is released first.
    if (replyText) {
      const savedConvId = conversation.id;
      const savedContactId = contact.id;
      const savedChannel = conversation.channel;
      setTimeout(async () => {
        try {
          const botMsg = await prisma.message.create({
            data: {
              conversationId: savedConvId,
              text: replyText,
              sender: 'bot',
              status: 'sent'
            }
          });
          await prisma.conversation.update({
            where: { id: savedConvId },
            data: { updatedAt: new Date() }
          });
          io.emit('new_message', {
            id: botMsg.id,
            contactId: savedContactId,
            conversationId: savedConvId,
            name: 'Ricoz AI Agent',
            text: botMsg.text,
            time: botMsg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            channel: savedChannel,
            sender: 'bot'
          });
        } catch (replyErr) {
          console.error('[MockChannel] Bot reply error (isolated):', replyErr);
        }
      }, 2000);
    }

  } catch (err) {
    console.error('[MockChannel] Cycle error:', err);
  } finally {
    // Always release the guard so the next interval tick can proceed
    mockChannelRunning = false;
  }
}

export function setupMockChannels(io: Server) {
  // 45-second interval gives ample breathing room for the DB connection pool
  setInterval(() => runMockChannelCycle(io), 45000);
}

