const { supabase } = require('../config/db');

async function getProfile(req, res) {
  // Fetch profile from Users2 table in Supabase
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.substring(7) : null;
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData?.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const userId = authData.user.id;
  
  // Try to fetch from Users2 table
  const { data: profileData, error: profileError } = await supabase
    .from('Users2')
    .select('*')
    .eq('id', userId)
    .single();

  // If profile exists, return it; otherwise return basic auth data
  if (!profileError && profileData) {
    return res.json({
      id: profileData.id,
      email: profileData.email,
      created_at: profileData.created_at,
      updated_at: profileData.updated_at,
      last_sign_in_at: profileData.last_sign_in_at,
      ...profileData
    });
  }

  // Fallback to auth user data if profile doesn't exist
  return res.json({ 
    id: authData.user.id, 
    email: authData.user.email, 
    user_metadata: authData.user.user_metadata 
  });
}

async function updateLocation(req, res) {
  const { latitude, longitude } = req.body || {};
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ message: 'latitude and longitude required' });
  }
  // Example: persist into a table named 'locations' (create this table in Supabase)
  // columns: user_id uuid, latitude float8, longitude float8
  const { error } = await supabase.from('locations').insert({
    user_id: req.user.id,
    latitude,
    longitude,
  });
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  return res.json({ message: 'Location updated' });
}

module.exports = { getProfile, updateLocation };


