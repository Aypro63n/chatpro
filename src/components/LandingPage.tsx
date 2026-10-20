import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onNavigate?: (path: string) => void;
}

const PHONE = '+919876543210';

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin, onNavigate }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  const handleNavigate = (path: string) => {
    closeMenu();
    if (onNavigate) {
      onNavigate(path);
      return;
    }
    if (path === '/' || path.startsWith('#')) {
      window.location.assign(path);
      return;
    }
    window.location.assign(path);
  };

  const scrollTo = (id: string) => {
    closeMenu();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <a className="landing-brand" href="/" aria-label="ChatPro home" onClick={(e) => { e.preventDefault(); handleNavigate('/'); }}>
          <span className="landing-brand-mark" aria-hidden="true">C</span>
          <span>ChatPro</span>
        </a>

        <nav className="landing-links" aria-label="Landing page navigation">
          <a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>Features</a>
          <a href="#security" onClick={(e) => { e.preventDefault(); scrollTo('security'); }}>Security</a>
          <a href="/privacy" onClick={(e) => { e.preventDefault(); handleNavigate('/privacy'); }}>Privacy</a>
          <a href="/terms" onClick={(e) => { e.preventDefault(); handleNavigate('/terms'); }}>Terms</a>
        </nav>

        <div className="landing-nav-actions">
          <button type="button" className="btn btn-ghost" onClick={onLogin}>Sign in</button>
          <button type="button" className="btn btn-primary" onClick={onGetStarted}>Create free account</button>
          <button
            type="button"
            className="icon-button mobile-menu-button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {menuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>Features</a>
            <a href="#security" onClick={(e) => { e.preventDefault(); scrollTo('security'); }}>Security</a>
            <a href="/privacy" onClick={(e) => { e.preventDefault(); handleNavigate('/privacy'); }}>Privacy</a>
            <a href="/terms" onClick={(e) => { e.preventDefault(); handleNavigate('/terms'); }}>Terms</a>
            <a href={`tel:${PHONE}`}>Call ChatPro</a>
            <a href="mailto:hello@chatpro.app">Email ChatPro</a>
            <button type="button" className="btn btn-secondary" onClick={() => { closeMenu(); onLogin(); }}>Sign in</button>
          </nav>
        )}
      </header>

      <main>
        <section className="landing-hero" id="product">
          <div className="landing-hero-copy">
            <p className="landing-kicker">CHATPRO / REAL-TIME COLLABORATION</p>
            <h1>Work through conversations, not around them.</h1>
            <p className="landing-lede">
              A focused messaging workspace for developers, creators, and teams who need context, files, and decisions in one place.
            </p>
            <div className="landing-actions">
              <button type="button" className="btn btn-primary" onClick={onGetStarted}>Create free account</button>
              <button type="button" className="btn btn-secondary" onClick={onLogin}>Explore Chat</button>
            </div>
            <p className="landing-proof">Private by default · Firebase-backed · Built for teams</p>
          </div>

          <img
            className="landing-hero-image"
            src="/hero.png"
            alt="Illustration of people collaborating through ChatPro conversations"
            width={1200}
            height={900}
            loading="eager"
          />
        </section>

        <section className="landing-section" id="features">
          <p className="landing-kicker">CORE CAPABILITIES</p>
          <h2>Clarity without the ceremony.</h2>
          <ol className="landing-feature-list">
            <li>
              <h3>Direct and group chat</h3>
              <p>Move between one-to-one conversations and focused rooms without losing the thread.</p>
            </li>
            <li>
              <h3>Media and voice notes</h3>
              <p>Share images, video, files, and voice notes where people can respond in context.</p>
            </li>
            <li>
              <h3>Presence that helps</h3>
              <p>See who is available and make the next handoff without another status meeting.</p>
            </li>
          </ol>
          <div className="landing-actions">
            <button type="button" className="btn btn-lime" onClick={onGetStarted}>Start chatting free</button>
          </div>
        </section>

        <section className="landing-section landing-security" id="security">
          <div className="landing-security-copy">
            <p className="landing-kicker">SECURITY AS A BASELINE</p>
            <h2>Your conversations stay with the people in them.</h2>
          </div>
          <div className="landing-security-body">
            <p>ChatPro uses Firebase Authentication, Firestore, and Storage with authenticated access rules for accounts, messages, and media.</p>
            <div className="landing-actions">
              <a className="btn btn-outline" href="/privacy" onClick={(e) => { e.preventDefault(); handleNavigate('/privacy'); }}>Read the privacy policy</a>
            </div>
          </div>
        </section>

        <section className="landing-section landing-final-cta">
          <div>
            <p className="landing-kicker">READY TO BEGIN?</p>
            <h2>Open a better workspace.</h2>
          </div>
          <div className="landing-actions landing-actions-end">
            <p>Start with a private account and bring the conversation together.</p>
            <button type="button" className="btn btn-crimson" onClick={onGetStarted}>Join ChatPro today</button>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-top">
          <a className="landing-brand" href="/" aria-label="ChatPro home" onClick={(e) => { e.preventDefault(); handleNavigate('/'); }}>
            <span className="landing-brand-mark" aria-hidden="true">C</span>
            <span>ChatPro</span>
          </a>

          <nav className="landing-footer-links" aria-label="Footer navigation">
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>Features</a>
            <a href="#security" onClick={(e) => { e.preventDefault(); scrollTo('security'); }}>Security</a>
            <a href="/privacy" onClick={(e) => { e.preventDefault(); handleNavigate('/privacy'); }}>Privacy</a>
            <a href="/terms" onClick={(e) => { e.preventDefault(); handleNavigate('/terms'); }}>Terms</a>
            <a href={`tel:${PHONE}`} aria-label={`Call ChatPro at ${PHONE}`}>{PHONE}</a>
            <a href="mailto:hello@chatpro.app">hello@chatpro.app</a>
          </nav>
        </div>

        <p className="landing-footer-copy">© {new Date().getFullYear()} ChatPro. Made by Anurag Yadav.</p>
      </footer>
    </div>
  );
};
