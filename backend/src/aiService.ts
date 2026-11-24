import { GoogleGenAI } from '@google/genai';
import { prisma } from './db';
import { retrieveRelevantKnowledge, RelevantChunk } from './ragService';
import axios from 'axios';

// -----------------------------------------------------------------
// Modular Multi-Provider AI Engine (100% Free Alternatives Supported)
// Providers supported:
//   1. Groq (100% Free Cloud Tier: 14,400 req/day, Llama 3.3 70B & 3.1 8B, 800 tok/sec)
//   2. Google Gemini (100% Free Tier: 1,500 req/day, Gemini 2.0 / 1.5 Flash)
//   3. Ollama (100% Local / Self-Hosted: Unlimited, $0 Forever, Private)
// -----------------------------------------------------------------

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3:latest';
const OLLAMA_ENABLED = process.env.OLLAMA_ENABLED === 'true';

// Initialize the Google GenAI client if key exists
let geminiClient: any = null;
try {
  if (process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI();
  }
} catch (err) {
  console.warn('[AIService] Failed to initialize Google GenAI client.');
}

export interface AgentResponseResult {
  reply: string;
  citedSources: RelevantChunk[];
  confidenceScore: number;
  isHumanHandoff: boolean;
  latencyMs: number;
  provider?: string;
}

/**
 * Check if the message contains explicit human handoff trigger keywords
 */
export function checkHandoffIntent(text: string, customKeywords?: string | null): boolean {
  const defaultTriggers = ['human', 'manager', 'agent', 'support rep', 'representative', 'real person', 'talk to someone'];
  const triggers = customKeywords
    ? customKeywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean)
    : defaultTriggers;

  const lower = text.toLowerCase();
  return triggers.some(trigger => lower.includes(trigger));
}

/**
 * Helper: Call Groq Cloud API (Free Tier: 14,400 requests/day, OpenAI format)
 */
async function callGroqChat(messages: { role: string; content: string }[], temperature = 0.4): Promise<string | null> {
  if (!GROQ_API_KEY) return null;
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: GROQ_MODEL,
        messages,
        temperature,
        max_tokens: 1024
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    const content = response.data?.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch (err: any) {
    console.warn('[AIService] Groq call failed or rate-limited, falling back:', err.response?.data?.error?.message || err.message);
    return null;
  }
}

/**
 * Helper: Call Ollama Local / Self-Hosted Instance ($0 cost, local network)
 */
async function callOllamaChat(prompt: string, systemPrompt?: string): Promise<string | null> {
  try {
    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt,
        system: systemPrompt,
        stream: false,
        options: { temperature: 0.4 }
      },
      { timeout: 15000 }
    );
    return response.data?.response?.trim() || null;
  } catch (err: any) {
    if (OLLAMA_ENABLED) {
      console.warn('[AIService] Ollama local service unreachable at', OLLAMA_BASE_URL);
    }
    return null;
  }
}

/**
 * Helper: Call Google Gemini (Free Tier: 15 RPM, 1,500 req/day)
 */
async function callGeminiChat(contents: string, responseJson = false): Promise<string | null> {
  if (!geminiClient) return null;
  try {
    const config: any = { temperature: 0.4 };
    if (responseJson) {
      config.responseMimeType = 'application/json';
    }
    const response = await geminiClient.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      config
    });
    return response.text?.trim() || null;
  } catch (err: any) {
    console.warn('[AIService] Gemini call failed, falling back:', err.message);
    return null;
  }
}

/**
 * Modular Multi-Provider Text Generation with Auto-Failover
 * Cascading Priority:
 *   1. Groq (Free Cloud, fastest 800 tok/sec, Llama 3.3 70B)
 *   2. Gemini (Free Tier, Google AI Studio)
 *   3. Ollama (100% Local Self-Hosted, $0 forever)
 */
