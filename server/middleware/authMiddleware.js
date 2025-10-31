const { supabase } = require('../config/db');

async function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.substring(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
  req.user = { id: data.user.id, email: data.user.email };
  return next();
}

module.exports = { protect };


