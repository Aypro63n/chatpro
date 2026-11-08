import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[Vercel API /api/cloudinary-signature] Received request method:', req.method);

  if (req.method !== 'POST') {
    console.warn('[Vercel API] Method not allowed:', req.method);
    return res.status(405).setHeader('Allow', 'POST').json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('[Vercel API] 401 Unauthorized: Missing or malformed Authorization header');
      return res.status(401).json({ error: 'Unauthorized: Missing Firebase Auth token' });
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token || token.length < 10) {
      console.warn('[Vercel API] 401 Unauthorized: Invalid token payload');
      return res.status(401).json({ error: 'Unauthorized: Invalid token format' });
    }

    // Run runtime environment diagnostic
    const envCheck = validateCloudinaryEnv();

    if (!envCheck.isValid || !envCheck.cloudName || !envCheck.apiKey || !envCheck.apiSecret) {
      console.error('[Vercel API] 500 Internal Server Error: Cloudinary environment variables validation failed!');
      return res.status(500).json({
        error: 'Cloudinary is not configured on the server. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your Vercel project environment variables.'
      });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'chatpro_media';
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;

    const signature = crypto
      .createHash('sha1')
      .update(paramsToSign + envCheck.apiSecret)
      .digest('hex');

    console.log('[Vercel API] 200 OK: Successfully generated Cloudinary signature for timestamp:', timestamp);

    return res.status(200).json({
      signature,
      timestamp,
      apiKey: envCheck.apiKey,
      cloudName: envCheck.cloudName,
      folder
    });
  } catch (err: any) {
    console.error('[Vercel API] 500 Internal Server Error exception:', err);
    return res.status(500).json({ error: err.message || 'Internal server error during signature generation' });
  }
}
