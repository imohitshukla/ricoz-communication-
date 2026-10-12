import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { testSmtpConnection, getEmailProviderInfo, sendEmail } from '../services/emailService';
import { testTwilioConnection, isTwilioConfigured, getTwilioInfo, sendSms, makeOutboundCall } from '../services/twilioService';
import { testRcsConnection, isRcsConfigured, getRcsInfo, sendRcsTextMessage } from '../services/rcsService';
import { testElevenLabsConnection, isElevenLabsConfigured } from '../services/elevenLabsService';
import { prisma } from '../db';
import axios from 'axios';

export const integrationsRouter = Router();

integrationsRouter.use(authenticate);

/**
 * GET /api/integrations — List all channel integrations from DB
 */
integrationsRouter.get('/', async (req, res) => {
  const workspaceId = (req as any).user.workspaceId;
  const integrations = await prisma.channelIntegration.findMany({
    where: { workspaceId },
  });
  res.json(integrations);
});

/**
 * GET /api/integrations/status
 * Returns real-time connection and credential status for all omnichannel services
 */
integrationsRouter.get('/status', async (req, res) => {
  const workspaceId = (req as any).user.workspaceId;

  // Check DB for integrations
  const integrations = await prisma.channelIntegration.findMany({
    where: { workspaceId },
  });

  const getIntegration = (provider: string) => integrations.find(i => i.provider === provider && i.isActive);

  const whatsappInt = getIntegration('whatsapp');
  const instagramInt = getIntegration('instagram');

  const whatsappToken = whatsappInt?.accessToken || process.env.WHATSAPP_ACCESS_TOKEN;
  const whatsappPhoneId = whatsappInt?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
  const whatsappConfigured = Boolean(whatsappToken && whatsappPhoneId);

  const instagramToken = instagramInt?.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN;
  const instagramAccountId = instagramInt?.instagramAccountId || process.env.INSTAGRAM_ACCOUNT_ID;
  const instagramConfigured = Boolean(instagramToken && instagramAccountId);

  const emailInfo = getEmailProviderInfo();
  const twilioInfo = getTwilioInfo();
  const rcsInfo = getRcsInfo();
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);

  res.json({
    channels: [
      {
        id: 'whatsapp',
        name: 'WhatsApp Cloud API',
        configured: whatsappConfigured,
        status: whatsappConfigured ? 'CONNECTED' : 'STANDBY',
        requires: ['Access Token', 'Phone Number ID', 'WABA ID'],
        category: 'Messaging',
        mode: whatsappConfigured ? 'live' : 'needs_credentials',
      },
      {
        id: 'instagram',
        name: 'Instagram Direct & Comments',
        configured: instagramConfigured,
        status: instagramConfigured ? 'CONNECTED' : 'STANDBY',
        requires: ['Access Token', 'Instagram Account ID'],
        category: 'Social',
        mode: instagramConfigured ? 'live' : 'needs_credentials',
      },
      {
        id: 'sms',
        name: 'SMS / MMS (Twilio)',
        configured: twilioInfo.configured,
        status: twilioInfo.configured ? 'CONNECTED' : 'STANDBY',
        requires: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'],
        category: 'Messaging',
        mode: twilioInfo.mode,
      },
      {
        id: 'voice',
        name: 'Voice Calls & Cold Calling (Twilio + ElevenLabs)',
        configured: twilioInfo.configured,
        status: twilioInfo.configured ? 'CONNECTED' : 'STANDBY',
        requires: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER', 'ELEVENLABS_API_KEY (optional)'],
        category: 'Telephony',
        mode: twilioInfo.mode,
        aiVoice: isElevenLabsConfigured(),
      },
      {
        id: 'rcs',
        name: 'Google RCS Business Messaging',
        configured: rcsInfo.configured,
        status: rcsInfo.configured ? 'CONNECTED' : 'STANDBY',
        requires: ['RCS_API_KEY', 'RCS_AGENT_ID'],
        category: 'Carrier',
        mode: rcsInfo.mode,
      },
      {
        id: 'email',
        name: `Email (${emailInfo.provider})`,
        configured: emailInfo.configured,
        status: emailInfo.configured ? 'CONNECTED' : 'DEV_FALLBACK',
        requires: emailInfo.provider === 'Resend' ? ['RESEND_API_KEY'] : ['SMTP_PASS'],
        category: 'Email',
        mode: emailInfo.mode,
        provider: emailInfo.provider,
      },
      {
        id: 'elevenlabs',
        name: 'ElevenLabs Ultra-Realistic AI Voice',
        configured: isElevenLabsConfigured(),
        status: isElevenLabsConfigured() ? 'CONNECTED' : 'STANDBY',
        requires: ['ELEVENLABS_API_KEY'],
        category: 'AI Audio',
        mode: isElevenLabsConfigured() ? 'live' : 'disabled',
      },
      {
        id: 'gemini',
        name: 'Google Gemini 2.5 Pro Copilot',
        configured: geminiConfigured,
        status: geminiConfigured ? 'CONNECTED' : 'ACTIVE_DEFAULT',
        requires: ['GEMINI_API_KEY'],
        category: 'AI Reasoning',
        mode: geminiConfigured ? 'live' : 'default',
      },
    ],
    mode: 'production',
    notice: 'Connect your channels securely via the Settings page or by setting environment variables.',
  });
});

