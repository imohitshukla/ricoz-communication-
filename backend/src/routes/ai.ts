import { Router } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';
import {
  parsePdfBuffer,
  scrapeUrlContent,
  sanitizeText,
  estimateTokenCount,
  retrieveRelevantKnowledge
} from '../ragService';
import { generateAgentResponseDetailed } from '../aiService';

const router = Router();

// Helper to get workspace from user
async function getWorkspaceId(userId: string): Promise<string | null> {
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  return dbUser ? dbUser.workspaceId : null;
}

// ==========================================
// 1. CONFIGURATION ROUTES
// ==========================================

// @route   GET /api/ai/config
// @desc    Get AI Agent Config for the user's workspace
router.get('/config', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) return res.status(404).json({ error: 'Workspace not found' });

    let config = await prisma.aIAgentConfig.findUnique({
      where: { workspaceId }
    });

    if (!config) {
      config = await prisma.aIAgentConfig.create({
        data: {
          workspaceId,
          isActive: false,
          systemPrompt: "You are a helpful customer support agent for Ricoz Communication.",
          tone: "Professional",
          responseLength: "concise",
          humanHandoff: true,
          handoffKeywords: "human,manager,agent,representative,support,person",
          confidenceThreshold: 0.65
        }
      });
    }

    // Also get knowledge document stats
    const docCount = await prisma.knowledgeDocument.count({ where: { workspaceId } });
    const docs = await prisma.knowledgeDocument.findMany({
      where: { workspaceId },
      select: { tokenCount: true }
    });
    const totalTokens = docs.reduce((acc, d) => acc + (d.tokenCount || 0), 0);

    res.json({
      ...config,
      stats: {
        totalDocuments: docCount,
        totalTokens
      }
    });
  } catch (error) {
    console.error('Get AI config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/ai/config
// @desc    Update AI Agent Config
router.post('/config', authenticate, async (req, res) => {
  const {
    isActive,
    systemPrompt,
    businessContext,
    faq,
    tone,
    responseLength,
    humanHandoff,
    handoffKeywords,
    confidenceThreshold
  } = req.body;

  try {
    const user = (req as any).user;
    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) return res.status(404).json({ error: 'Workspace not found' });

    const config = await prisma.aIAgentConfig.upsert({
      where: { workspaceId },
      update: {
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        systemPrompt: systemPrompt !== undefined ? systemPrompt : undefined,
        businessContext: businessContext !== undefined ? businessContext : undefined,
        faq: faq !== undefined ? faq : undefined,
        tone: tone || undefined,
        responseLength: responseLength || undefined,
        humanHandoff: humanHandoff !== undefined ? Boolean(humanHandoff) : undefined,
        handoffKeywords: handoffKeywords !== undefined ? handoffKeywords : undefined,
        confidenceThreshold: confidenceThreshold !== undefined ? Number(confidenceThreshold) : undefined,
      },
      create: {
        workspaceId,
        isActive: Boolean(isActive),
        systemPrompt: systemPrompt || "You are a helpful customer support agent for Ricoz Communication.",
        businessContext,
        faq,
        tone: tone || "Professional",
        responseLength: responseLength || "concise",
        humanHandoff: humanHandoff !== undefined ? Boolean(humanHandoff) : true,
        handoffKeywords: handoffKeywords || "human,manager,agent,representative,support,person",
        confidenceThreshold: confidenceThreshold ? Number(confidenceThreshold) : 0.65
      }
    });

    res.json(config);
  } catch (error) {
    console.error('Update AI config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// 2. KNOWLEDGE BASE DOCUMENTS
// ==========================================

// @route   GET /api/ai/documents
// @desc    List all knowledge documents for current workspace
router.get('/documents', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) return res.status(404).json({ error: 'Workspace not found' });

    const documents = await prisma.knowledgeDocument.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        sourceType: true,
        fileType: true,
        fileSize: true,
        summary: true,
        tokenCount: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(documents);
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge documents' });
  }
});

// @route   POST /api/ai/documents/text
// @desc    Add document from raw text or FAQ block
router.post('/documents/text', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) return res.status(404).json({ error: 'Workspace not found' });

    const { title, content, sourceType } = req.body;
    if (!title || !content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const clean = sanitizeText(content);
    const tokens = estimateTokenCount(clean);
    const summary = clean.slice(0, 180) + (clean.length > 180 ? '...' : '');

    const document = await prisma.knowledgeDocument.create({
      data: {
        workspaceId,
        title: title.trim(),
        content: clean,
        sourceType: sourceType || 'text',
        fileType: 'txt',
        fileSize: Buffer.byteLength(clean, 'utf8'),
        tokenCount: tokens,
        summary,
        status: 'ready'
      }
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Create text document error:', error);
    res.status(500).json({ error: 'Failed to save knowledge document' });
  }
});

// @route   POST /api/ai/documents/url
// @desc    Scrape website URL and add as knowledge document
router.post('/documents/url', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) return res.status(404).json({ error: 'Workspace not found' });

    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ error: 'A valid URL is required' });
    }

    // Scrape URL
    const { title, content } = await scrapeUrlContent(url);
    if (!content || content.length < 20) {
      return res.status(400).json({ error: 'Could not extract readable text from that webpage' });
    }

    const tokens = estimateTokenCount(content);
    const summary = `Crawled from ${url}. ${content.slice(0, 140)}...`;

    const document = await prisma.knowledgeDocument.create({
      data: {
        workspaceId,
        title: title || url,
        content,
        sourceType: 'url',
        fileType: 'web',
        fileSize: Buffer.byteLength(content, 'utf8'),
        tokenCount: tokens,
        summary,
        status: 'ready'
      }
    });

    res.status(201).json(document);
  } catch (error: any) {
    console.error('Crawl URL error:', error);
    res.status(500).json({ error: error.message || 'Failed to crawl website URL' });
  }
});

