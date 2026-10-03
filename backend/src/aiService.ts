import { GoogleGenAI } from '@google/genai';
import { prisma } from './db';
import { retrieveRelevantKnowledge, RelevantChunk } from './ragService';

// Initialize the Google GenAI client.
let aiClient: any = null;
try {
  if (process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI();
  } else {
    console.warn('⚠️ GEMINI_API_KEY is missing from .env! AI Text Agent will use a mock response.');
  }
} catch (err) {
  console.warn('⚠️ Failed to initialize AI client. Check your GEMINI_API_KEY.');
}

export interface AgentResponseResult {
  reply: string;
  citedSources: RelevantChunk[];
  confidenceScore: number;
  isHumanHandoff: boolean;
  latencyMs: number;
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
 * Generate a smart response based on a customer's message and their context with full RAG capability.
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
 * Detailed version that returns citations, confidence, and handoff status.
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
  let basePrompt = `You are a helpful, professional, and friendly customer support AI agent for a company called "Ricoz Communication".
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
      latencyMs: Date.now() - startTime
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
- If the answer to the customer's question is not found in these sources, politely state that you do not have that specific information in your current records and offer to connect them with a human specialist.
- Do not fabricate policies, pricing, dates, or contact details not supported by the sources.
`;
      }
    } catch (ragErr) {
      console.error('RAG Retrieval warning:', ragErr);
    }
  }

  // 4. Tone & Length directives
  const toneInstruction = `\nTone & Style: Maintain a ${tone} tone. Keep your answer ${responseLength === 'concise' ? 'concise and direct (1-3 sentences), ideal for messaging platforms like WhatsApp' : 'comprehensive yet clear (3-5 sentences) with bullet points if helpful'}.`;

  // 5. Construct full conversation context
  let conversationContext = `${basePrompt}
${toneInstruction}
${ragContextSection}

Customer Name: ${contactName}

Recent Conversation History:
`;

  if (recentMessages.length > 0) {
    recentMessages.forEach((msg: any) => {
      conversationContext += `${msg.sender === 'contact' ? 'Customer' : 'Agent/Bot'}: ${msg.text}\n`;
    });
  }

  conversationContext += `Customer: ${incomingMessage}\nRicoz Bot:`;

  // 6. Generate reply with Gemini or smart local fallback
  if (!aiClient) {
    let mockReply = `Hello ${contactName}! `;
    if (citedSources.length > 0) {
      mockReply += `Based on our ${citedSources[0].title} documentation: ${citedSources[0].excerpt.slice(0, 150)}... Let me know if you have more questions!`;
    } else {
      mockReply += `I'm your Ricoz AI assistant. Please configure your GEMINI_API_KEY in settings to enable live neural generation!`;
    }
    return {
      reply: mockReply,
      citedSources,
      confidenceScore: citedSources.length > 0 ? 0.92 : 0.60,
      isHumanHandoff: false,
      latencyMs: Date.now() - startTime
    };
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: conversationContext,
      config: {
        temperature: 0.4, // lower temp for factual knowledge grounding
      }
    });

    const reply = response.text?.trim() || "I'm sorry, I didn't quite catch that. How can I help you today?";

    return {
      reply,
      citedSources,
      confidenceScore: citedSources.length > 0 ? Math.max(confidenceScore, 0.88) : 0.75,
      isHumanHandoff: false,
      latencyMs: Date.now() - startTime
    };
  } catch (err) {
    console.error('Error generating AI response:', err);
    return {
      reply: "I'm having a little trouble retrieving that information right now, but a human agent will assist you shortly!",
      citedSources,
      confidenceScore: 0.5,
      isHumanHandoff: false,
      latencyMs: Date.now() - startTime
    };
  }
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
3. "closer": Solution-focused, asking for next steps (e.g. demo, order confirmation, or payment link).

Format your response strictly as JSON:
{
  "professional": "...",
  "friendly": "...",
  "closer": "..."
}`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      const parsed = JSON.parse(response.text?.trim() || '{}');
      if (parsed.professional && parsed.friendly && parsed.closer) {
        return parsed;
      }
    } catch (e) {
      console.warn('Gemini copilot draft fallback triggered:', e);
    }
  }

  // High-fidelity fallback
  return {
    professional: `Hello ${contactName}, thank you for reaching out. We can certainly assist with this right away. Let me confirm the exact details for you.`,
    friendly: `Hi ${contactName}! 😊 Happy to help you with this today. What specific requirements or timeline do you have in mind?`,
    closer: `Hi ${contactName}, we can get this setup for you immediately. Would you like me to share a 1-click payment link or book a 15-minute onboarding demo?`
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

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      return JSON.parse(response.text?.trim() || '{}');
    } catch (e) {
      console.warn('Summary fallback triggered:', e);
    }
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

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      return response.text?.trim() || text;
    } catch (e) {
      console.warn('Translate fallback triggered:', e);
    }
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

