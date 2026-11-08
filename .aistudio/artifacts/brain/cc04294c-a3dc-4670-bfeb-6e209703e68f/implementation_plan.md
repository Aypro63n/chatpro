# Implementation Plan - Cloudinary Image Upload Migration

## Proposed Changes

### 1. Server-Side Endpoint (`server.ts`)
- Create an Express server `server.ts` mounting Vite middleware in dev and serving static build in production.
- Add POST `/api/cloudinary-signature` endpoint.
- Verify Firebase Auth ID token from `Authorization: Bearer <token>` header (or optional fallback during development).
- Generate Cloudinary SHA-1 upload signature using `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
- Return `timestamp`, `signature`, `apiKey`, `cloudName`, and `folder`.

### 2. Package Configuration (`package.json`)
- Update `scripts` in `package.json` to use `"dev": "tsx server.ts"` and `"start": "node server.ts"`.

### 3. Frontend Cloudinary Uploader (`src/services/chatService.ts`)
- Update `uploadMediaFile` to fetch signature from `/api/cloudinary-signature`.
- Upload directly from browser to `https://api.cloudinary.com/v1_1/{cloudName}/image/upload` using `XMLHttpRequest` to track accurate 0% to 100% upload progress.
- Support JPG, JPEG, PNG, WEBP, and GIF. Enforce 10MB file size limit.
- Return Cloudinary `secure_url`.

### 4. Vercel Environment Variables
- Document required environment variables:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- (Note: Vercel also automatically handles Node.js API routes in `api/` or `server.ts`).

### 5. Verification
- Run `compile_applet` and `lint_applet` (`tsc --noEmit`).
