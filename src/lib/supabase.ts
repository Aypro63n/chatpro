import { createClient } from '@supabase/supabase-js';
import { auth } from './firebase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      // Tokens are managed via syncFirebaseAuthWithSupabase
    },
  },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

/**
 * Dynamically updates the Supabase client with the current Firebase ID token.
 * This should be called whenever the Firebase auth state changes.
 */
export async function syncFirebaseAuthWithSupabase() {
  const user = auth.currentUser;
  if (!user) {
    await supabase.auth.signOut();
    return null;
  }

  try {
    const token = await user.getIdToken(true);

    // Use the official integration approach:
    // Manually set the Authorization header for the Supabase client
    // so that every subsequent request carries the Firebase JWT.
    supabase.setSession({
      access_token: token,
      refresh_token: '', // Firebase manages its own refresh
    });

    return token;
  } catch (error) {
    console.error('Failed to fetch Firebase ID token for Supabase:', error);
    return null;
  }
}
