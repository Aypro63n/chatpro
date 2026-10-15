import React, { useEffect, useState } from "react";
import { onAuthChange } from "./firebase/authService";
import ChatLayout from "./components/ChatLayout";
import AuthModal from "./components/AuthModal";
import LandingPage from "./components/LandingPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import NotFound from "./pages/NotFound";
import type { User } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [route, setRoute] = useState(() => window.location.pathname);

  useEffect(() => {
    return onAuthChange((fbUser) => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      const nextUser: User = {
        uid: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
        email: fbUser.email || "",
        photoURL: fbUser.photoURL || undefined,
        role: "user",
        status: "online",
        lastSeen: Date.now(),
        createdAt: Date.now(),
      };
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  // Lightweight client-side router so direct visits to /privacy and /terms
  // render real pages instead of the 404 fallback.
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

  if (route === "/privacy") return <PrivacyPage onNavigate={navigate} />;
  if (route === "/terms") return <TermsPage onNavigate={navigate} />;
  if (route !== "/" && !["/chat"].includes(route)) return <NotFound onNavigate={navigate} />;

  if (user) return <ChatLayout user={user} onSignOut={() => setUser(null)} />;

  return (
    <>
      <LandingPage onGetStarted={() => setAuthOpen(true)} onNavigate={navigate} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthenticated={setUser} />
    </>
  );
}
