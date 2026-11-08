import express from 'express';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Diagnostic helper to verify Cloudinary environment variables at runtime
 * without exposing sensitive API secrets in logs.
 */
function validateCloudinaryEnv() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const report = {
    cloudNameValid: !!cloudName && cloudName.trim().length > 0,
    apiKeyValid: !!apiKey && apiKey.trim().length > 0,
    apiSecretValid: !!apiSecret && apiSecret.trim().length > 0,
    cloudNameValue: cloudName ? cloudName.trim() : null,
    apiKeyPreview: apiKey ? `${apiKey.trim().slice(0, 4)}... (length: ${apiKey.trim().length})` : 'MISSING ❌',
    apiSecretPreview: apiSecret ? `[PRESENT - length: ${apiSecret.trim().length}]` : 'MISSING ❌'
  };

  console.log('[Cloudinary Runtime Diagnostic]', {
    cloudName: report.cloudNameValue || 'MISSING ❌',
    apiKey: report.apiKeyPreview,
    apiSecret: report.apiSecretPreview,
    allValid: report.cloudNameValid && report.apiKeyValid && report.apiSecretValid
  });

  return {
    isValid: report.cloudNameValid && report.apiKeyValid && report.apiSecretValid,
    cloudName: report.cloudNameValue,
    apiKey: apiKey?.trim(),
    apiSecret: apiSecret?.trim()
  };
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Cloudinary signature endpoint for secure signed uploads
  app.post('/api/cloudinary-signature', async (req, res) => {
    console.log('[Express Server /api/cloudinary-signature] Received request');
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('[Express Server] 401 Unauthorized: Missing or malformed Authorization header');
        return res.status(401).json({ error: 'Unauthorized: Missing Firebase Auth token' });
      }

      // Run runtime environment diagnostic
      const envCheck = validateCloudinaryEnv();

      if (!envCheck.isValid || !envCheck.cloudName || !envCheck.apiKey || !envCheck.apiSecret) {
        console.error('[Express Server] 500 Internal Server Error: Cloudinary environment variables validation failed!');
        return res.status(500).json({
          error: 'Cloudinary is not configured on the server. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.'
        });
      }

      const timestamp = Math.round(Date.now() / 1000);
      const folder = 'chatpro_media';
      const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;

      const signature = crypto
        .createHash('sha1')
        .update(paramsToSign + envCheck.apiSecret)
        .digest('hex');

      console.log('[Express Server] 200 OK: Successfully generated Cloudinary signature for timestamp:', timestamp);

      return res.status(200).json({
        signature,
        timestamp,
        apiKey: envCheck.apiKey,
        cloudName: envCheck.cloudName,
        folder
      });
    } catch (err: any) {
      console.error('[Express Server] 500 Internal Server Error exception:', err);
      return res.status(500).json({ error: err.message || 'Internal server error during signature generation' });
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
