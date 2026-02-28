import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import './Auth.css';

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState(location.state?.email || '');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await axios.post('http://localhost:5000/auth/reset-password', {
        email,
        resetCode,
        resetToken: location.state?.resetToken,
        newPassword
      });
      
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/', { state: { message: 'Password reset successful! Please login.' } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🔑</h1>
          <h2>Create New Password</h2>
          <p className="auth-subtitle">
            Enter your reset code and choose a new password
          </p>
        </div>

        {success ? (
          <div className="success-box">
            <CheckCircle size={48} color="#10b981" />
            <h3>Password Reset Successful!</h3>
            <p>You can now login with your new password.</p>
            <p className="small-text">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reset Code</label>
              <input
                type="text"
                className="form-input reset-code-input"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                required
                placeholder="Enter 6-digit code"
                maxLength="6"
                pattern="[0-9]{6}"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={16} /> New Password
              </label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
                minLength="6"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