/**
 * POST /api/integrations — Save channel integration credentials
 */
integrationsRouter.post('/', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { provider, accessToken, phoneNumberId, instagramAccountId, wabaId, appSecret } = req.body;

    if (!provider || !accessToken) {
      return res.status(400).json({ error: 'Provider and access token are required' });
    }

    // Validate the token before saving
    let validationResult: any = { valid: true };
    if (provider === 'whatsapp' && phoneNumberId) {
      try {
        const verifyRes = await axios.get(`https://graph.facebook.com/v20.0/${phoneNumberId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 10000,
        });
        validationResult = {
          valid: true,
          phoneDisplay: verifyRes.data?.display_phone_number,
          qualityRating: verifyRes.data?.quality_rating,
        };
      } catch (err: any) {
        return res.status(400).json({
          error: 'Invalid WhatsApp credentials',
          details: err.response?.data?.error?.message || err.message,
        });
      }
    } else if (provider === 'instagram' && instagramAccountId) {
      try {
        await axios.get(`https://graph.facebook.com/v20.0/${instagramAccountId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 10000,
        });
        validationResult = { valid: true };
      } catch (err: any) {
        return res.status(400).json({
          error: 'Invalid Instagram credentials',
          details: err.response?.data?.error?.message || err.message,
        });
      }
    }

    const integration = await prisma.channelIntegration.upsert({
      where: {
        workspaceId_provider: { workspaceId, provider },
      },
      update: {
        accessToken,
        phoneNumberId: phoneNumberId || null,
        instagramAccountId: instagramAccountId || null,
        wabaId: wabaId || null,
        appSecret: appSecret || null,
        isActive: true,
      },
      create: {
        workspaceId,
        provider,
        accessToken,
        phoneNumberId: phoneNumberId || null,
        instagramAccountId: instagramAccountId || null,
        wabaId: wabaId || null,
        appSecret: appSecret || null,
        isActive: true,
      },
    });

    res.json({ success: true, integration, validation: validationResult });
  } catch (error) {
    console.error('Error saving integration:', error);
    res.status(500).json({ error: 'Failed to save integration' });
  }
});

/**
 * DELETE /api/integrations/:provider — Disconnect a channel
 */
integrationsRouter.delete('/:provider', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { provider } = req.params;

    await prisma.channelIntegration.update({
      where: { workspaceId_provider: { workspaceId, provider } },
      data: { isActive: false, accessToken: null },
    });

    res.json({ success: true, message: `${provider} disconnected` });
  } catch (error) {
    console.error('Error disconnecting integration:', error);
    res.status(500).json({ error: 'Failed to disconnect integration' });
  }
});

/**
 * POST /api/integrations/test — Run real connectivity tests against all services
 */
