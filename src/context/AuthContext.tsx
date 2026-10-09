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
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isMaintainer: boolean;
  canModerate: boolean;
  roleLevel: number;
  isOnline: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, displayName: string, username: string, photoURL?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAnonymously: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'anuragyadav3835@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update presence status helper
  const setPresence = useCallback(async (uid: string, status: 'online' | 'offline' | 'away') => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        status,
        lastSeen: new Date().toISOString()
      });
    } catch {
      // Ignore presence update errors during teardown
    }
  }, []);

  // Sync profile & presence when auth state changes
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Check admin status
        const isUserAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        setIsAdmin(isUserAdmin);

        // Fetch or listen to user document in Firestore
        const userRef = doc(db, 'users', user.uid);
        
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            // First time login or google/anonymous login user document bootstrap
            const defaultUsername = user.isAnonymous
              ? `guest_${user.uid.slice(0, 6).toLowerCase()}`
              : (user.email?.split('@')[0] || `user_${user.uid.slice(0, 5)}`).replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();

            const defaultDisplayName = user.isAnonymous
              ? `Guest (${user.uid.slice(0, 4)})`
              : (user.displayName || user.email?.split('@')[0] || 'ChatPro User');

            const newProfile: UserProfile = {
              uid: user.uid,
              displayName: defaultDisplayName,
              username: defaultUsername,
              email: user.email || '',
              photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
              bio: user.isAnonymous ? 'Visiting ChatPro as a guest.' : 'Hey there! I am using ChatPro.',
              status: 'online',
              lastSeen: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              role: isUserAdmin ? 'owner' : 'member',
              showOnlineStatus: true,
              readReceipts: true
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);

            if (isUserAdmin) {
              await setDoc(doc(db, 'admins', user.uid), {
                email: user.email,
                role: 'owner',
                createdAt: new Date().toISOString()
              }).catch(() => {});
            }
          } else {
            const data = userSnap.data() as UserProfile;
            setUserProfile(data);
            if (data.role === 'admin' || data.role === 'owner') {
              setIsAdmin(true);
            }
            // Mark online
            await updateDoc(userRef, {
              status: 'online',
              lastSeen: new Date().toISOString()
            }).catch(() => {});
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }

        // Setup real-time listener for current user's profile updates
        unsubscribeProfile = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as UserProfile;
            setUserProfile(data);
            if (data.role === 'admin' || data.role === 'owner' || user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
              setIsAdmin(true);
            }
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        });

      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, [setPresence]);

  // Presence heartbeat, idle detection (away), & tab blur/close handlers
  useEffect(() => {
    if (!currentUser) return;

    let lastActivityTime = Date.now();
    let isAway = false;

    const checkActivity = () => {
      const now = Date.now();
      const idleTime = now - lastActivityTime;
      // 3 minutes idle -> away
      if (idleTime > 180000 && !isAway && document.visibilityState === 'visible') {
        isAway = true;
        setPresence(currentUser.uid, 'away');
      }
    };

    const handleUserActivity = () => {
      lastActivityTime = Date.now();
      if (isAway && document.visibilityState === 'visible') {
        isAway = false;
        setPresence(currentUser.uid, 'online');
      }
    };

    const interval = setInterval(checkActivity, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setPresence(currentUser.uid, 'offline');
      } else {
        lastActivityTime = Date.now();
        isAway = false;
        setPresence(currentUser.uid, 'online');
      }
    };

    const handleBeforeUnload = () => {
      setPresence(currentUser.uid, 'offline');
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser, setPresence]);

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        throw new Error('Incorrect email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      } else {
        throw new Error(err.message || 'Failed to sign in.');
      }
    }
  };

  const registerWithEmail = async (
    email: string, 
    pass: string, 
    displayName: string, 
    username: string, 
    photoURL?: string
  ) => {
    try {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
      if (cleanUsername.length < 3) {
        throw new Error('Username must be at least 3 characters long.');
      }

      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const user = cred.user;

      const avatar = photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`;
      await updateAuthProfile(user, {
        displayName: displayName.trim(),
        photoURL: avatar
      });

      const isUserAdmin = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

      const newProfile: UserProfile = {
        uid: user.uid,
        displayName: displayName.trim(),
        username: cleanUsername,
        email: email.trim(),
        photoURL: avatar,
        bio: 'Hey there! I am using ChatPro.',
        status: 'online',
        lastSeen: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        role: isUserAdmin ? 'owner' : 'member',
        showOnlineStatus: true,
        readReceipts: true
      };

      await setDoc(doc(db, 'users', user.uid), newProfile);
      setUserProfile(newProfile);

      if (isUserAdmin) {
        await setDoc(doc(db, 'admins', user.uid), {
          email: email.trim(),
          role: 'owner',
          createdAt: new Date().toISOString()
        }).catch(() => {});
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists.');
      } else if (err.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters.');
      } else {
        throw new Error(err.message || 'Registration failed.');
      }
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request' || err.code === 'auth/unauthorized-domain') {
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectErr: any) {
          throw new Error(redirectErr.message || 'Google sign in failed.');
        }
      } else {
        throw new Error(err.message || 'Google sign in failed.');
      }
    }
  };

  const loginAnonymously = async () => {
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        throw new Error('Anonymous authentication is disabled in Firebase Console. Please enable it under Authentication > Sign-in method, or use Google / Email sign-in.');
      }
      throw new Error(err.message || 'Guest sign-in failed.');
    }
  };

  const logout = async () => {
    if (currentUser) {
      await setPresence(currentUser.uid, 'offline');
    }
    await signOut(auth);
    setUserProfile(null);
    setCurrentUser(null);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        throw new Error('No account found with this email.');
      }
      throw new Error(err.message || 'Failed to send password reset email.');
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('Not authenticated');
    const userRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  const refreshProfile = async () => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      setUserProfile(snap.data() as UserProfile);
    }
  };

  const isOwner = !!(
    (currentUser?.email && currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ||
    userProfile?.role === 'owner'
  );

  const isUserAdmin = !!(
    isOwner ||
    userProfile?.role === 'admin'
  );

  const isMaintainer = !!(
    isUserAdmin ||
    userProfile?.role === 'maintainer'
  );

  const canModerate = isMaintainer;

  const roleLevel = isOwner ? 4 : isUserAdmin ? 3 : isMaintainer ? 2 : 1;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isOwner,
        isAdmin: isUserAdmin,
        isMaintainer,
        canModerate,
        roleLevel,
        isOnline,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginAnonymously,
        logout,
        resetPassword,
        updateProfileData,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