async function runMultiProviderGeneration(
  systemPrompt: string,
  userPrompt: string,
  fullContextString: string
): Promise<{ text: string; provider: string } | null> {
  // 1. Try Groq Free Tier
  if (GROQ_API_KEY) {
    const groqReply = await callGroqChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);
    if (groqReply) return { text: groqReply, provider: `groq (${GROQ_MODEL})` };
  }

  // 2. Try Gemini Free Tier
  if (geminiClient) {
    const geminiReply = await callGeminiChat(fullContextString);
    if (geminiReply) return { text: geminiReply, provider: 'gemini-2.0-flash (free)' };
  }

  // 3. Try Ollama (Local $0)
  if (OLLAMA_ENABLED || !GROQ_API_KEY && !geminiClient) {
    const ollamaReply = await callOllamaChat(userPrompt, systemPrompt);
    if (ollamaReply) return { text: ollamaReply, provider: `ollama (${OLLAMA_MODEL})` };
  }

  return null;
}

/**
 * Generate a smart response based on customer's message and their context with full RAG capability.
 */
export async function generateAgentResponse(
  contactName: string, 
  incomingMessage: string, 
  recentMessages: { text: string, sender: string }[] = [],
  workspaceId?: string
): Promise<string> {
  const result = await generateAgentResponseDetailed(contactName, incomingMessage, recentMessages, workspaceId);
  return result.reply;
}

/**
 * Detailed version that returns citations, confidence, handoff status, and active free provider.
 */
export async function generateAgentResponseDetailed(
  contactName: string,
  incomingMessage: string,
  recentMessages: { text: string, sender: string }[] = [],
  workspaceId?: string,
  isSandbox = false
): Promise<AgentResponseResult> {
  const startTime = Date.now();

  let citedSources: RelevantChunk[] = [];
  let confidenceScore = 0.85;
  let isHumanHandoff = false;

  // 1. Fetch AI Agent Config
  let basePrompt = `You are a helpful, professional, and friendly customer support AI agent for Ricoz Communication.
Your goal is to assist customers quickly and accurately.`;
  let tone = 'Professional';
  let responseLength = 'concise';
  let handoffKeywords = 'human,manager,agent,representative,support,person';
  let humanHandoffEnabled = true;

  if (workspaceId) {
    const config = await prisma.aIAgentConfig.findUnique({ where: { workspaceId } });
    if (config) {
      if (!isSandbox && !config.isActive) {
        return {
          reply: '',
          citedSources: [],
          confidenceScore: 0,
          isHumanHandoff: false,
          latencyMs: Date.now() - startTime
        };
      }
      basePrompt = config.systemPrompt || basePrompt;
      tone = config.tone || 'Professional';
      responseLength = config.responseLength || 'concise';
      handoffKeywords = config.handoffKeywords || handoffKeywords;
      humanHandoffEnabled = config.humanHandoff ?? true;

      if (config.businessContext) {
        basePrompt += `\nBusiness Context: ${config.businessContext}`;
      }
      if (config.faq) {
        basePrompt += `\nGeneral FAQ: ${config.faq}`;
      }
    }
  }

  // 2. Check for Human Handoff triggers
  if (humanHandoffEnabled && checkHandoffIntent(incomingMessage, handoffKeywords)) {
    isHumanHandoff = true;
    return {
      reply: `I understand you would like to speak directly with a human team member. I am transferring this conversation to our support team right now. An agent will be with you shortly!`,
      citedSources: [],
      confidenceScore: 1.0,
      isHumanHandoff: true,
      latencyMs: Date.now() - startTime,
      provider: 'rules-engine'
    };
  }

  // 3. RAG Retrieval from Knowledge Base
  let ragContextSection = '';
  if (workspaceId) {
    try {
      const ragResult = await retrieveRelevantKnowledge(workspaceId, incomingMessage, 0.20, 3);
      if (ragResult.hasMatch) {
        citedSources = ragResult.chunks;
        confidenceScore = ragResult.bestScore;
        ragContextSection = `
=== VERIFIED COMPANY KNOWLEDGE BASE SOURCES (STRICT CITATION) ===
${ragResult.contextText}
=== END KNOWLEDGE BASE SOURCES ===

CRITICAL INSTRUCTIONS:
- You must base your answer strictly on the Knowledge Base Sources provided above.
- If the answer to the customer's question is not found in these sources, politely state that you do not have that specific information in your records and offer to connect them with a human specialist.
- Do not fabricate policies, pricing, dates, or contact details not supported by the sources.
`;
      }
    } catch (ragErr) {
      console.error('RAG Retrieval warning:', ragErr);
    }
  }

  // 4. Tone & Length directives
  const toneInstruction = `\nTone & Style: Maintain a ${tone} tone. Keep your answer ${responseLength === 'concise' ? 'concise and direct (1-3 sentences), ideal for messaging platforms like WhatsApp' : 'comprehensive yet clear (3-5 sentences) with bullet points if helpful'}.`;

  const systemInstructions = `${basePrompt}
${toneInstruction}
${ragContextSection}`;

  let userPrompt = `Customer Name: ${contactName}\n\n`;
  if (recentMessages.length > 0) {
    userPrompt += `Recent Conversation History:\n`;
    recentMessages.slice(-5).forEach((msg: any) => {
      userPrompt += `${msg.sender === 'contact' ? 'Customer' : 'Agent/Bot'}: ${msg.text}\n`;
    });
    userPrompt += `\n`;
  }
  userPrompt += `Customer's Current Message: "${incomingMessage}"\nPlease respond as the helpful Ricoz AI assistant:`;

  const fullPrompt = `${systemInstructions}\n\n${userPrompt}`;

  // 5. Run Multi-Provider AI Generation
  const genResult = await runMultiProviderGeneration(systemInstructions, userPrompt, fullPrompt);

  if (genResult && genResult.text) {
    return {
      reply: genResult.text,
      citedSources,
      confidenceScore: citedSources.length > 0 ? Math.max(confidenceScore, 0.90) : 0.80,
      isHumanHandoff: false,
      latencyMs: Date.now() - startTime,
      provider: genResult.provider
    };
  }

  // 6. High-Fidelity Local Knowledge Fallback (if no AI keys configured)
  let mockReply = `Hello ${contactName}! `;
  if (citedSources.length > 0) {
    mockReply += `Based on our ${citedSources[0].title} documentation: ${citedSources[0].excerpt.slice(0, 150)}... Let me know if you would like me to connect you with an agent!`;
  } else {
    mockReply += `Thank you for reaching out to Ricoz. An agent has been notified and will reply shortly! (Tip: Set GROQ_API_KEY or GEMINI_API_KEY in .env for free AI replies)`;
  }

  return {
    reply: mockReply,
    citedSources,
    confidenceScore: citedSources.length > 0 ? 0.90 : 0.60,
    isHumanHandoff: false,
    latencyMs: Date.now() - startTime,
    provider: 'local-knowledge-fallback'
  };
}

