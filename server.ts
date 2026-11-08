import express from 'express';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Cloudinary signature endpoint for secure signed uploads
  app.post('/api/cloudinary-signature', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Allow unauthenticated fallback for development testing if configured, otherwise require auth
        if (process.env.NODE_ENV === 'production') {
          return res.status(401).json({ error: 'Unauthorized: Missing Firebase Auth token' });
        }
      }

      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (!cloudName || !apiKey || !apiSecret) {
        console.error('[Cloudinary Server] Missing Cloudinary environment variables.');
        return res.status(500).json({ error: 'Cloudinary is not configured on the server.' });
      }

      const timestamp = Math.round(new Date().getTime() / 1000);
      const folder = 'chatpro_media';
      
      // Generate signature according to Cloudinary spec:
      // string to sign: sorted params like folder=...&timestamp=... + api_secret
      const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
      const signature = crypto
        .createHash('sha1')
        .update(paramsToSign + apiSecret)
        .digest('hex');

      return res.json({
        signature,
        timestamp,
        apiKey,
        cloudName,
        folder
      });
    } catch (err: any) {
      console.error('[Cloudinary Server] Signature generation error:', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
