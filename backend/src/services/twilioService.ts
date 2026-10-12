import Twilio from 'twilio';

// -----------------------------------------------------------------
// Twilio Production Service
// Handles: Voice Calls (inbound/outbound), SMS, Call Recordings
// -----------------------------------------------------------------

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '';
const TWILIO_TWIML_APP_SID = process.env.TWILIO_TWIML_APP_SID || '';

let _client: Twilio.Twilio | null = null;

/**
 * Get or create the singleton Twilio client
 */
function getClient(): Twilio.Twilio | null {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    return null;
  }
  if (!_client) {
    _client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  return _client;
}

/**
 * Check if Twilio is configured for production use
 */
export function isTwilioConfigured(): boolean {
  return Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER);
}

/**
 * Get Twilio config info (safe for frontend, no secrets)
 */
export function getTwilioInfo() {
  return {
    configured: isTwilioConfigured(),
    phoneNumber: TWILIO_PHONE_NUMBER || null,
    mode: isTwilioConfigured() ? 'live' : 'simulation',
    features: ['voice_outbound', 'voice_inbound', 'sms_send', 'sms_receive', 'call_recording', 'transcription'],
  };
}

// -----------------------------------------------------------------
// VOICE — Outbound Call
// -----------------------------------------------------------------
export async function makeOutboundCall(options: {
  to: string;
  sayText?: string;
  twiml?: string;
  statusCallbackUrl?: string;
  recordingCallbackUrl?: string;
  twimlUrl?: string;
  machineDetection?: boolean;
}): Promise<{ success: boolean; callSid?: string; error?: string }> {
  const client = getClient();
  if (!client) {
    return { success: false, error: 'Twilio not configured — set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER' };
  }

  try {
    const callParams: any = {
      to: options.to,
      from: TWILIO_PHONE_NUMBER,
    };

    if (options.recordingCallbackUrl) {
      callParams.record = true;
      callParams.recordingStatusCallback = options.recordingCallbackUrl;
    }

    if (options.statusCallbackUrl) {
      callParams.statusCallback = options.statusCallbackUrl;
      callParams.statusCallbackEvent = ['initiated', 'ringing', 'answered', 'completed'];
      callParams.statusCallbackMethod = 'POST';
    }

    // If a custom TwiML URL or text is provided, use it
    if (options.twimlUrl) {
      callParams.url = options.twimlUrl;
    } else if (options.twiml) {
      callParams.twiml = options.twiml;
    } else if (options.sayText) {
      callParams.twiml = `<Response><Say voice="Polly.Joanna">${options.sayText}</Say></Response>`;
    } else {
      // Default: simple say + gather for cold call
      callParams.twiml = `<Response>
  <Say voice="Polly.Joanna">Hello, this is a call from Ricoz Communication. Please hold while we connect you.</Say>
  <Gather numDigits="1" action="/api/voice/gather" method="POST">
    <Say>Press 1 for Sales, Press 2 for Support.</Say>
  </Gather>
  <Record maxLength="120" transcribe="true" />
</Response>`;
    }

    if (options.machineDetection) {
      callParams.machineDetection = 'DetectMessageEnd';
      callParams.asyncAmd = true;
      callParams.asyncAmdStatusCallback = options.statusCallbackUrl;
    }

    let call;
    try {
      call = await client.calls.create(callParams);
    } catch (createErr: any) {
      if (createErr.message?.includes('trial') || createErr.message?.includes('disallowed')) {
        delete callParams.twiml;
        delete callParams.record;
        delete callParams.recordingStatusCallback;
        delete callParams.statusCallback;
        delete callParams.statusCallbackEvent;
        delete callParams.statusCallbackMethod;
        callParams.url = options.twimlUrl || 'http://demo.twilio.com/docs/voice.xml';
        call = await client.calls.create(callParams);
      } else {
        throw createErr;
      }
    }
    console.log(`[Twilio] Outbound call initiated: ${call.sid} → ${options.to}`);
    return { success: true, callSid: call.sid };
  } catch (err: any) {
    console.error('[Twilio] Outbound call error:', err.message);
    return { success: false, error: err.message };
  }
}

