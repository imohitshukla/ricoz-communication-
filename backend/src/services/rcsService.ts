import axios from 'axios';

// -----------------------------------------------------------------
// Google RCS Business Messaging (RBM) Service
//
// Uses the Google RBM REST API directly.
// Requires a Google Cloud Service Account with RBM API enabled.
// -----------------------------------------------------------------

const RBM_API_KEY = process.env.RCS_API_KEY || '';
const RBM_AGENT_ID = process.env.RCS_AGENT_ID || '';
const RBM_BASE_URL = 'https://rcsbusinessmessaging.googleapis.com/v1';

/**
 * Check if RCS/RBM is configured for production
 */
export function isRcsConfigured(): boolean {
  return Boolean(RBM_API_KEY && RBM_AGENT_ID);
}

/**
 * Get RCS config info (safe for frontend)
 */
export function getRcsInfo() {
  return {
    configured: isRcsConfigured(),
    agentId: RBM_AGENT_ID || null,
    mode: isRcsConfigured() ? 'live' : 'simulation',
    features: ['rich_cards', 'carousels', 'suggested_actions', 'suggested_replies', 'file_transfer'],
    supportedCarriers: ['Verizon', 'AT&T', 'T-Mobile', 'Jio', 'Airtel', 'Vodafone'],
  };
}

