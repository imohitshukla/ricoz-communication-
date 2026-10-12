import axios from 'axios';

// -----------------------------------------------------------------
// ElevenLabs Voice Synthesis Service
//
// Generates ultra-realistic AI speech for cold calling, IVR, 
// and automated voice messaging.
// -----------------------------------------------------------------

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// Default voice IDs from ElevenLabs
const VOICE_PRESETS: Record<string, string> = {
  'rachel':    '21m00Tcm4TlvDq8ikWAM',  // Rachel (warm female)
  'domi':      'AZnzlk1XvdvUeBnXmlld',  // Domi (energetic female)
  'bella':     'EXAVITQu4vr4xnSDxMaL',  // Bella (soft female)
  'josh':      'TxGEqnHWrfWFTfGW9XjX',  // Josh (deep male)
  'arnold':    'VR6AewLTigWG4xSOukaG',  // Arnold (strong male)
  'sam':       'yoZ06aMxZJJ28mfd3POQ',  // Sam (raspy male)
  'adam':      'pNInz6obpgDQGcFmaJgB',  // Adam (confident male)
};

/**
 * Check if ElevenLabs is configured
 */
export function isElevenLabsConfigured(): boolean {
  return Boolean(ELEVENLABS_API_KEY);
}

/**
 * Get available voice presets
 */
export function getVoicePresets() {
  return Object.keys(VOICE_PRESETS);
}

/**
 * Resolve a voice name or ID to an ElevenLabs voice_id
 */
function resolveVoiceId(voiceNameOrId: string): string {
  const lower = voiceNameOrId.toLowerCase();
  if (VOICE_PRESETS[lower]) return VOICE_PRESETS[lower];
  // Assume it's a direct voice_id
  return voiceNameOrId;
}

// -----------------------------------------------------------------
// Text-to-Speech — Returns audio buffer (MP3)
// -----------------------------------------------------------------
export async function textToSpeech(options: {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
}): Promise<{ success: boolean; audioBuffer?: Buffer; error?: string }> {
  if (!ELEVENLABS_API_KEY) {
    return { success: false, error: 'ElevenLabs API key not configured' };
  }

  const voiceId = resolveVoiceId(options.voiceId || 'rachel');

  try {
    const response = await axios.post(
      `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
      {
        text: options.text,
        model_id: options.modelId || 'eleven_multilingual_v2',
        voice_settings: {
          stability: options.stability ?? 0.5,
          similarity_boost: options.similarityBoost ?? 0.75,
          style: options.style ?? 0.5,
          use_speaker_boost: true,
        },
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        responseType: 'arraybuffer',
        timeout: 30000,
      }
    );

    return { success: true, audioBuffer: Buffer.from(response.data) };
  } catch (err: any) {
    console.error('[ElevenLabs] TTS error:', err.response?.data?.toString() || err.message);
    return { success: false, error: err.message };
  }
}

// -----------------------------------------------------------------
// Text-to-Speech — Stream (for real-time call audio piping)
// -----------------------------------------------------------------
export async function textToSpeechStream(options: {
  text: string;
  voiceId?: string;
}): Promise<{ success: boolean; stream?: any; error?: string }> {
  if (!ELEVENLABS_API_KEY) {
    return { success: false, error: 'ElevenLabs API key not configured' };
  }

  const voiceId = resolveVoiceId(options.voiceId || 'rachel');

  try {
    const response = await axios.post(
      `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}/stream`,
      {
        text: options.text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
        },
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        responseType: 'stream',
        timeout: 30000,
      }
    );

    return { success: true, stream: response.data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// -----------------------------------------------------------------
// List available voices from the ElevenLabs account
// -----------------------------------------------------------------
export async function listVoices(): Promise<{
  success: boolean;
  voices?: Array<{ voice_id: string; name: string; category: string }>;
  error?: string;
}> {
  if (!ELEVENLABS_API_KEY) {
    return { success: false, error: 'ElevenLabs not configured' };
  }

  try {
    const response = await axios.get(`${ELEVENLABS_BASE_URL}/voices`, {
      headers: { 'xi-api-key': ELEVENLABS_API_KEY },
      timeout: 10000,
    });

    const voices = response.data.voices.map((v: any) => ({
      voice_id: v.voice_id,
      name: v.name,
      category: v.category || 'premade',
    }));

    return { success: true, voices };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// -----------------------------------------------------------------
// Get usage/subscription info
// -----------------------------------------------------------------
export async function getSubscriptionInfo(): Promise<{
  success: boolean;
  data?: { character_count: number; character_limit: number; tier: string };
  error?: string;
}> {
  if (!ELEVENLABS_API_KEY) {
    return { success: false, error: 'ElevenLabs not configured' };
  }

  try {
    const response = await axios.get(`${ELEVENLABS_BASE_URL}/user/subscription`, {
      headers: { 'xi-api-key': ELEVENLABS_API_KEY },
      timeout: 10000,
    });

    return {
      success: true,
      data: {
        character_count: response.data.character_count,
        character_limit: response.data.character_limit,
        tier: response.data.tier,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// -----------------------------------------------------------------
// Connection test
// -----------------------------------------------------------------
export async function testElevenLabsConnection(): Promise<{ success: boolean; message: string }> {
  if (!ELEVENLABS_API_KEY) {
    return { success: false, message: 'ElevenLabs API key not configured — set ELEVENLABS_API_KEY' };
  }

  try {
    const subInfo = await getSubscriptionInfo();
    if (subInfo.success && subInfo.data) {
      const usage = `${subInfo.data.character_count.toLocaleString()}/${subInfo.data.character_limit.toLocaleString()} chars`;
      return {
        success: true,
        message: `ElevenLabs connected ✅ — Tier: ${subInfo.data.tier}, Usage: ${usage}`,
      };
    }
    return { success: true, message: 'ElevenLabs API key valid ✅' };
  } catch (err: any) {
    return { success: false, message: `ElevenLabs connection failed: ${err.message}` };
  }
}