/**
 * AI Copilot: Generate 3 smart reply drafts in different tones
 */
export async function generateCopilotDrafts(
  incomingText: string,
  history: { text: string; sender: string }[] = [],
  workspaceId?: string,
  contactName = 'Customer'
) {
  let knowledgeContext = '';
  if (workspaceId) {
    const ragResult = await retrieveRelevantKnowledge(workspaceId, incomingText, 0.15, 2);
    if (ragResult && ragResult.chunks && ragResult.chunks.length > 0) {
      knowledgeContext = `\nKnowledge Context:\n${ragResult.chunks.map((c: RelevantChunk) => `[${c.title}]: ${c.excerpt}`).join('\n')}\n`;
    }
  }

  const prompt = `You are an AI Copilot assisting a human customer service agent at Ricoz.
Customer Name: ${contactName}
Last Customer Message: "${incomingText}"
Recent History: ${history.slice(-3).map(h => `${h.sender}: ${h.text}`).join(' | ')}
${knowledgeContext}

Generate 3 distinct, ready-to-send replies for the human agent:
1. "professional": Direct, clear, professional.
2. "friendly": Warm, engaging, empathetic.
3. "closer": Solution-focused, asking for next steps.

Format your response strictly as JSON:
{
  "professional": "...",
  "friendly": "...",
  "closer": "..."
}`;

  // Try Groq First
  if (GROQ_API_KEY) {
    const groqRaw = await callGroqChat([
      { role: 'system', content: 'You are a JSON-only response engine.' },
      { role: 'user', content: prompt }
    ]);
    if (groqRaw) {
      try {
        const cleaned = groqRaw.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.professional && parsed.friendly && parsed.closer) return parsed;
      } catch (_) {}
    }
  }

  // Try Gemini
  if (geminiClient) {
    try {
      const geminiRaw = await callGeminiChat(prompt, true);
      if (geminiRaw) {
        const parsed = JSON.parse(geminiRaw);
        if (parsed.professional && parsed.friendly && parsed.closer) return parsed;
      }
    } catch (_) {}
  }

  // Fallback drafts
  return {
    professional: `Hello ${contactName}, thank you for reaching out. We can certainly assist with this right away. Let me confirm the exact details for you.`,
    friendly: `Hi ${contactName}! 😊 Happy to help you with this today. What specific requirements or timeline do you have in mind?`,
    closer: `Hi ${contactName}, we can get this setup for you immediately. Would you like me to share a 1-click payment link or book an onboarding demo?`
  };
}

