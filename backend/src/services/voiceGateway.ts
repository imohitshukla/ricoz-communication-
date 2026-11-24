/**
 * Voice Gateway Service
 * Modular Telephony & WebRTC Voice Layer
 *
 * Supported Voice Modes:
 *   1. WebRTC Browser Audio (100% Free: Browser-to-browser, Customer-to-Agent in-app calling, $0)
 *   2. FreeSWITCH / Asterisk SIP Gateway (Open-source PBX server, self-hosted SIP trunking)
 *   3. Twilio Telephony (PSTN Outbound carrier fallback)
 */

export interface VoiceGatewayInfo {
  activeMode: 'webrtc' | 'freeswitch_sip' | 'asterisk_sip' | 'twilio' | 'simulation';
  isFreeTier: boolean;
  webrtcStunServers: string[];
  sipEndpoint?: string;
  features: string[];
}

const VOICE_PROVIDER = process.env.VOICE_PROVIDER || 'webrtc'; // 'webrtc' | 'freeswitch' | 'asterisk' | 'twilio'
const FREESWITCH_SIP_HOST = process.env.FREESWITCH_SIP_HOST || process.env.SIP_HOST || '';
const FREESWITCH_SIP_PORT = process.env.FREESWITCH_SIP_PORT || '5060';
const TWILIO_CONFIGURED = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);

// Standard Google Public STUN servers for WebRTC NAT traversal (100% free)
export const FREE_PUBLIC_STUN_SERVERS = [
  'stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
  'stun:stun2.l.google.com:19302',
  'stun:stun3.l.google.com:19302',
  'stun:stun4.l.google.com:19302'
];

/**
 * Get active voice gateway status and diagnostics
 */
export function getVoiceGatewayInfo(): VoiceGatewayInfo {
  if (VOICE_PROVIDER === 'webrtc') {
    return {
      activeMode: 'webrtc',
      isFreeTier: true,
      webrtcStunServers: FREE_PUBLIC_STUN_SERVERS,
      features: [
        'Browser-to-Agent Audio (WebRTC)',
        'Zero Telecom Carrier Costs ($0.00/min)',
        'In-App Customer Audio Support Widget',
        'End-to-End Encrypted DTLS-SRTP Audio'
      ]
    };
  }

  if (VOICE_PROVIDER === 'freeswitch' || FREESWITCH_SIP_HOST) {
    return {
      activeMode: 'freeswitch_sip',
      isFreeTier: true,
      sipEndpoint: `sip:${FREESWITCH_SIP_HOST}:${FREESWITCH_SIP_PORT}`,
      webrtcStunServers: FREE_PUBLIC_STUN_SERVERS,
      features: [
        'FreeSWITCH Open-Source PBX Core',
        'SIP.js WebRTC to SIP Gateway',
        'Local IVR Dialplan Processing',
        'Custom Low-Cost SIP Trunk Support (Telnyx / VoIP.ms)'
      ]
    };
  }

  if (TWILIO_CONFIGURED) {
    return {
      activeMode: 'twilio',
      isFreeTier: false,
      webrtcStunServers: FREE_PUBLIC_STUN_SERVERS,
      features: [
        'PSTN Real Cellular & Landline Calling',
        'Outbound AI Cold Caller',
        'Global SMS Messaging',
        'Call Recording & Transcription'
      ]
    };
  }

  return {
    activeMode: 'webrtc',
    isFreeTier: true,
    webrtcStunServers: FREE_PUBLIC_STUN_SERVERS,
    features: ['WebRTC Browser Audio Active']
  };
}

/**
 * Generate FreeSWITCH SIP Configuration Template
 * Use this to connect an on-premise or cloud FreeSWITCH instance to Ricoz
 */
export function generateFreeSwitchConfig(domain = 'ricoz.local') {
  return `<!-- FreeSWITCH SIP Profile for Ricoz Omnichannel Communication -->
<include>
  <gateway name="ricoz_sip_trunk">
    <param name="realm" value="${domain}"/>
    <param name="username" value="ricoz_agent"/>
    <param name="password" value="secret_sip_pass"/>
    <param name="register" value="false"/>
    <param name="retry-seconds" value="30"/>
    <param name="caller-id-in-from" value="true"/>
  </gateway>
</include>
`;
}
