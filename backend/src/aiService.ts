import { GoogleGenAI } from '@google/genai';

// Initialize the Google GenAI client.
// It will automatically pick up GEMINI_API_KEY from process.env
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

/**
 * Generate a smart response based on a customer's message and their context.
 */
export async function generateAgentResponse(
  contactName: string, 
  incomingMessage: string, 
  recentMessages: { text: string, sender: string }[] = [],
  workspaceId?: string
): Promise<string> {
  if (!aiClient) {
    return `Hi ${contactName}, I'm the Ricoz AI Agent (Mock). Please add your GEMINI_API_KEY to the .env file to enable smart AI responses!`;
  }

  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    let basePrompt = `You are a helpful, professional, and friendly customer support AI agent for a company called "Ricoz Communication".
Your goal is to assist customers quickly and accurately. Keep your responses concise (1-3 sentences) since they are sent via WhatsApp.`;
    
    if (workspaceId) {
      const config = await prisma.aIAgentConfig.findUnique({ where: { workspaceId } });
      if (config && config.isActive) {
        basePrompt = config.systemPrompt;
        if (config.businessContext) basePrompt += `\nBusiness Context: ${config.businessContext}`;
        if (config.faq) basePrompt += `\nFAQ Knowledge: ${config.faq}`;
      } else if (config && !config.isActive) {
        return ""; // Agent disabled
      }
    }

    // Construct the context/prompt for the AI
    let conversationContext = `${basePrompt}

Customer Name: ${contactName}

Recent Conversation History:
`;

    // Add recent history if available
    if (recentMessages.length > 0) {
      recentMessages.forEach((msg: any) => {
        conversationContext += `${msg.sender === 'contact' ? 'Customer' : 'Agent/Bot'}: ${msg.text}\n`;
      });
    }

    conversationContext += `Customer: ${incomingMessage}\nRicoz Bot:`;

    // Make the API call to Gemini 
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: conversationContext,
      config: {
        temperature: 0.7,
      }
    });

    const reply = response.text?.trim() || "I'm sorry, I didn't quite catch that. How can I help you today?";
    return reply;
  } catch (err) {
    console.error('Error generating AI response:', err);
    return "I'm having a little trouble connecting right now, but a human agent will assist you shortly!";
  }
}