/**
 * AI Copilot: Generate executive 2-bullet summary and next action
 */
export async function generateThreadSummary(messages: { text: string; sender: string }[]) {
  const textStream = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
  const prompt = `Summarize this customer support chat in concise business terms:
${textStream}

Respond strictly as JSON:
{
  "summary": "1-2 sentence executive briefing",
  "customerGoal": "What the customer wants",
  "recommendedAction": "Immediate next step for the sales or support rep"
}`;

  if (GROQ_API_KEY) {
    const raw = await callGroqChat([
      { role: 'system', content: 'You are a JSON-only response engine.' },
      { role: 'user', content: prompt }
    ]);
    if (raw) {
      try {
        const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      } catch (_) {}
    }
  }

  if (geminiClient) {
    try {
      const raw = await callGeminiChat(prompt, true);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
  }

  const lastMsg = messages[messages.length - 1]?.text || 'No recent messages';
  return {
    summary: `Customer conversation covering ${messages.length} messages. Last interaction: "${lastMsg.slice(0, 60)}..."`,
    customerGoal: "Product inquiry, pricing details, or account assistance.",
    recommendedAction: "Review inquiry, share product solution, or dispatch payment checkout link."
  };
}

/**
 * AI Copilot: Translate text into target language
 */
export async function translateMessage(text: string, targetLanguage = 'es') {
  const langNames: Record<string, string> = {
    es: 'Spanish',
    hi: 'Hindi',
    fr: 'French',
    de: 'German',
    ar: 'Arabic',
    en: 'English'
  };

  const targetName = langNames[targetLanguage] || 'English';
  const prompt = `Translate the following text into natural, fluent ${targetName}. Preserve tone and formatting. Return only the translated text with no extra commentary:
"${text}"`;

  if (GROQ_API_KEY) {
    const raw = await callGroqChat([
      { role: 'system', content: 'You are a direct translation engine. Return only the translation.' },
      { role: 'user', content: prompt }
    ]);
    if (raw) return raw;
  }

  if (geminiClient) {
    try {
      const raw = await callGeminiChat(prompt);
      if (raw) return raw;
    } catch (_) {}
  }

  return `[${targetName} Translation]: ${text}`;
}

/**
 * AI Copilot: Real-time sentiment and buyer intent score
 */
export async function analyzeThreadSentiment(messages: { text: string; sender: string }[]) {
  const textStream = messages.slice(-5).map(m => `${m.sender}: ${m.text}`).join(' ');
  const lower = textStream.toLowerCase();

  let score = 65;
  let sentiment = 'Neutral';
  let buyerIntent = 'Medium';
  const signals = [];

  if (lower.includes('price') || lower.includes('cost') || lower.includes('buy') || lower.includes('discount') || lower.includes('plan')) {
    score += 20;
    buyerIntent = 'High';
    signals.push('Pricing Interest');
  }
  if (lower.includes('demo') || lower.includes('meeting') || lower.includes('call') || lower.includes('schedule')) {
    score += 15;
    buyerIntent = 'High';
    signals.push('Demo Requested');
  }
  if (lower.includes('great') || lower.includes('thanks') || lower.includes('awesome') || lower.includes('love') || lower.includes('yes')) {
    sentiment = 'Positive';
    score += 10;
    signals.push('Positive Feedback');
  }
  if (lower.includes('slow') || lower.includes('broken') || lower.includes('issue') || lower.includes('error') || lower.includes('refund') || lower.includes('cancel')) {
    sentiment = 'Urgent';
    score -= 25;
    signals.push('Support / Retention Issue');
  }

  return {
    score: Math.min(100, Math.max(10, score)),
    sentiment,
    buyerIntent,
    signals: signals.length > 0 ? signals : ['Standard Conversation']
  };
}
