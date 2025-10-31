const { supabase } = require('../config/db');

async function getProfile(req, res) {
  // Basic profile from auth user; extend to fetch from a 'profiles' table if present
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.substring(7) : null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  const user = data.user;
  return res.json({ id: user.id, email: user.email, user_metadata: user.user_metadata });
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


