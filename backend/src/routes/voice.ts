import { Router } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';

export const voiceRouter = Router();

// Public webhook for telephony provider (Twilio / Exotel / Plivo)
voiceRouter.post('/webhook', async (req, res) => {
  const { From, CallSid, Digits } = req.body;
  console.log(`Incoming Voice Call received from ${From}, CallSid: ${CallSid}`);

  // Fetch IVR welcome message
  let ivr = await prisma.iVRConfig.findFirst();
  const greeting = ivr?.welcomeMessage || "Thank you for calling Ricoz. Please state how we can help you today.";

  // Return standard TwiML voice response
  res.type('text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">${greeting}</Say>
    <Record maxLength="60" transcribe="true" />
</Response>`);
});

// Authenticated workspace routes
voiceRouter.use(authenticate);

// GET /api/voice/calls - Fetch call logs for workspace
voiceRouter.get('/calls', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;

    let calls = await prisma.callLog.findMany({
      where: { workspaceId },
      orderBy: { timestamp: 'desc' }
    });

    if (calls.length === 0) {
      // Seed default realistic call logs
      const defaultCalls = [
        { contactName: 'Alice Cooper', phoneNumber: '+1 (555) 234-5678', duration: '3m 45s', sentiment: 'Positive', type: 'incoming', transcript: 'Customer inquired about enterprise pricing and requested a live demo with the sales engineering team.' },
        { contactName: 'Unknown Caller', phoneNumber: '+1 (555) 987-6543', duration: '0m 45s', sentiment: 'Neutral', type: 'missed', transcript: 'Caller hung up before being transferred to an agent.' },
        { contactName: 'Charlie Davis', phoneNumber: '+1 (555) 345-6789', duration: '12m 10s', sentiment: 'Negative', type: 'outgoing', transcript: 'Follow-up regarding shipment delay. Issue resolved by issuing priority replacement with 15% discount.' }
      ];

      for (const c of defaultCalls) {
        await prisma.callLog.create({
          data: { ...c, workspaceId }
        });
      }

      calls = await prisma.callLog.findMany({
        where: { workspaceId },
        orderBy: { timestamp: 'desc' }
      });
    }

    res.json(calls);
  } catch (error) {
    console.error('Error fetching voice calls:', error);
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
});

// GET /api/voice/ivr-config - Get IVR settings
voiceRouter.get('/ivr-config', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;

    let ivr = await prisma.iVRConfig.findUnique({
      where: { workspaceId }
    });

    if (!ivr) {
      ivr = await prisma.iVRConfig.create({
        data: {
          workspaceId,
          welcomeMessage: 'Thank you for calling Ricoz. How may we assist you today?',
          aiPrompt: 'You are a friendly AI receptionist for Ricoz. Answer common inquiries and transfer to support if requested.',
          voiceGender: 'female',
          fallbackNumber: '+1 (800) 555-0199'
        }
      });
    }

    res.json(ivr);
  } catch (error) {
    console.error('Error fetching IVR config:', error);
    res.status(500).json({ error: 'Failed to fetch IVR configuration' });
  }
});

// POST /api/voice/ivr-config - Update IVR settings
voiceRouter.post('/ivr-config', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { welcomeMessage, aiPrompt, voiceGender, fallbackNumber } = req.body;

    const ivr = await prisma.iVRConfig.upsert({
      where: { workspaceId },
      update: {
        welcomeMessage,
        aiPrompt,
        voiceGender,
        fallbackNumber
      },
      create: {
        workspaceId,
        welcomeMessage: welcomeMessage || 'Thank you for calling Ricoz.',
        aiPrompt: aiPrompt || 'You are an AI receptionist.',
        voiceGender: voiceGender || 'female',
        fallbackNumber
      }
    });

    res.json(ivr);
  } catch (error) {
    console.error('Error updating IVR config:', error);
    res.status(500).json({ error: 'Failed to save IVR configuration' });
  }
});
