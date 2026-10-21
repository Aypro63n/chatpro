import { createClient } from '@supabase/supabase-js';
import { auth } from './firebase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: async (url, options = {}) => {
      // Automatically inject the latest Firebase ID token into every request header
      const user = auth.currentUser;
      if (user) {
        try {
          // getIdToken(false) returns the cached token, or refreshes if expired
          const token = await user.getIdToken(false);
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          };
        } catch (error) {
          console.error('Error fetching Firebase token for Supabase request:', error);
        }
      }
      return fetch(url, options);
    },
  },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

/**
 * Ensures the Supabase client is aware of the Firebase authentication state.
 * With the custom fetch wrapper, this now primarily handles session cleanup.
 */
export async function syncFirebaseAuthWithSupabase() {
  const user = auth.currentUser;
  if (!user) {
    try {
      await supabase.auth.signOut();
    } catch {
      // No active session to clear; safe to ignore.
    }
    return null;
  }

  try {
    // Ensure the token is valid/refreshed upon initial sync
    return await user.getIdToken(true);
  } catch (error) {
    console.error('Failed to refresh Firebase ID token for Supabase:', error);
    return null;
  }
}
