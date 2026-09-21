import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { generateAgentResponse } from './aiService';

const prisma = new PrismaClient();

const messages = [
  "Hello, I need help with my order.",
  "Is this item back in stock?",
  "Thanks, I received it today!",
  "Do you ship internationally?",
  "What are your business hours?"
];

export function setupMockChannels(io: Server) {
  // Simulate incoming messages every 25 seconds
  setInterval(async () => {
    try {
      // Get all contacts
      const contacts = await prisma.contact.findMany();
      if (contacts.length === 0) return; // No contacts to message from

      const contact = contacts[Math.floor(Math.random() * contacts.length)];
      const text = messages[Math.floor(Math.random() * messages.length)];
      
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
      const message = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          text: text,
          sender: 'contact',
          status: 'delivered'
        }
      });

      // Update conversation updatedAt
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() }
      });

      const incomingMessageObj = {
        id: message.id,
        contactId: contact.id,
        conversationId: conversation.id,
        name: contact.name || contact.phoneNumber,
        text: message.text,
        time: message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: conversation.channel,
        sender: 'contact'
      };
      
      // Broadcast to all connected clients (Agents)
      io.emit('new_message', incomingMessageObj);
      console.log(`Mock channel emitted message from ${contact.name || contact.phoneNumber}`);

      // Auto-reply logic
      const rules = await prisma.autoReplyRule.findMany({ where: { isActive: true } });
      const matchedRule = rules.find(r => text.toLowerCase().includes(r.keyword.toLowerCase()));

      let replyTextToUse = '';

      if (matchedRule) {
        replyTextToUse = matchedRule.replyText;
        console.log(`Auto-reply match for keyword: ${matchedRule.keyword}`);
      } else {
        // Fallback to Smart AI Text Agent
        // Get last 5 messages for context
        const recentMessages = await prisma.message.findMany({
          where: { conversationId: conversation.id },
          orderBy: { timestamp: 'desc' },
          take: 5
        });
        const history = recentMessages.reverse().map(m => ({ text: m.text, sender: m.sender }));
        
        replyTextToUse = await generateAgentResponse(
          contact.name || contact.phoneNumber,
          text,
          history
        );
        console.log(`AI Text Agent generated response.`);
      }

      if (replyTextToUse) {
        // Wait a small delay to simulate typing
        setTimeout(async () => {
          const botMessage = await prisma.message.create({
            data: {
              conversationId: conversation.id,
              text: replyTextToUse,
              sender: 'bot',
              status: 'sent'
            }
          });

          await prisma.conversation.update({
            where: { id: conversation.id },
            data: { updatedAt: new Date() }
          });

          io.emit('new_message', {
            id: botMessage.id,
            contactId: contact.id,
            conversationId: conversation.id,
            name: 'Ricoz AI Agent',
            text: botMessage.text,
            time: botMessage.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            channel: conversation.channel,
            sender: 'bot'
          });
        }, 1500);
      }
    } catch (err) {
      console.error('Error in mock channel generator:', err);
    }
  }, 25000);
}
