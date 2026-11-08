// Supabase stub / fallback (App runs purely on Firebase)
export const supabase = {
  auth: {
    signOut: async () => {}
  },
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: new Error('Supabase not configured') }),
      createSignedUrl: async () => ({ data: null, error: new Error('Supabase not configured') })
    })
  }
};

export async function syncFirebaseAuthWithSupabase() {
  return null;
}