integrationsRouter.post('/test', async (req, res) => {
  const { channelId } = req.body;

  // If a specific channel is requested, test only that
  if (channelId) {
    let result;
    switch (channelId) {
      case 'email':
        result = await testSmtpConnection();
        break;
      case 'voice':
      case 'sms':
        result = await testTwilioConnection();
        break;
      case 'rcs':
        result = await testRcsConnection();
        break;
      case 'elevenlabs':
        result = await testElevenLabsConnection();
        break;
      case 'whatsapp': {
        const workspaceId = (req as any).user?.workspaceId;
        const int = await prisma.channelIntegration.findFirst({
          where: { workspaceId, provider: 'whatsapp', isActive: true },
        });
        const token = int?.accessToken || process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneId = int?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (token && phoneId) {
          try {
            const verifyRes = await axios.get(`https://graph.facebook.com/v20.0/${phoneId}`, {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000,
            });
            result = {
              success: true,
              message: `WhatsApp connected ✅ — Phone: ${verifyRes.data?.display_phone_number || phoneId} (Rating: ${verifyRes.data?.quality_rating || 'GREEN'})`,
            };
          } catch (err: any) {
            result = {
              success: false,
              message: `WhatsApp test failed: ${err.response?.data?.error?.message || err.message}`,
            };
          }
        } else {
          result = { success: false, message: 'WhatsApp credentials not configured in DB or .env' };
        }
        break;
      }
      case 'instagram': {
        const workspaceId = (req as any).user?.workspaceId;
        const int = await prisma.channelIntegration.findFirst({
          where: { workspaceId, provider: 'instagram', isActive: true },
        });
        const token = int?.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN;
        const accountId = int?.instagramAccountId || process.env.INSTAGRAM_ACCOUNT_ID;

        if (token && accountId) {
          try {
            await axios.get(`https://graph.facebook.com/v20.0/${accountId}`, {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000,
            });
            result = { success: true, message: 'Instagram connected ✅' };
          } catch (err: any) {
            result = { success: false, message: `Instagram test failed: ${err.response?.data?.error?.message || err.message}` };
          }
        } else {
          result = { success: false, message: 'Instagram credentials not configured in DB or .env' };
        }
        break;
      }
      case 'gemini':
        result = { success: Boolean(process.env.GEMINI_API_KEY), message: process.env.GEMINI_API_KEY ? 'Gemini API key configured ✅' : 'Gemini API key not set' };
        break;
      default:
        result = { success: false, message: `Unknown channel: ${channelId}` };
    }
    return res.json({ channelId, ...result });
  }

  // Test all channels
  const [emailResult, twilioResult, rcsResult, elevenLabsResult] = await Promise.all([
    testSmtpConnection(),
    testTwilioConnection(),
    testRcsConnection(),
    testElevenLabsConnection(),
  ]);

  res.json({
    email: emailResult,
    voice: twilioResult,
    sms: twilioResult,
    rcs: rcsResult,
    elevenLabs: elevenLabsResult,
    gemini: { success: Boolean(process.env.GEMINI_API_KEY), message: process.env.GEMINI_API_KEY ? 'Configured ✅' : 'Not configured' },
  });
});

/**
 * POST /api/integrations/send-test — Send a live test message/call across any channel
 */
integrationsRouter.post('/send-test', async (req, res) => {
  const { channel, to, message } = req.body;

  if (!channel || !to) {
    return res.status(400).json({ error: 'channel and to recipient are required' });
  }

  const testMsg = message || `Hello from Ricoz! This is a live test notification sent at ${new Date().toLocaleTimeString()}.`;

  try {
    switch (channel) {
      case 'sms': {
        const result = await sendSms({ to, body: testMsg });
        return res.json({ channel, ...result });
      }
      case 'voice': {
        const result = await makeOutboundCall({
          to,
          sayText: testMsg,
        });
        return res.json({ channel, ...result });
      }
      case 'email': {
        const result = await sendEmail({
          to,
          subject: '⚡ Ricoz Omnichannel Test Email',
          html: `<div style="font-family:sans-serif;padding:20px;border-radius:8px;border:1px solid #e2e8f0;">
            <h2 style="color:#00a688;">Ricoz Omnichannel Test</h2>
            <p>${testMsg}</p>
            <p style="color:#64748b;font-size:12px;">Sent via Ricoz Communication Engine</p>
          </div>`,
        });
        return res.json({ channel, ...result });
      }
      case 'rcs': {
        const result = await sendRcsTextMessage({ phoneNumber: to, text: testMsg });
        return res.json({ channel, ...result });
      }
      case 'whatsapp': {
        const token = process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        if (!token || !phoneId) {
          return res.status(400).json({ success: false, error: 'WhatsApp API credentials not configured' });
        }
        const resp = await axios.post(
          `https://graph.facebook.com/v20.0/${phoneId}/messages`,
          {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to.replace(/[^0-9]/g, ''),
            type: 'text',
            text: { preview_url: false, body: testMsg },
          },
          { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
        );
        return res.json({ success: true, messageId: resp.data?.messages?.[0]?.id });
      }
      default:
        return res.status(400).json({ error: `Unsupported test channel: ${channel}` });
    }
  } catch (err: any) {
    const errorMsg = err.response?.data?.error?.message || err.message;
    return res.status(500).json({ success: false, error: errorMsg });
  }
});
