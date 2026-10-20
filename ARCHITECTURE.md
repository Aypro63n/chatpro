# ChatPro Architecture Overview

```mermaid
flowchart LR
    User[End User]
    Browser[React + Vite Frontend\nApp Shell, Landing Page, Chat UI]
    Routes[Client Routing\nApp.tsx, Legal & NotFound Pages]
    AuthCtx[Auth Context\nFirebase Auth + user profiles + roles]
    ThemeCtx[Theme Context\nUI theme + appearance state]
    ChatSvc[Chat Service Layer\nConversations, messages, moderation, uploads]

    Firebase[(Firebase\nAuth + Firestore + Storage)]
    Supabase[(Supabase Storage\nchat-media bucket)]
    Gemini[Google Gemini AI\n@google/genai]
    Config[Configuration\nfirebase-applet-config.json + env vars]

    User --> Browser
    Browser --> Routes
    Browser --> AuthCtx
    Browser --> ThemeCtx
    Browser --> ChatSvc

    AuthCtx --> Firebase
    ChatSvc --> Firebase
    ChatSvc --> Supabase
    ChatSvc --> Gemini

    Config --> Firebase
    Config --> Supabase
    Config --> Gemini

    Firebase --> Data[(Users, Conversations, Messages, Reports, Audit Logs)]
    Supabase --> Media[(Media files / signed URLs)]
    Gemini --> AI[(AI responses / chat features)]
```

## Architecture Notes

- Frontend: Vite + React 19 app serving the client UI, auth flow, routing, and chat experience.
- State layer: `src/context/AuthContext.tsx` and `src/context/ThemeContext.tsx` manage user authentication, online state, profile data, and theme behavior.
- Service layer: `src/services/chatService.ts` handles direct/group conversations, message operations, read receipts, moderation, reports, and file/media uploads.
- Data layer: Firebase provides authentication, Firestore document storage, and storage for app data. Supabase is used for media upload and signed URL access.
- AI integration: the app uses the Google GenAI client for AI-powered chat capabilities.
- Configuration: environment variables and Firebase app config are loaded at startup to wire the browser app to backend services.
