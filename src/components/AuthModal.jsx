import { useState } from 'react';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      
      console.log(`📤 Sending ${isLogin ? 'login' : 'registration'} request to:`, endpoint);
      console.log('   Email:', formData.email);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      console.log(`📥 Response received:`, response.status, response.statusText);

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Something went wrong');
        setLoading(false);
        return;
      }

      // Success! Store auth data
      const token = data.access_token || data.session?.access_token;
      const refreshToken = data.refresh_token || data.session?.refresh_token;
      const user = data.user || data.session?.user;

      // Handle email confirmation required (session will be null)
      if (!token && user) {
        console.log('⚠️  Email confirmation required - session will be available after email confirmation');
        // Still store user data, but token will be null until email is confirmed
      }

      // Store user data even if token is null (for email confirmation flow)
      if (user) {
        localStorage.setItem('user_id', user.id);
        localStorage.setItem('user_email', user.email || '');
        localStorage.setItem('user_data', JSON.stringify(user));
      }

      // Store tokens only if they exist
      if (token) {
        localStorage.setItem('auth_token', token);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        if (data.expires_at || data.session?.expires_at) {
          localStorage.setItem('token_expires_at', (data.expires_at || data.session?.expires_at).toString());
        }
        console.log('✅ Auth data stored:', { 
          token: token.substring(0, 20) + '...', 
          userId: user?.id, 
          email: user?.email 
        });
      } else {
        console.log('✅ User registered - email confirmation required');
      }
      
      if (onAuthSuccess) {
        onAuthSuccess(data);
      }
      onClose();
      setFormData({ email: '', password: '', confirmPassword: '' });
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="auth-modal-header">
          <h2 className="auth-modal-title">{isLogin ? 'Welcome Back' : 'Get Started'}</h2>
          <p className="auth-modal-subtitle">
            {isLogin ? 'Sign in to continue your journey' : 'Create your account to start navigating safely'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-modal-form">
          {error && (
            <div className="auth-error">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <circle cx="10" cy="10" r="8"></circle>
                <line x1="10" y1="6" x2="10" y2="10"></line>
                <line x1="10" y1="14" x2="10.01" y2="14"></line>
              </svg>
              {error}
            </div>
          )}

          <div className="auth-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          {!isLogin && (
            <div className="auth-form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-modal-footer">
          <p>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ email: '', password: '', confirmPassword: '' });
              }}
              className="auth-toggle-btn"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <div className="auth-social">
          <button className="auth-social-btn" disabled>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button className="auth-social-btn" disabled>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16l-1.95 1.95c-.178.177-.478.264-.92.264h-1.833c-.535 0-.827.323-.827.691v2.53c0 .367.292.69.827.69h1.834c.442 0 .742.087.92.264l1.95 1.95c.18.18.27.43.27.68s-.09.5-.27.68l-1.95 1.95c-.178.177-.478.264-.92.264-.442 0-.87-.087-1.047-.264l-3.9-3.9a.935.935 0 01-.263-.68c0-.25.093-.5.263-.68l3.9-3.9c.177-.177.605-.264 1.047-.264.442 0 .742.087.92.264l1.95 1.95c.18.18.27.43.27.68s-.09.5-.27.68z"/>
            </svg>
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

