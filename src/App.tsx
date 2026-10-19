import React, { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import ChatLayout from "./components/Chat/ChatLayout";
import { AuthModal } from "./components/AuthModal";
import { LandingPage } from "./components/LandingPage";
import { LegalPage } from "./components/LegalPage";
import { NotFound } from "./components/NotFound";
import type { User } from "./types";

export default function App() {
  const { currentUser, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [route, setRoute] = useState(() => window.location.pathname);

  useEffect(() => {
    const sync = () => setRoute(window.location.pathname);
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setRoute(path);
    window.scrollTo({ top: 0 });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-white" />
      </div>
    );
  }

  if (route === "/privacy") return <LegalPage kind="privacy" onHome={() => navigate("/")} />;
  if (route === "/terms") return <LegalPage kind="terms" onHome={() => navigate("/")} />;
  if (route !== "/" && route !== "/chat") return <NotFound />;

  if (currentUser) return <ChatLayout user={currentUser} onSignOut={() => {}} />;

  return (
    <>
      <LandingPage onGetStarted={() => setAuthOpen(true)} onLogin={() => setAuthOpen(true)} onNavigate={navigate} />
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode="login"
        onAuthenticated={() => {
          setAuthOpen(false);
          navigate('/chat');
        }}
      />
    </>
  );
}