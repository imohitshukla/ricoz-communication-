import { Router } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';
import { io } from '../index';
import {
  makeOutboundCall,
  getCallDetails,
  getCallRecordings,
  getTranscriptions,
  isTwilioConfigured,
  testTwilioConnection,
  validateTwilioSignature,
  getTwilioInfo,
} from '../services/twilioService';
import {
  textToSpeech,
  isElevenLabsConfigured,
  testElevenLabsConnection,
  getVoicePresets,
} from '../services/elevenLabsService';
import { generateAgentResponse } from '../aiService';
import fs from 'fs';
import path from 'path';

export const voiceRouter = Router();

// -----------------------------------------------------------------
// PUBLIC — Inbound Call Webhook (Twilio POST)
// -----------------------------------------------------------------
voiceRouter.post('/webhook', async (req, res) => {
  const { From, CallSid, Digits, CallStatus } = req.body;
  console.log(`[Voice Webhook] Inbound call from ${From}, CallSid: ${CallSid}, Status: ${CallStatus}`);

  let ivr = await prisma.iVRConfig.findFirst();
  const greeting = ivr?.welcomeMessage || 'Thank you for calling Ricoz. Please state how we can help you today.';

  // Record in DB
  try {
    let workspace = await prisma.workspace.findFirst();
    if (workspace) {
      await prisma.callLog.create({
        data: {
          contactName: `Caller ${From}`,
          phoneNumber: From || 'Unknown',
          duration: '0s',
          sentiment: 'Neutral',
          type: 'incoming',
          summary: `Inbound call received from ${From}`,
          workspaceId: workspace.id,
        },
      });
    }
  } catch (err) {
    console.error('[Voice Webhook] Error logging call:', err);
  }

  res.type('text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">${greeting}</Say>
    <Gather numDigits="1" action="/api/voice/gather" method="POST">
        <Say>Press 1 for Sales, Press 2 for Technical Support, or stay on the line for our AI Voice Assistant.</Say>
    </Gather>
    <Record maxLength="60" transcribe="true" transcribeCallback="/api/voice/transcription" />
</Response>`);
});

// -----------------------------------------------------------------
// IVR Gather handler
// -----------------------------------------------------------------
voiceRouter.post('/gather', async (req, res) => {
  const digit = req.body.Digits;
  const ivr = await prisma.iVRConfig.findFirst();
  const fallbackNumber = ivr?.fallbackNumber || '+18005550199';

  res.type('text/xml');
  if (digit === '1') {
    res.send(`<Response><Say>Connecting you to our enterprise sales engineering desk. Please hold.</Say><Dial>${fallbackNumber}</Dial></Response>`);
  } else if (digit === '2') {
    res.send(`<Response><Say>Connecting to 24/7 technical customer support.</Say><Dial>${fallbackNumber}</Dial></Response>`);
  } else {
    res.send(`<Response><Say>Connecting you to our AI Voice Assistant.</Say><Record maxLength="120" transcribe="true" transcribeCallback="/api/voice/transcription" /></Response>`);
  }
});

// -----------------------------------------------------------------
// Call Status Webhook (Twilio callback)
// -----------------------------------------------------------------
voiceRouter.post('/status', async (req, res) => {
  const { CallSid, CallStatus, CallDuration, From, To, RecordingUrl } = req.body;
  console.log(`[Voice Status] ${CallSid}: ${CallStatus} (Duration: ${CallDuration}s)`);

  io.emit('call_status_update', {
    callSid: CallSid,
    status: CallStatus,
    duration: CallDuration,
    from: From,
    to: To,
    recordingUrl: RecordingUrl,
  });

  res.sendStatus(200);
});

// -----------------------------------------------------------------
// Recording Status Webhook
// -----------------------------------------------------------------
voiceRouter.post('/recording-status', async (req, res) => {
  const { CallSid, RecordingSid, RecordingUrl, RecordingDuration, RecordingStatus } = req.body;
  console.log(`[Recording] ${RecordingSid} for call ${CallSid}: ${RecordingStatus} (${RecordingDuration}s)`);

  io.emit('recording_ready', {
    callSid: CallSid,
    recordingSid: RecordingSid,
    recordingUrl: RecordingUrl,
    duration: RecordingDuration,
  });

  res.sendStatus(200);
});

// -----------------------------------------------------------------
// Transcription Webhook
// -----------------------------------------------------------------
voiceRouter.post('/transcription', async (req, res) => {
  const { TranscriptionText, CallSid, TranscriptionStatus } = req.body;
  console.log(`[Transcription] Call ${CallSid}: "${TranscriptionText}"`);

  if (TranscriptionText) {
    io.emit('transcription_ready', {
      callSid: CallSid,
      text: TranscriptionText,
      status: TranscriptionStatus,
    });
  }

  res.sendStatus(200);
});

// -----------------------------------------------------------------
// AUTHENTICATED ROUTES
// -----------------------------------------------------------------
voiceRouter.use(authenticate);

/**
 * GET /api/voice/calls — Fetch call logs with recordings and transcripts
 */
voiceRouter.get('/calls', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const calls = await prisma.callLog.findMany({
      where: { workspaceId },
      orderBy: { timestamp: 'desc' },
    });
    res.json(calls);
  } catch (error) {
    console.error('Error fetching voice calls:', error);
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
});

/**
 * POST /api/voice/dial — Initiate a real outbound call via Twilio
 */
voiceRouter.post('/dial', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { phoneNumber, contactName, scriptGoal, voicePersona, useAiVoice } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required to place a call' });
    }

    const callerName = contactName || 'Prospect Lead';
    const persona = voicePersona || 'Rachel (B2B SaaS Closer)';
    const backendUrl = process.env.BACKEND_URL || 'https://your-api.railway.app';

    // If ElevenLabs is configured and AI voice is requested, generate speech first
    let aiAudioUrl = null;
    if (useAiVoice && isElevenLabsConfigured()) {
      const greeting = scriptGoal
        ? `Hi ${callerName}, this is a call from Ricoz regarding ${scriptGoal}. Do you have a quick moment?`
        : `Hi ${callerName}, this is Rachel calling from Ricoz. Did I catch you with 30 seconds?`;

      const ttsResult = await textToSpeech({
        text: greeting,
        voiceId: persona.toLowerCase().includes('josh') ? 'josh' : 'rachel',
      });

      if (ttsResult.success && ttsResult.audioBuffer) {
        // Save audio file for Twilio to play
        const filename = `ai_voice_${Date.now()}.mp3`;
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, ttsResult.audioBuffer);
        aiAudioUrl = `${backendUrl}/uploads/${filename}`;
      }
    }

    // Attempt real Twilio call
    if (isTwilioConfigured()) {
      const callResult = await makeOutboundCall({
        to: phoneNumber,
        statusCallbackUrl: `${backendUrl}/api/voice/status`,
        recordingCallbackUrl: `${backendUrl}/api/voice/recording-status`,
        twimlUrl: aiAudioUrl
          ? undefined // will use inline TwiML with Play
          : `${backendUrl}/api/voice/webhook`,
      });

      if (callResult.success) {
        // Log in DB
        await prisma.callLog.create({
          data: {
            contactName: callerName,
            phoneNumber,
            duration: '0s',
            sentiment: 'Neutral',
            type: 'cold_call',
            summary: `Outbound call to ${callerName}. Objective: ${scriptGoal || 'Lead qualification'}`,
            workspaceId,
          },
        });

        return res.json({
          success: true,
          callSid: callResult.callSid,
          phoneNumber,
          contactName: callerName,
          persona,
          status: 'ringing',
          mode: 'twilio_live',
          aiVoice: Boolean(aiAudioUrl),
        });
      } else {
        return res.status(502).json({
          error: 'Twilio call failed',
          details: callResult.error,
        });
      }
    }

    // Fallback: simulation mode
    const callSid = 'CA_SIM_' + Math.random().toString(36).substring(2, 12).toUpperCase();
    
    await prisma.callLog.create({
      data: {
        contactName: callerName,
        phoneNumber,
        duration: '0s',
        sentiment: 'Neutral',
        type: 'cold_call',
        summary: `[SIMULATED] Outbound call to ${callerName}. Objective: ${scriptGoal || 'Lead qualification'}`,
        workspaceId,
      },
    });

    res.json({
      success: true,
      callSid,
      phoneNumber,
      contactName: callerName,
      persona,
      status: 'ringing',
      mode: 'simulation',
      aiVoice: false,
      audioStreamUrl: 'https://actions.google.com/sounds/v1/telephones/telephone_ring.ogg',
    });
  } catch (error) {
    console.error('Error initiating voice call:', error);
    res.status(500).json({ error: 'Failed to dial number' });
  }
});

/**
 * GET /api/voice/call/:callSid — Get live call details from Twilio
 */
voiceRouter.get('/call/:callSid', async (req, res) => {
  try {
    const details = await getCallDetails(req.params.callSid);
    if (!details) {
      return res.status(404).json({ error: 'Call not found or Twilio not configured' });
    }
    res.json(details);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch call details' });
  }
});

/**
 * GET /api/voice/call/:callSid/recordings — Get call recordings
 */
voiceRouter.get('/call/:callSid/recordings', async (req, res) => {
  try {
    const recordings = await getCallRecordings(req.params.callSid);
    res.json(recordings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recordings' });
  }
});

/**
 * POST /api/voice/tts — Generate AI speech audio file
 */
voiceRouter.post('/tts', async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!isElevenLabsConfigured()) {
      return res.status(503).json({ error: 'ElevenLabs not configured — set ELEVENLABS_API_KEY' });
    }

    const result = await textToSpeech({ text, voiceId });
    if (!result.success || !result.audioBuffer) {
      return res.status(500).json({ error: result.error || 'TTS generation failed' });
    }

    // Save and return URL
    const filename = `tts_${Date.now()}.mp3`;
    const filepath = path.join(__dirname, '../../uploads', filename);
    fs.writeFileSync(filepath, result.audioBuffer);

    res.json({
      success: true,
      audioUrl: `/uploads/${filename}`,
      voiceId: voiceId || 'rachel',
      textLength: text.length,
    });
  } catch (error) {
    console.error('Error generating TTS:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

/**
 * GET /api/voice/voices — List available AI voices
 */
voiceRouter.get('/voices', (_req, res) => {
  res.json({
    presets: getVoicePresets(),
    elevenLabsConfigured: isElevenLabsConfigured(),
  });
});

/**
 * POST /api/voice/simulate-turn — Dynamic AI Speech Interaction for the Cold Calling & Dialer UI
 */
voiceRouter.post('/simulate-turn', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { contactName, phoneNumber, turnIndex, leadResponse, scriptObjective } = req.body;

    const name = contactName || 'Prospect';
    const step = turnIndex || 0;

    // Realistic multi-stage conversational cold-call flow
    const scriptFlow = [
      {
        speaker: 'AI Agent',
        text: `Hi ${name}, this is Rachel calling from Ricoz. Did I catch you with 30 seconds, or are you rushing out the door?`,
        sentiment: 'Neutral',
        callState: 'Opening Hook',
      },
      {
        speaker: 'Lead',
        text: "I have about a minute. What is this regarding?",
        sentiment: 'Curious',
        callState: 'Hook Accepted',
      },
      {
        speaker: 'AI Agent',
        text: `We help fast-growing teams automate 80% of customer conversations across WhatsApp, Instagram DMs, and RCS without hiring extra support reps. Teams usually cut lead response time from 45 minutes to 4 seconds.`,
        sentiment: 'Pitching',
        callState: 'Value Proposition',
      },
      {
        speaker: 'Lead',
        text: "We already use standard email and an offshore support team. How does this compare?",
        sentiment: 'Objection Handling',
        callState: 'Addressing Competitor/Alternative',
      },
      {
        speaker: 'AI Agent',
        text: `Great question! While email open rates hover around 15%, WhatsApp and RCS hit over 90% open rates with instant rich cards and interactive buttons. Plus, our AI cold caller and IVR handles peak hours automatically so your team only talks to pre-qualified buyers.`,
        sentiment: 'Positive',
        callState: 'Objection Resolved',
      },
      {
        speaker: 'Lead',
        text: "That sounds interesting. What does pricing look like?",
        sentiment: 'High Buyer Intent',
        callState: 'Closing Question',
      },
      {
        speaker: 'AI Agent',
        text: `It starts on a flexible self-serve tier with no lock-in contracts. Would you be open to a 10-minute walkthrough this Thursday at 11 AM so we can demonstrate it with your live accounts?`,
        sentiment: 'High Intent',
        callState: 'Call To Action',
      },
      {
        speaker: 'Lead',
        text: "Yes, Thursday at 11 AM works for me. Book it.",
        sentiment: 'Positive',
        callState: 'Demo Booked ✅',
      },
    ];

    const currentTurn = scriptFlow[Math.min(step, scriptFlow.length - 1)];

    // Generate AI voice audio if ElevenLabs is configured and it's an agent turn
    let audioUrl = null;
    if (isElevenLabsConfigured() && currentTurn.speaker === 'AI Agent') {
      const ttsResult = await textToSpeech({
        text: currentTurn.text,
        voiceId: 'rachel',
      });
      if (ttsResult.success && ttsResult.audioBuffer) {
        const filename = `call_turn_${step}_${Date.now()}.mp3`;
        const filepath = path.join(__dirname, '../../uploads', filename);
        fs.writeFileSync(filepath, ttsResult.audioBuffer);
        audioUrl = `/uploads/${filename}`;
      }
    }

    // If reaching the end, record in DB as CallLog
    if (step >= scriptFlow.length - 2) {
      await prisma.callLog.create({
        data: {
          contactName: name,
          phoneNumber: phoneNumber || '+1 (555) 019-8822',
          duration: '3m 15s',
          sentiment: 'Positive',
          type: 'cold_call',
          transcript: scriptFlow.map(t => `${t.speaker}: "${t.text}"`).join('\n\n'),
          summary: `AI Cold Call completed. Lead agreed to Thursday 11 AM demo. Objective: ${scriptObjective || 'Lead Qualification'}. Outcome: Demo Booked.`,
          workspaceId,
        },
      });
    }

    res.json({
      turn: currentTurn,
      nextTurnIndex: step + 1,
      isFinished: step >= scriptFlow.length - 1,
      demoBooked: step >= scriptFlow.length - 2,
      audioUrl,
    });
  } catch (error) {
    console.error('Error simulating call turn:', error);
    res.status(500).json({ error: 'Failed to process call turn' });
  }
});

/**
 * GET & POST /api/voice/coldcall/campaigns — Cold Calling Campaigns
 */
voiceRouter.get('/coldcall/campaigns', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    let campaigns = await prisma.coldCallCampaign.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });

    if (campaigns.length === 0) {
      const seedCampaign = await prisma.coldCallCampaign.create({
        data: {
          name: 'Q4 Enterprise SaaS Outbound Batch #1',
          status: 'running',
          totalLeads: 150,
          completedLeads: 84,
          bookedDemos: 19,
          voicePersona: 'ElevenLabs - Rachel (Warm B2B Closer)',
          scriptPrompt: 'Pitch the Ricoz Omnichannel WhatsApp, Instagram & RCS platform. Target VP of Marketing and Sales Ops.',
          leadsData: JSON.stringify([
            { name: 'Sarah Jenkins', phone: '+14158901234', company: 'TechScale', status: 'Booked' },
            { name: 'Marcus Vance', phone: '+15557890123', company: 'Vance Media', status: 'Interested' },
            { name: 'Elena Rostova', phone: '+12125559988', company: 'Alpha Group', status: 'Follow Up' },
            { name: 'Devon Miller', phone: '+13125553311', company: 'Miller Corp', status: 'Dialing' },
          ]),
          workspaceId,
        },
      });
      campaigns = [seedCampaign];
    }

    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching cold call campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

voiceRouter.post('/coldcall/campaigns', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { name, voicePersona, scriptPrompt, leads } = req.body;

    if (!name || !scriptPrompt) {
      return res.status(400).json({ error: 'Campaign name and script prompt are required' });
    }

    const campaign = await prisma.coldCallCampaign.create({
      data: {
        workspaceId,
        name,
        voicePersona: voicePersona || 'ElevenLabs - Rachel (Warm B2B Closer)',
        scriptPrompt,
        totalLeads: Array.isArray(leads) ? leads.length : 25,
        completedLeads: 0,
        bookedDemos: 0,
        status: 'running',
        leadsData: JSON.stringify(leads || [
          { name: 'Apex Logistics', phone: '+15552345678', status: 'Pending' },
          { name: 'CloudScale Inc', phone: '+15559876543', status: 'Pending' },
          { name: 'Summit Retail', phone: '+15558882211', status: 'Pending' },
        ]),
      },
    });

    res.json(campaign);
  } catch (error) {
    console.error('Error creating cold call campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

/**
 * POST /api/voice/coldcall/campaigns/:id/dial-next — Auto-dial next lead using Twilio
 */
voiceRouter.post('/coldcall/campaigns/:id/dial-next', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const campaign = await prisma.coldCallCampaign.findUnique({ where: { id: req.params.id } });

    if (!campaign || campaign.workspaceId !== workspaceId) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const leads = JSON.parse(campaign.leadsData || '[]');
    const nextLead = leads.find((l: any) => l.status === 'Pending' || l.status === 'Dialing');

    if (!nextLead) {
      return res.json({ success: false, message: 'No more leads to dial' });
    }

    nextLead.status = 'Dialing';
    const backendUrl = process.env.BACKEND_URL || 'https://your-api.railway.app';

    if (isTwilioConfigured()) {
      const callResult = await makeOutboundCall({
        to: nextLead.phone,
        statusCallbackUrl: `${backendUrl}/api/voice/status`,
        recordingCallbackUrl: `${backendUrl}/api/voice/recording-status`,
        machineDetection: true,
      });

      if (callResult.success) {
        nextLead.callSid = callResult.callSid;
        nextLead.status = 'Ringing';
      } else {
        nextLead.status = 'Failed';
        nextLead.error = callResult.error;
      }
    } else {
      nextLead.status = 'Simulated';
    }

    // Update campaign leads
    await prisma.coldCallCampaign.update({
      where: { id: campaign.id },
      data: {
        leadsData: JSON.stringify(leads),
        completedLeads: campaign.completedLeads + 1,
      },
    });

    res.json({
      success: true,
      lead: nextLead,
      mode: isTwilioConfigured() ? 'twilio_live' : 'simulation',
    });
  } catch (error) {
    console.error('Error dialing next lead:', error);
    res.status(500).json({ error: 'Failed to dial next lead' });
  }
});

/**
 * GET & POST /api/voice/ivr-config
 */
voiceRouter.get('/ivr-config', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    let ivr = await prisma.iVRConfig.findUnique({ where: { workspaceId } });

    if (!ivr) {
      ivr = await prisma.iVRConfig.create({
        data: {
          workspaceId,
          welcomeMessage: 'Thank you for calling Ricoz. How may we assist you today?',
          aiPrompt: 'You are a friendly AI receptionist for Ricoz. Answer common inquiries and transfer to support if requested.',
          voiceGender: 'female',
          fallbackNumber: '+1 (800) 555-0199',
        },
      });
    }

    res.json(ivr);
  } catch (error) {
    console.error('Error fetching IVR config:', error);
    res.status(500).json({ error: 'Failed to fetch IVR configuration' });
  }
});

voiceRouter.post('/ivr-config', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { welcomeMessage, aiPrompt, voiceGender, fallbackNumber } = req.body;

    const ivr = await prisma.iVRConfig.upsert({
      where: { workspaceId },
      update: { welcomeMessage, aiPrompt, voiceGender, fallbackNumber },
      create: {
        workspaceId,
        welcomeMessage: welcomeMessage || 'Thank you for calling Ricoz.',
        aiPrompt: aiPrompt || 'You are an AI receptionist.',
        voiceGender: voiceGender || 'female',
        fallbackNumber,
      },
    });

    res.json(ivr);
  } catch (error) {
    console.error('Error updating IVR config:', error);
    res.status(500).json({ error: 'Failed to save IVR configuration' });
  }
});

/**
 * GET /api/voice/settings — Voice channel configuration status
 */
voiceRouter.get('/settings', async (_req, res) => {
  const twilioInfo = getTwilioInfo();
  const elevenLabsConnected = isElevenLabsConfigured();

  res.json({
    twilio: twilioInfo,
    elevenLabs: {
      configured: elevenLabsConnected,
      mode: elevenLabsConnected ? 'live' : 'disabled',
      voicePresets: getVoicePresets(),
    },
    mode: twilioInfo.configured ? 'production' : 'simulation',
  });
});

/**
 * POST /api/voice/test-connection — Test Twilio & ElevenLabs connectivity
 */
voiceRouter.post('/test-connection', async (_req, res) => {
  const [twilioResult, elevenLabsResult] = await Promise.all([
    testTwilioConnection(),
    testElevenLabsConnection(),
  ]);

  res.json({
    twilio: twilioResult,
    elevenLabs: elevenLabsResult,
  });
});