// -----------------------------------------------------------------
// VOICE — Get Call Details
// -----------------------------------------------------------------
export async function getCallDetails(callSid: string) {
  const client = getClient();
  if (!client) return null;
  try {
    const call = await client.calls(callSid).fetch();
    return {
      sid: call.sid,
      status: call.status,
      duration: call.duration,
      direction: call.direction,
      from: call.from,
      to: call.to,
      startTime: call.startTime,
      endTime: call.endTime,
      price: call.price,
      priceUnit: call.priceUnit,
    };
  } catch (err: any) {
    console.error('[Twilio] Fetch call error:', err.message);
    return null;
  }
}

// -----------------------------------------------------------------
// VOICE — Get Call Recordings
// -----------------------------------------------------------------
export async function getCallRecordings(callSid: string) {
  const client = getClient();
  if (!client) return [];
  try {
    const recordings = await client.calls(callSid).recordings.list();
    return recordings.map(r => ({
      sid: r.sid,
      duration: r.duration,
      url: `https://api.twilio.com${r.uri.replace('.json', '.mp3')}`,
      status: r.status,
      dateCreated: r.dateCreated,
    }));
  } catch (err: any) {
    console.error('[Twilio] Fetch recordings error:', err.message);
    return [];
  }
}

// -----------------------------------------------------------------
// VOICE — Get Transcription for a Recording
// -----------------------------------------------------------------
export async function getTranscriptions(recordingSid: string) {
  const client = getClient();
  if (!client) return null;
  try {
    const transcriptions = await client.recordings(recordingSid).transcriptions.list();
    if (transcriptions.length > 0) {
      const t = transcriptions[0];
      const full = await client.transcriptions(t.sid).fetch();
      return {
        sid: full.sid,
        transcriptionText: full.transcriptionText,
        status: full.status,
        duration: full.duration,
      };
    }
    return null;
  } catch (err: any) {
    console.error('[Twilio] Fetch transcription error:', err.message);
    return null;
  }
}

// -----------------------------------------------------------------
// SMS — Send Message
// -----------------------------------------------------------------
export async function sendSms(options: {
  to: string;
  body: string;
  mediaUrl?: string;
  statusCallback?: string;
}): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  const client = getClient();
  if (!client) {
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const msgParams: any = {
      to: options.to,
      from: TWILIO_PHONE_NUMBER,
      body: options.body,
    };

    if (options.mediaUrl) {
      msgParams.mediaUrl = [options.mediaUrl];
    }

    if (options.statusCallback) {
      msgParams.statusCallback = options.statusCallback;
    }

    const message = await client.messages.create(msgParams);
    console.log(`[Twilio SMS] Sent ${message.sid} → ${options.to}`);
    return { success: true, messageSid: message.sid };
  } catch (err: any) {
    console.error('[Twilio SMS] Send error:', err.message);
    return { success: false, error: err.message };
  }
}

// -----------------------------------------------------------------
// SMS — Fetch Message History
// -----------------------------------------------------------------
export async function getMessageHistory(options?: {
  limit?: number;
  dateSentAfter?: Date;
}) {
  const client = getClient();
  if (!client) return [];
  try {
    const messages = await client.messages.list({
      limit: options?.limit || 50,
      dateSentAfter: options?.dateSentAfter,
    });
    return messages.map(m => ({
      sid: m.sid,
      from: m.from,
      to: m.to,
      body: m.body,
      status: m.status,
      direction: m.direction,
      dateSent: m.dateSent,
      price: m.price,
    }));
  } catch (err: any) {
    console.error('[Twilio] Message history error:', err.message);
    return [];
  }
}

// -----------------------------------------------------------------
// Account Health Check
// -----------------------------------------------------------------
export async function testTwilioConnection(): Promise<{ success: boolean; message: string; balance?: string }> {
  const client = getClient();
  if (!client) {
    return { success: false, message: 'Twilio credentials not configured' };
  }
  try {
    const account = await client.api.accounts(TWILIO_ACCOUNT_SID).fetch();
    const balance = await client.balance.fetch();
    return {
      success: true,
      message: `Twilio connected ✅ — Account: ${account.friendlyName} (${account.status})`,
      balance: `${balance.balance} ${balance.currency}`,
    };
  } catch (err: any) {
    return { success: false, message: `Twilio connection failed: ${err.message}` };
  }
}

// -----------------------------------------------------------------
// Validate Twilio webhook request signature
// -----------------------------------------------------------------
export function validateTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string
): boolean {
  if (!TWILIO_AUTH_TOKEN) return false;
  return Twilio.validateRequest(TWILIO_AUTH_TOKEN, signature, url, params);
}
