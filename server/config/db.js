const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Only create Supabase clients if environment variables are provided
// This allows the server to start even without Supabase configured (e.g., for directions API)
let supabase = null;
let supabaseAdmin = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  // Public client (useful for verifying user tokens via auth.getUser)
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  });
  
  // Service client for privileged server operations (do NOT expose this key to the client)
  if (SUPABASE_SERVICE_ROLE_KEY) {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });
    console.log('✅ Supabase Admin client initialized (can insert into Users2 table)');
  } else {
    console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not set - profile insertion will fail');
  }
  
  console.log('Supabase client initialized');
} else {
  console.log('Supabase not configured - auth/user routes will not work, but directions API will work');
}

module.exports = { supabase, supabaseAdmin };


