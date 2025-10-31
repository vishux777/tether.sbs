const { supabase, supabaseAdmin } = require('../config/db');

async function register(req, res) {
  const { email, password, data } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const { data: signUpData, error } = await supabase.auth.signUp({ email, password, options: { data } });
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  return res.status(201).json(signUpData);
}

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  return res.json(signInData);
}

module.exports = { register, login };


