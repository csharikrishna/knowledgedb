import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import './Auth.css';

function Login({ onLogin }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const endpoint = isSignup ? '/auth/signup' : '/auth/login';
      const res = await axios.post(`http://localhost:5000${endpoint}`, {
        email,
        password
      });
      
      if (res.data.token && res.data.userId) {
        onLogin(res.data.token, res.data.userId);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🧠</h1>
          <h2>{isSignup ? 'Create Your Account' : 'Welcome Back'}</h2>
          <p className="auth-subtitle">
            {isSignup ? 'Join KnowledgeDB and start managing your knowledge' : 'Sign in to access your knowledge base'}
          </p>
        </div>
        
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <Mail size={16} /> Email Address
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <Lock size={16} /> Password
            </label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength="6"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          {!isSignup && (
            <div className="forgot-password-link">
              <button 
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="link-button"
              >
                Forgot password?
              </button>
            </div>
          )}
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading} 
            style={{ width: '100%' }}
          >
            {loading ? (
              <span>Loading...</span>
            ) : isSignup ? (
              <>
                <UserPlus size={18} /> Create Account
              </>
            ) : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>
        
        <div className="auth-divider">
          <span>or</span>
        </div>
        
        <p className="auth-toggle">
          {isSignup ? 'Already have an account?' : 'Need an account?'}
          <button onClick={() => { setIsSignup(!isSignup); setError(''); }} className="toggle-link">
            {isSignup ? 'Sign In' : 'Create Account'}
          </button>
        </p>

        <div className="auth-footer">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
