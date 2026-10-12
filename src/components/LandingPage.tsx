import React from 'react';
import { ArrowRight, LockKeyhole, MessageSquare, Paperclip, Search, Send, Users } from 'lucide-react';
import { WorksWheel, type WorksWheelItem } from './ui/works-wheel';

interface LandingPageProps { onGetStarted: () => void; onLogin: () => void; }
const previewMessages = [
  { name: 'Maya Chen', text: 'The launch notes are ready for review.', time: '09:41', own: false },
  { name: 'You', text: 'I will review them this afternoon.', time: '09:42', own: true },
  { name: 'Maya Chen', text: 'I added the final files to the thread.', time: '09:43', own: false },
];
const wheelItems: WorksWheelItem[] = [
  { title: 'Direct conversations', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=72', href: '#features' },
  { title: 'Media in context', image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1000&q=72', href: '#features' },
  { title: 'Focused group rooms', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=72', href: '#product' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => (
  <div className="landing-page">
    <header className="landing-nav">
      <a className="landing-brand" href="/" aria-label="ChatPro home"><span className="landing-brand-mark">C</span><span>ChatPro</span></a>
      <nav className="landing-links" aria-label="Landing page navigation"><a href="#product">Product</a><a href="#features">Features</a><a href="#security">Security</a></nav>
      <div className="landing-nav-actions"><button type="button" className="landing-link-button" onClick={onLogin}>Sign in</button><button type="button" className="landing-button landing-button-dark" onClick={onGetStarted}>Create account <ArrowRight size={15} aria-hidden="true" /></button></div>
    </header>
    <main>
      <section className="landing-hero" id="product">
        <div className="landing-hero-copy"><p className="landing-kicker">REAL TIME MESSAGING FOR TEAMS AND FRIENDS</p><h1>Keep conversations clear, private, and moving.</h1><p className="landing-lede">ChatPro brings direct messages, group conversations, media, and presence into one focused workspace.</p><div className="landing-actions"><button type="button" className="landing-button landing-button-dark" onClick={onGetStarted}>Create your account <ArrowRight size={15} aria-hidden="true" /></button><button type="button" className="landing-button landing-button-light" onClick={onLogin}>Sign in to ChatPro</button></div><p className="landing-note">Email and Google sign in are supported. Private conversations require authentication.</p></div>
        <div className="chat-preview" aria-label="ChatPro application preview"><div className="preview-sidebar"><div className="preview-sidebar-top"><strong>Messages</strong><button type="button" aria-label="Search conversations"><Search size={15} /></button></div><div className="preview-search">Search conversations</div><div className="preview-thread preview-thread-active"><span className="preview-avatar">MC</span><span><strong>Maya Chen</strong><small>Final files are in the thread</small></span><time>09:43</time></div><div className="preview-thread"><span className="preview-avatar preview-avatar-muted">DS</span><span><strong>Design sync</strong><small>Three members</small></span><time>Tue</time></div><div className="preview-thread"><span className="preview-avatar preview-avatar-muted">PR</span><span><strong>Project room</strong><small>New message</small></span><time>Mon</time></div></div><div className="preview-conversation"><div className="preview-header"><span><strong>Maya Chen</strong><small>Available now</small></span><button type="button" aria-label="Conversation members"><Users size={17} /></button></div><div className="preview-messages">{previewMessages.map((message) => <div key={`${message.name}-${message.time}`} className={`preview-message-row ${message.own ? 'preview-message-own' : ''}`}><div className="preview-message"><small>{message.name} · {message.time}</small><p>{message.text}</p></div></div>)}</div><div className="preview-composer"><Paperclip size={16} aria-hidden="true" /><span>Write a message</span><button type="button" aria-label="Send message"><Send size={15} /></button></div></div></div>
      </section>
      <section className="landing-wheel-section" aria-labelledby="wheel-heading"><div className="landing-section-heading"><p className="landing-kicker">SEE THE WORKSPACE</p><h2 id="wheel-heading">Move through the parts of a conversation.</h2></div><WorksWheel items={wheelItems} label="ChatPro workspace" action="Explore" /></section>
      <section className="landing-section landing-section-border" id="features"><div className="landing-section-heading"><p className="landing-kicker">BUILT FOR THE CONVERSATION</p><h2>Everything important stays close to the message.</h2></div><div className="landing-feature-list"><article><MessageSquare size={20} aria-hidden="true" /><h3>Direct and group chat</h3><p>Move between one to one conversations and focused group rooms without losing context.</p></article><article><Paperclip size={20} aria-hidden="true" /><h3>Media in context</h3><p>Share files, images, and voice notes where people can understand and respond to them.</p></article><article><Users size={20} aria-hidden="true" /><h3>Useful presence</h3><p>See when people are available and keep status information clear and understandable.</p></article></div></section>
      <section className="landing-section landing-security" id="security"><div><p className="landing-kicker">PRIVACY BY DEFAULT</p><h2>Access belongs to the people in the conversation.</h2></div><div><p>ChatPro uses Firebase Authentication, Firestore, and Storage for account access, messages, and media. Private conversations are protected by authenticated access rules.</p><a className="landing-text-link" href="/privacy">Read the privacy policy <ArrowRight size={15} aria-hidden="true" /></a></div></section>
      <section className="landing-section landing-final-cta"><LockKeyhole size={20} aria-hidden="true" /><div><h2>Start with a private workspace.</h2><p>Create an account to open your inbox and begin a conversation.</p></div><button type="button" className="landing-button landing-button-dark" onClick={onGetStarted}>Create account <ArrowRight size={15} aria-hidden="true" /></button></section>
    </main>
    <footer className="landing-footer"><a className="landing-brand" href="/" aria-label="ChatPro home"><span className="landing-brand-mark">C</span><span>ChatPro</span></a><div className="landing-footer-links"><a href="#product">Product</a><a href="#features">Features</a><a href="#security">Security</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="mailto:hello@chatpro.app">hello@chatpro.app</a></div><p>© 2026 ChatPro. All rights reserved.</p></footer>
  </div>
);
