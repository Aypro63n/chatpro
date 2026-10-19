import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInAnonymously,
  updateProfile as updateAuthProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { supabase, syncFirebaseAuthWithSupabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null; userProfile: UserProfile | null; loading: boolean;
  isOwner: boolean; isAdmin: boolean; isMaintainer: boolean; canModerate: boolean;
  roleLevel: number; isOnline: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, displayName: string, username: string, photoURL?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>; loginAnonymously: () => Promise<void>;
  logout: () => Promise<void>; resetPassword: (email: string) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>; refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator === 'undefined' ? true : navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline); window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const setPresence = useCallback(async (uid: string, status: 'online' | 'offline' | 'away') => {
    try { await updateDoc(doc(db, 'users', uid), { status, lastSeen: new Date().toISOString() }); } catch { /* teardown/offline */ }
  }, []);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // Sync Firebase token with Supabase client on every auth state change
      await syncFirebaseAuthWithSupabase();

      unsubscribeProfile?.(); unsubscribeProfile = undefined;
      setCurrentUser(user); setUserProfile(null);
      if (!user) { setLoading(false); return; }

      const userRef = doc(db, 'users', user.uid);
      try {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          const defaultUsername = (user.email?.split('@')[0] || `user_${user.uid.slice(0, 5)}`).replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
          const profile: UserProfile = {
            uid: user.uid, displayName: user.displayName || user.email?.split('@')[0] || 'ChatPro User',
            username: defaultUsername || `user_${user.uid.slice(0, 5)}`, email: user.email || '',
            photoURL: user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`,
            bio: 'Hey there! I am using ChatPro.', status: 'online', lastSeen: new Date().toISOString(),
            createdAt: new Date().toISOString(), role: 'member', showOnlineStatus: true, readReceipts: true
          };
          await setDoc(userRef, profile); setUserProfile(profile);
        } else {
          await updateDoc(userRef, { status: 'online', lastSeen: new Date().toISOString() }).catch(() => {});
          setUserProfile(userSnap.data() as UserProfile);
        }
        unsubscribeProfile = onSnapshot(userRef, (snapshot) => { if (snapshot.exists()) setUserProfile(snapshot.data() as UserProfile); }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`));
      } catch (error) { console.error('Unable to load profile', error); }
      setLoading(false);
    });
    return () => { unsubscribeAuth(); unsubscribeProfile?.(); };
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    let lastActivityTime = Date.now(); let isAway = false;
    const checkActivity = () => { if (Date.now() - lastActivityTime > 180000 && !isAway && document.visibilityState === 'visible') { isAway = true; setPresence(currentUser.uid, 'away'); } };
    const activity = () => { lastActivityTime = Date.now(); if (isAway && document.visibilityState === 'visible') { isAway = false; setPresence(currentUser.uid, 'online'); } };
    const interval = window.setInterval(checkActivity, 30000);
    const visibility = () => document.visibilityState === 'hidden' ? setPresence(currentUser.uid, 'offline') : setPresence(currentUser.uid, 'online');
    const unload = () => { void setPresence(currentUser.uid, 'offline'); };
    window.addEventListener('mousemove', activity); window.addEventListener('keydown', activity); window.addEventListener('click', activity); window.addEventListener('scroll', activity); window.addEventListener('touchstart', activity);
    document.addEventListener('visibilitychange', visibility); window.addEventListener('beforeunload', unload);
    return () => { clearInterval(interval); window.removeEventListener('mousemove', activity); window.removeEventListener('keydown', activity); window.removeEventListener('click', activity); window.removeEventListener('scroll', activity); window.removeEventListener('touchstart', activity); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('beforeunload', unload); };
  }, [currentUser, setPresence]);

  const loginWithEmail = async (email: string, pass: string) => {
    try { await signInWithEmailAndPassword(auth, email.trim(), pass); }
    catch (err: any) { if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') throw new Error('Incorrect email or password.'); if (err.code === 'auth/too-many-requests') throw new Error('Too many failed attempts. Please try again later.'); throw new Error(err.message || 'Failed to sign in.'); }
  };

  const registerWithEmail = async (email: string, pass: string, displayName: string, username: string, photoURL?: string) => {
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
    if (cleanUsername.length < 3) throw new Error('Username must be at least 3 characters long.');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass); const user = cred.user;
      const avatar = photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`;
      await updateAuthProfile(user, { displayName: displayName.trim(), photoURL: avatar });
      await setDoc(doc(db, 'users', user.uid), { uid: user.uid, displayName: displayName.trim(), username: cleanUsername, email: email.trim(), photoURL: avatar, bio: 'Hey there! I am using ChatPro.', status: 'online', lastSeen: new Date().toISOString(), createdAt: new Date().toISOString(), role: 'member', showOnlineStatus: true, readReceipts: true } satisfies UserProfile);
    } catch (err: any) { if (err.code === 'auth/email-already-in-use') throw new Error('An account with this email already exists.'); if (err.code === 'auth/weak-password') throw new Error('Password should be at least 6 characters.'); throw new Error(err.message || 'Registration failed.'); }
  };

  const loginWithGoogle = async () => { const provider = new GoogleAuthProvider(); try { await signInWithPopup(auth, provider); } catch (err: any) { if (['auth/popup-blocked', 'auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(err.code)) { await signInWithRedirect(auth, provider); } else throw new Error(err.message || 'Google sign in failed.'); } };
  const loginAnonymously = async () => { try { await signInAnonymously(auth); } catch (err: any) { if (err.code === 'auth/operation-not-allowed') throw new Error('Anonymous authentication is disabled. Enable it in Firebase or use Google / Email sign-in.'); throw new Error(err.message || 'Guest sign-in failed.'); } };
  const logout = async () => { if (currentUser) await setPresence(currentUser.uid, 'offline'); await signOut(auth); setUserProfile(null); setCurrentUser(null); };
  const resetPassword = async (email: string) => { try { await sendPasswordResetEmail(auth, email.trim()); } catch (err: any) { if (err.code === 'auth/user-not-found') throw new Error('No account found with this email.'); throw new Error('Failed to send password reset email.'); } };
  const updateProfileData = async (data: Partial<UserProfile>) => { if (!currentUser) throw new Error('Not authenticated'); try { await updateDoc(doc(db, 'users', currentUser.uid), { ...data, updatedAt: new Date().toISOString() }); setUserProfile((prev) => prev ? { ...prev, ...data } : null); } catch (error) { handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`); } };
  const refreshProfile = async () => { if (!currentUser) return; const snap = await getDoc(doc(db, 'users', currentUser.uid)); if (snap.exists()) setUserProfile(snap.data() as UserProfile); };

  const isOwner = userProfile?.role === 'owner';
  const isAdmin = isOwner || userProfile?.role === 'admin';
  const isMaintainer = isAdmin || userProfile?.role === 'maintainer';
  return <AuthContext.Provider value={{ currentUser, userProfile, loading, isOwner, isAdmin, isMaintainer, canModerate: isMaintainer, roleLevel: isOwner ? 4 : isAdmin ? 3 : isMaintainer ? 2 : 1, isOnline, loginWithEmail, registerWithEmail, loginWithGoogle, loginAnonymously, logout, resetPassword, updateProfileData, refreshProfile }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used within an AuthProvider'); return context; };
