import React, { useEffect } from 'react';

const brand = { color: '#241519', background: '#FFFFFF' };

export const NotFound: React.FC = () => {
  useEffect(() => { document.title = 'Page not found — ChatPro'; }, []);
  return (
    <main className="not-found-page" aria-labelledby="not-found-title" style={brand}>
      <p className="landing-kicker">CHATPRO / 404</p>
      <h1 id="not-found-title">This page is not available.</h1>
      <p>The link may be outdated, or the page may have moved. Continue your conversation from the home page.</p>
      <div className="not-found-actions">
        <a className="btn btn-primary" href="/">Go to ChatPro home</a>
        <button type="button" className="btn btn-outline" onClick={() => window.history.back()}>Go back</button>
      </div>
    </main>
  );
};

export const StaticPage: React.FC<{ title: string; heading: string; paragraphs: string[] }> = ({ title, heading, paragraphs }) => {
  useEffect(() => { document.title = `${title} — ChatPro`; }, [title]);
  return (
    <main className="static-page" style={brand}>
      <p className="landing-kicker">CHATPRO / LEGAL</p>
      <h1>{heading}</h1>
      {paragraphs.map((text, index) => <p key={index}>{text}</p>)}
      <a className="back-link" href="/">← Back to ChatPro home</a>
    </main>
  );
};
