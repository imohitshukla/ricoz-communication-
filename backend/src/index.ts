import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { prisma } from './db';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://ricoz-communication-74lg.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

export const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Also allow any vercel.app subdomains for preview deploys
    if (origin.endsWith('.vercel.app') || origin.endsWith('.railway.app')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf) => {
    (req as any).rawBody = buf;
  }
}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

import { contactsRouter } from './routes/contacts';
import { conversationsRouter } from './routes/conversations';
import { campaignsRouter } from './routes/campaigns';
import { rulesRouter } from './routes/rules';
import { analyticsRouter } from './routes/analytics';
import { aiRouter } from './routes/ai';
import { billingRouter } from './routes/billing';
import { whatsappRouter } from './routes/whatsapp';
import { teamRouter } from './routes/team';
import { commerceRouter } from './routes/commerce';
import { voiceRouter } from './routes/voice';
import { mediaRouter } from './routes/media';
import { rcsRouter } from './routes/rcs';
import { instagramRouter } from './routes/instagram';
import { integrationsRouter } from './routes/integrations';
import { smsRouter } from './routes/sms';
import authRoutes from './routes/auth';
import { emailRouter } from './routes/email';
import { testSmtpConnection } from './services/emailService';


// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ricoz Communication API is running' });
});

// Version endpoint
app.get('/api/version', (_req, res) => {
  res.json({
    version: '4.0.0',
    production: true,
    channels: ['whatsapp', 'instagram', 'sms', 'voice', 'rcs', 'email'],
    deployedAt: new Date().toISOString()
  });
});

// SMTP connection test endpoint  — GET /api/test-smtp
app.get('/api/test-smtp', async (_req, res) => {
  const result = await testSmtpConnection();
  res.status(result.success ? 200 : 500).json(result);
});

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactsRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/rules', rulesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/billing', billingRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/team', teamRouter);
app.use('/api/commerce', commerceRouter);
app.use('/api/voice', voiceRouter);
app.use('/api/media', mediaRouter);
app.use('/api/rcs', rcsRouter);
app.use('/api/instagram', instagramRouter);
app.use('/api/integrations', integrationsRouter);
app.use('/api/sms', smsRouter);
app.use('/api/email', emailRouter);




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
  console.log(`🚀 Ricoz Communication API v4.0.0 — Production Mode`);
  console.log(`   Server running on port ${PORT}`);
  console.log(`   Channels: WhatsApp | Instagram | SMS | Voice | RCS | Email`);
});
