import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import './Auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetData, setResetData] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/auth/forgot-password', {
        email
      });
      
      setSuccess(true);
      setResetData(res.data);
      
      // Auto redirect to reset page after 2 seconds if we got a reset code
      if (res.data.resetCode || res.data.resetToken) {
        setTimeout(() => {
          navigate('/reset-password', { 
            state: { 
              email, 
              resetToken: res.data.resetToken 
            }
          });
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🔐</h1>
          <h2>Reset Password</h2>
          <p className="auth-subtitle">
            Enter your email and we'll send you instructions to reset your password
          </p>
        </div>

        {success ? (
          <div className="success-box">
            <CheckCircle size={48} color="#10b981" />
            <h3>Check Your Email</h3>
            <p>If an account exists with {email}, we've sent password reset instructions.</p>
            
            {resetData?.resetCode && (
              <div className="dev-info">
                <strong>Development Mode - Reset Code:</strong>
                <div className="reset-code">{resetData.resetCode}</div>
                <p className="small-text">Use this code on the next page</p>
              </div>
            )}

            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/reset-password', { 
                state: { 
                  email, 
                  resetToken: resetData?.resetToken 
                }
              })}
              style={{ width: '100%', marginTop: '20px' }}
            >
              Continue to Reset Page
            </button>
          </div>
        ) : (
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

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </form>
        )}

        <button 
          className="btn btn-outline back-btn" 
          onClick={() => navigate('/')}
          style={{ width: '100%', marginTop: '16px' }}
        >
          <ArrowLeft size={18} /> Back to Login
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
