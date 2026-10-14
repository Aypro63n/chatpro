import React from 'react';
import { ArrowLeft } from 'lucide-react';

export type LegalPageKind = 'privacy' | 'terms';

export const LegalPage: React.FC<{ kind: LegalPageKind; onHome: () => void }> = ({ kind, onHome }) => {
  const privacy = kind === 'privacy';
  return (
    <main className="legal-page">
      <button type="button" className="legal-back" onClick={onHome} aria-label="Return to ChatPro home">
        <ArrowLeft size={16} aria-hidden="true" /> ChatPro
      </button>
      <p className="eyebrow">CHATPRO / {privacy ? 'PRIVACY' : 'TERMS'}</p>
      <h1>{privacy ? 'Privacy Policy' : 'Terms and Conditions'}</h1>
      <p className="page-lede">Last updated: October 12, 2026</p>
      {privacy ? (
        <div className="legal-copy">
          <h2>Information we use</h2><p>ChatPro uses account details, profile information, messages, and uploaded media to provide the messaging service. We collect only what is needed for authentication, delivery, safety, and service operation.</p>
          <h2>How we protect it</h2><p>Access to private conversations is controlled by authenticated Firebase access rules. Do not share passwords or upload information you do not have permission to share.</p>
          <h2>Your choices</h2><p>You can update profile preferences, manage notification settings, and request account support. Contact the service owner for privacy questions or deletion requests.</p>
          <h2>Contact</h2><p><a href="mailto:hello@chatpro.app">hello@chatpro.app</a></p>
        </div>
      ) : (
        <div className="legal-copy">
          <h2>Acceptable use</h2><p>Use ChatPro lawfully and respectfully. Do not abuse accounts, attempt unauthorized access, distribute harmful content, or interfere with service availability.</p>
          <h2>Your content</h2><p>You retain responsibility for content you send or upload. You must have the rights and permissions required to share it with other users.</p>
          <h2>Service changes</h2><p>ChatPro may change, suspend, or improve features as the service develops. We will take reasonable steps to preserve service reliability and protect user data.</p>
          <h2>Contact</h2><p><a href="mailto:hello@chatpro.app">hello@chatpro.app</a></p>
        </div>
      )}
    </main>
  );
};
