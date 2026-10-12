import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';

export const NotFound: React.FC<{ onHome: () => void }> = ({ onHome }) => (
  <main className="not-found-page" aria-labelledby="not-found-title">
    <p className="eyebrow">CHATPRO / 404</p>
    <h1 id="not-found-title">This page is not available.</h1>
    <p className="page-lede">The link may be outdated or the page may have moved. Return to ChatPro and continue the conversation.</p>
    <div className="not-found-actions">
      <button type="button" className="cta cta-primary" onClick={onHome}><Home size={16} aria-hidden="true" /> Go home</button>
      <button type="button" className="cta cta-secondary" onClick={() => window.history.back()}><ArrowLeft size={16} aria-hidden="true" /> Go back</button>
    </div>
  </main>
);
