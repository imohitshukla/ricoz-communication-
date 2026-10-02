import axios from 'axios';
import { prisma } from './db';

// pdf-parse import with fallback
let pdfParse: any = null;
try {
  pdfParse = require('pdf-parse');
} catch (e) {
  console.warn('⚠️ pdf-parse not loaded yet, will fallback to plain text parsing');
}

export interface RelevantChunk {
  documentId: string;
  title: string;
  sourceType: string;
  excerpt: string;
  score: number;
}

export interface RAGRetrievalResult {
  chunks: RelevantChunk[];
  bestScore: number;
  hasMatch: boolean;
  contextText: string;
}

/**
 * Clean & normalize text
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Estimate token count (1 token ≈ 4 characters or 0.75 words)
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Extract text from PDF buffer
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  if (!pdfParse) {
    throw new Error('PDF parsing library is unavailable.');
  }
  const data = await pdfParse(buffer);
  return sanitizeText(data.text || '');
}

/**
 * Crawl and scrape text from a public website / URL
 */
export async function scrapeUrlContent(targetUrl: string): Promise<{ title: string; content: string }> {
  let url = targetUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  const response = await axios.get(url, {
    timeout: 10000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; RicozBot/1.0; +https://ricoz.io)',
      'Accept': 'text/html,application/xhtml+xml,text/plain'
    }
  });

  const html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

  // Extract <title>
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname;

  // Strip scripts, styles, nav, footer
  let cleanText = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  cleanText = cleanText
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  return {
    title,
    content: sanitizeText(cleanText)
  };
}

/**
 * Chunk a document's text into digestible semantic passages
 */
export function chunkDocument(text: string, chunkSizeWords = 150, overlapWords = 30): string[] {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  if (words.length <= chunkSizeWords) {
    return [words.join(' ')];
  }

  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    const chunkWords = words.slice(i, i + chunkSizeWords);
    chunks.push(chunkWords.join(' '));
    i += (chunkSizeWords - overlapWords);
  }
  return chunks;
}

/**
 * Extract meaningful search terms (remove basic stop words)
 */
function extractSearchTokens(query: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'and', 'or', 'but', 'if', 'what', 'which', 'who',
    'whom', 'this', 'that', 'these', 'those', 'am', 'i', 'you', 'he', 'she',
    'it', 'we', 'they', 'my', 'your', 'his', 'her', 'their', 'how', 'can',
    'could', 'would', 'should', 'tell', 'me', 'about', 'please'
  ]);

  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !stopWords.has(token));
}

/**
 * Hybrid BM25/keyword scoring of a chunk against query
 */
function scoreChunk(chunk: string, title: string, queryTokens: string[], originalQuery: string): number {
  if (queryTokens.length === 0) return 0;

  const chunkLower = chunk.toLowerCase();
  const titleLower = title.toLowerCase();
  const origQueryLower = originalQuery.toLowerCase().trim();

  let score = 0;

  // Exact phrase match bonus
  if (origQueryLower.length > 5 && chunkLower.includes(origQueryLower)) {
    score += 4.0;
  }

  // Title match bonus
  for (const token of queryTokens) {
    if (titleLower.includes(token)) {
      score += 1.5;
    }
  }

  // Token frequency and co-occurrence scoring
  let matchedTokens = 0;
  for (const token of queryTokens) {
    const regex = new RegExp(`\\b${token}\\b`, 'g');
    const matches = (chunkLower.match(regex) || []).length;
    if (matches > 0) {
      matchedTokens++;
      score += Math.min(matches * 0.8, 3.0);
    } else if (chunkLower.includes(token)) {
      matchedTokens++;
      score += 0.4;
    }
  }

  // Proximity/Coverage multiplier: if a high percentage of tokens matched
  const coverageRatio = matchedTokens / queryTokens.length;
  score = score * (0.5 + 0.5 * coverageRatio);

  // Normalize roughly to 0.0 - 1.0 range
  const normalized = Math.min(score / 5.0, 1.0);
  return Math.round(normalized * 100) / 100;
}

/**
 * Retrieve top relevant knowledge base chunks for a given workspace and customer query
 */
export async function retrieveRelevantKnowledge(
  workspaceId: string,
  query: string,
  minConfidence = 0.20,
  maxChunks = 3
): Promise<RAGRetrievalResult> {
  const queryTokens = extractSearchTokens(query);

  // Fetch all ready knowledge docs for this workspace
  const docs = await prisma.knowledgeDocument.findMany({
    where: {
      workspaceId,
      status: 'ready'
    }
  });

  if (!docs || docs.length === 0) {
    return {
      chunks: [],
      bestScore: 0,
      hasMatch: false,
      contextText: ''
    };
  }

  const scoredChunks: RelevantChunk[] = [];

  for (const doc of docs) {
    const chunks = chunkDocument(doc.content, 180, 40);
    for (const chunk of chunks) {
      const score = scoreChunk(chunk, doc.title, queryTokens, query);
      if (score >= minConfidence) {
        scoredChunks.push({
          documentId: doc.id,
          title: doc.title,
          sourceType: doc.sourceType,
          excerpt: chunk,
          score
        });
      }
    }
  }

  // Sort by score descending
  scoredChunks.sort((a, b) => b.score - a.score);

  // Deduplicate chunks from the same document if very similar
  const topChunks = scoredChunks.slice(0, maxChunks);
  const bestScore = topChunks.length > 0 ? topChunks[0].score : 0;

  // Format context for injection into LLM prompt
  let contextText = '';
  if (topChunks.length > 0) {
    contextText = topChunks
      .map((c, i) => `[SOURCE ${i + 1}: ${c.title} (Relevance: ${Math.round(c.score * 100)}%)]\n${c.excerpt}`)
      .join('\n\n---\n\n');
  }

  return {
    chunks: topChunks,
    bestScore,
    hasMatch: topChunks.length > 0,
    contextText
  };
}
