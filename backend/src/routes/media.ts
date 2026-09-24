import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import fs from 'fs';
import path from 'path';

export const mediaRouter = Router();

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

mediaRouter.use(authenticate);

/**
 * @route   POST /api/media/upload
 * @desc    Upload media (image, audio, document) for chat attachments
 */
mediaRouter.post('/upload', async (req, res) => {
  try {
    const { filename, mimeType, base64Data } = req.body;

    if (!base64Data) {
      return res.status(400).json({ error: 'base64Data is required' });
    }

    const ext = filename ? path.extname(filename) : '.png';
    const safeName = `${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
    const filePath = path.join(uploadsDir, safeName);

    // Strip prefix if present (e.g. "data:image/png;base64,")
    const cleanBase64 = base64Data.replace(/^data:([A-Za-z-+\/]+);base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeName}`;

    res.json({
      success: true,
      url: publicUrl,
      filename: safeName,
      size: buffer.length,
      mimeType: mimeType || 'application/octet-stream'
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ error: 'Failed to upload media file' });
  }
});
