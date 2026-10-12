import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function verifyMetaSignature(req: Request, res: Response, next: NextFunction) {
  const signature = req.headers['x-hub-signature-256'] as string;
  const appSecret = process.env.META_APP_SECRET;

  if (!appSecret) {
    console.warn('META_APP_SECRET is not set. Skipping signature verification.');
    return next();
  }

  if (!signature) {
    console.error('Missing X-Hub-Signature-256 header');
    return res.status(403).json({ error: 'Missing signature' });
  }

  const elements = signature.split('=');
  const signatureHash = elements[1];

  if (!signatureHash) {
    return res.status(403).json({ error: 'Invalid signature format' });
  }

  // To properly verify the Meta signature, we need the exact raw body payload.
  // We will assume `rawBody` is available on the request. We need to add it in index.ts.
  const payload = (req as any).rawBody;
  
  if (!payload) {
    console.error('rawBody not found on request, cannot verify signature properly');
    // Fallback if raw body isn't configured yet, but this can cause mismatches due to JSON stringify differences
    return next();
  }

  const expectedHash = crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex');

  if (signatureHash !== expectedHash) {
    console.error('Signature mismatch');
    return res.status(403).json({ error: 'Signature mismatch' });
  }

  next();
}