// -----------------------------------------------------------------
// Send a plain text RCS message
// -----------------------------------------------------------------
export async function sendRcsTextMessage(options: {
  phoneNumber: string;    // E.164 format: +1234567890
  text: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!isRcsConfigured()) {
    return { success: false, error: 'RCS not configured — set RCS_API_KEY and RCS_AGENT_ID' };
  }

  const msisdn = options.phoneNumber.replace(/[^+\d]/g, '');

  try {
    const response = await axios.post(
      `${RBM_BASE_URL}/phones/${msisdn}/agentMessages`,
      {
        contentMessage: {
          text: options.text,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${RBM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        params: {
          messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          agentId: RBM_AGENT_ID,
        },
      }
    );

    return {
      success: true,
      messageId: response.data?.name || `rbm_${Date.now()}`,
    };
  } catch (err: any) {
    console.error('[RBM] Text message send error:', err.response?.data || err.message);
    return { success: false, error: err.response?.data?.error?.message || err.message };
  }
}

// -----------------------------------------------------------------
// Send a Rich Card (standalone)
// -----------------------------------------------------------------
export async function sendRcsRichCard(options: {
  phoneNumber: string;
  title: string;
  description: string;
  mediaUrl?: string;
  mediaHeight?: 'SHORT' | 'MEDIUM' | 'TALL';
  suggestions?: Array<{
    type: 'reply' | 'url' | 'dial';
    text: string;
    postbackData?: string;
    url?: string;
    phoneNumber?: string;
  }>;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!isRcsConfigured()) {
    return { success: false, error: 'RCS not configured' };
  }

  const msisdn = options.phoneNumber.replace(/[^+\d]/g, '');
  const suggestions = (options.suggestions || []).map(s => {
    if (s.type === 'url') {
      return {
        action: {
          text: s.text,
          postbackData: s.postbackData || s.text,
          openUrlAction: { url: s.url },
        },
      };
    } else if (s.type === 'dial') {
      return {
        action: {
          text: s.text,
          postbackData: s.postbackData || s.text,
          dialAction: { phoneNumber: s.phoneNumber },
        },
      };
    }
    return {
      reply: {
        text: s.text,
        postbackData: s.postbackData || s.text,
      },
    };
  });

  const richCard: any = {
    standaloneCard: {
      cardOrientation: 'VERTICAL',
      thumbnailImageAlignment: 'LEFT',
      cardContent: {
        title: options.title,
        description: options.description,
        suggestions,
      },
    },
  };

  if (options.mediaUrl) {
    richCard.standaloneCard.cardContent.media = {
      height: options.mediaHeight || 'MEDIUM',
      contentInfo: {
        fileUrl: options.mediaUrl,
        forceRefresh: false,
      },
    };
  }

  try {
    const response = await axios.post(
      `${RBM_BASE_URL}/phones/${msisdn}/agentMessages`,
      {
        contentMessage: { richCard },
      },
      {
        headers: {
          Authorization: `Bearer ${RBM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        params: {
          messageId: `card_${Date.now()}`,
          agentId: RBM_AGENT_ID,
        },
      }
    );

    return { success: true, messageId: response.data?.name || `rbm_card_${Date.now()}` };
  } catch (err: any) {
    console.error('[RBM] Rich card send error:', err.response?.data || err.message);
    return { success: false, error: err.response?.data?.error?.message || err.message };
  }
}

// -----------------------------------------------------------------
// Send a Carousel (multiple rich cards)
// -----------------------------------------------------------------
export async function sendRcsCarousel(options: {
  phoneNumber: string;
  cards: Array<{
    title: string;
    description: string;
    mediaUrl?: string;
    suggestions?: Array<{ type: 'reply' | 'url'; text: string; url?: string }>;
  }>;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!isRcsConfigured()) {
    return { success: false, error: 'RCS not configured' };
  }

  const msisdn = options.phoneNumber.replace(/[^+\d]/g, '');
  const cardContents = options.cards.map(card => {
    const suggestions = (card.suggestions || []).map(s => {
      if (s.type === 'url') {
        return {
          action: {
            text: s.text,
            postbackData: s.text,
            openUrlAction: { url: s.url },
          },
        };
      }
      return { reply: { text: s.text, postbackData: s.text } };
    });

    const content: any = {
      title: card.title,
      description: card.description,
      suggestions,
    };

    if (card.mediaUrl) {
      content.media = {
        height: 'MEDIUM',
        contentInfo: { fileUrl: card.mediaUrl, forceRefresh: false },
      };
    }

    return content;
  });

  try {
    const response = await axios.post(
      `${RBM_BASE_URL}/phones/${msisdn}/agentMessages`,
      {
        contentMessage: {
          richCard: {
            carouselCard: {
              cardWidth: 'MEDIUM',
              cardContents,
            },
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${RBM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        params: {
          messageId: `carousel_${Date.now()}`,
          agentId: RBM_AGENT_ID,
        },
      }
    );

    return { success: true, messageId: response.data?.name || `rbm_carousel_${Date.now()}` };
  } catch (err: any) {
    console.error('[RBM] Carousel send error:', err.response?.data || err.message);
    return { success: false, error: err.response?.data?.error?.message || err.message };
  }
}

// -----------------------------------------------------------------
// Check RCS capability for a phone number
// -----------------------------------------------------------------
export async function checkRcsCapability(phoneNumber: string): Promise<{
  rcsEnabled: boolean;
  features?: string[];
  error?: string;
}> {
  if (!isRcsConfigured()) {
    return { rcsEnabled: false, error: 'RCS not configured' };
  }

  const msisdn = phoneNumber.replace(/[^+\d]/g, '');

  try {
    const response = await axios.get(
      `${RBM_BASE_URL}/phones/${msisdn}/capabilities`,
      {
        headers: { Authorization: `Bearer ${RBM_API_KEY}` },
        params: { agentId: RBM_AGENT_ID },
      }
    );

    return {
      rcsEnabled: true,
      features: response.data?.features || ['RICHCARD_STANDALONE', 'ACTION_CREATE_CALENDAR_EVENT', 'ACTION_DIAL'],
    };
  } catch (err: any) {
    // 404 = user not RCS capable
    if (err.response?.status === 404) {
      return { rcsEnabled: false };
    }
    return { rcsEnabled: false, error: err.message };
  }
}

// -----------------------------------------------------------------
// Connection test
// -----------------------------------------------------------------
export async function testRcsConnection(): Promise<{ success: boolean; message: string }> {
  if (!isRcsConfigured()) {
    return { success: false, message: 'RCS credentials not configured — set RCS_API_KEY and RCS_AGENT_ID' };
  }

  try {
    // Try to get agent info
    const response = await axios.get(
      `${RBM_BASE_URL}/agents/${RBM_AGENT_ID}`,
      {
        headers: { Authorization: `Bearer ${RBM_API_KEY}` },
        timeout: 10000,
      }
    );

    return {
      success: true,
      message: `RBM Agent connected ✅ — Agent: ${response.data?.displayName || RBM_AGENT_ID}`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `RBM connection failed: ${err.response?.data?.error?.message || err.message}`,
    };
  }
}
