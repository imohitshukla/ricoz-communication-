import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupMockChannels } from './mockChannels';

dotenv.config();

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

import { contactsRouter } from './routes/contacts';
import { conversationsRouter } from './routes/conversations';
import { campaignsRouter } from './routes/campaigns';
import { rulesRouter } from './routes/rules';
import { analyticsRouter } from './routes/analytics';
import authRoutes from './routes/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ricoz Communication API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactsRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/rules', rulesRouter);
app.use('/api/analytics', analyticsRouter);

// Setup mock channels to emit random messages
setupMockChannels(io);

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('send_message', async (data) => {
    console.log('Received outbound message:', data);
    try {
      // Find or create conversation
      let conversation = await prisma.conversation.findFirst({
        where: { contactId: data.contactId, status: 'open' }
      });
      
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: { contactId: data.contactId, channel: data.channel || 'whatsapp' }
        });
      }

      // Create message in DB
      const message = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          text: data.text,
          sender: 'agent',
          status: 'sent'
        }
      });

      // Update conversation updatedAt
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() }
      });

      io.emit('new_message', {
        id: message.id,
        contactId: data.contactId, // Frontend needs contactId to route it to the right chat window
        conversationId: conversation.id,
        name: data.name,
        text: message.text,
        time: message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: conversation.channel,
        sender: message.sender
      });
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