// @route   POST /api/ai/documents/upload
// @desc    Upload file (PDF, TXT, CSV, MD, JSON) via base64 or text
router.post('/documents/upload', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) return res.status(404).json({ error: 'Workspace not found' });

    const { fileName, fileType, base64Data, rawText } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required' });
    }

    let extractedText = '';
    const cleanType = (fileType || fileName.split('.').pop() || 'txt').toLowerCase();

    if (cleanType === 'pdf' && base64Data) {
      const buffer = Buffer.from(base64Data, 'base64');
      extractedText = await parsePdfBuffer(buffer);
    } else if (rawText) {
      extractedText = rawText;
    } else if (base64Data) {
      const buffer = Buffer.from(base64Data, 'base64');
      extractedText = buffer.toString('utf-8');
    }

    extractedText = sanitizeText(extractedText);
    if (!extractedText || extractedText.length < 5) {
      return res.status(400).json({ error: 'Could not extract valid text content from this file' });
    }

    const tokens = estimateTokenCount(extractedText);
    const summary = extractedText.slice(0, 180) + (extractedText.length > 180 ? '...' : '');

    const document = await prisma.knowledgeDocument.create({
      data: {
        workspaceId,
        title: fileName,
        content: extractedText,
        sourceType: 'file',
        fileType: cleanType,
        fileSize: Buffer.byteLength(extractedText, 'utf8'),
        tokenCount: tokens,
        summary,
        status: 'ready'
      }
    });

    res.status(201).json(document);
  } catch (error: any) {
    console.error('File upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to process and index document' });
  }
});

// @route   DELETE /api/ai/documents/:id
// @desc    Delete a knowledge document
router.delete('/documents/:id', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) return res.status(404).json({ error: 'Workspace not found' });

    const id = String(req.params.id);

    // Verify ownership
    const existing = await prisma.knowledgeDocument.findFirst({
      where: { id, workspaceId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await prisma.knowledgeDocument.delete({ where: { id } });

    res.json({ success: true, message: 'Document removed from knowledge base' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// ==========================================
// 3. RAG SEARCH TEST & LIVE SANDBOX CHAT
// ==========================================

// @route   POST /api/ai/test-rag
// @desc    Test knowledge retrieval query directly
router.post('/test-rag', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) return res.status(404).json({ error: 'Workspace not found' });

    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const result = await retrieveRelevantKnowledge(workspaceId, query, 0.15, 4);
    res.json(result);
  } catch (error) {
    console.error('Test RAG error:', error);
    res.status(500).json({ error: 'Failed to search knowledge base' });
  }
});

// @route   POST /api/ai/sandbox/chat
// @desc    Live interactive sandbox preview of AI Agent with RAG sources
router.post('/sandbox/chat', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) return res.status(404).json({ error: 'Workspace not found' });

    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const recentMessages = Array.isArray(history) ? history : [];
    const contactName = user.name || 'Sandbox Tester';

    const result = await generateAgentResponseDetailed(
      contactName,
      message,
      recentMessages,
      workspaceId,
      true
    );

    res.json(result);
  } catch (error) {
    console.error('Sandbox chat error:', error);
    res.status(500).json({ error: 'Failed to process sandbox message' });
  }
});

export const aiRouter = router;
