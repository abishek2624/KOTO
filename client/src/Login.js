import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sign In State
  const [signInData, setSignInData] = useState({
    username: '',
    password: ''
  });

  // Sign Up State
  const [signUpData, setSignUpData] = useState({
    username: '',
    password: '',
    disability_type: 'visual',
    caregiver_name: '',
    caregiver_relation: '',
    caregiver_phone1: '',
    caregiver_phone2: '',
    caregiver_email: ''
  });

  const handleSignInChange = (e) => {
    const { name, value } = e.target;
    setSignInData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

    try {
      const response = await fetch(`${API_BASE}/api/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signInData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // Save user data and redirect
      localStorage.setItem('user', JSON.stringify(data.user));
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 500);
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!signUpData.username || !signUpData.password || !signUpData.caregiver_name || 
        !signUpData.caregiver_relation || !signUpData.caregiver_phone1 || !signUpData.caregiver_email) {
      setError('All fields are required');
      return;
    }

    if (signUpData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpData.caregiver_email)) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError('');

    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

    try {
      const response = await fetch(`${API_BASE}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signUpData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Sign up failed');
        return;
      }

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        setIsSignIn(true);
        setSignUpData({
          username: '',
          password: '',
          disability_type: 'visual',
          caregiver_name: '',
          caregiver_relation: '',
          caregiver_phone1: '',
          caregiver_phone2: '',
          caregiver_email: ''
        });
      }, 1500);
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-animated-bg"></div>
      
      <div className="login-card">
        {/* Logo and Title */}
        <div className="login-header">
          <img src="/logo.png" alt="KOTO Logo" className="login-logo" />
          <h1 className="login-title">KOTO</h1>
          <p className="login-subtitle">Assistive Communication</p>
        </div>

        {/* Tab Toggle */}
        <div className="login-tabs">
          <button
            className={`login-tab ${isSignIn ? 'active' : ''}`}
            onClick={() => {
              setIsSignIn(true);
              setError('');
              setSuccess('');
            }}
          >
            Sign In
          </button>
          <button
            className={`login-tab ${!isSignIn ? 'active' : ''}`}
            onClick={() => {
              setIsSignIn(false);
              setError('');
              setSuccess('');
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Error Message */}
        {error && <div className="login-error-message">{error}</div>}
        {success && <div className="login-success-message">{success}</div>}

        {/* Welcome Greeting */}
        <div className="login-greeting">
          {isSignIn ? (
            <>
              <h2 className="greeting-title">Welcome Back! 👋</h2>
              <p className="greeting-subtitle">Sign in to continue your journey</p>
            </>
          ) : (
            <>
              <h2 className="greeting-title">Join Us Today! ✨</h2>
              <p className="greeting-subtitle">Create your account to get started</p>
            </>
          )}
        </div>

        {/* Sign In Form */}
        {isSignIn && (
          <form onSubmit={handleSignIn} className="login-form sign-in-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={signInData.username}
                onChange={handleSignInChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={signInData.password}
                onChange={handleSignInChange}
                disabled={loading}
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <p className="login-helper-text">
              Try: <strong>john_blind</strong> / <strong>password123</strong>
            </p>
          </form>
        )}

        {/* Sign Up Form */}
        {!isSignIn && (
          <form onSubmit={handleSignUp} className="login-form sign-up-form">
            <div className="form-row">
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Choose username"
                  value={signUpData.username}
                  onChange={handleSignUpChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Min 6 characters"
                  value={signUpData.password}
                  onChange={handleSignUpChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Your Disability Type *</label>
              <select
                name="disability_type"
                value={signUpData.disability_type}
                onChange={handleSignUpChange}
                disabled={loading}
              >
                <option value="visual">Visual Impairment (Blind)</option>
                <option value="hearing">Hearing Impairment</option>
                <option value="speech">Speech Impairment</option>
                <option value="multiple">Multi Disabilities</option>
              </select>
            </div>

            <div className="form-group">
              <label>Caregiver Name *</label>
              <input
                type="text"
                name="caregiver_name"
                placeholder="Full name of caregiver"
                value={signUpData.caregiver_name}
                onChange={handleSignUpChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Relationship to Caregiver *</label>
              <select
                name="caregiver_relation"
                value={signUpData.caregiver_relation}
                onChange={handleSignUpChange}
                disabled={loading}
              >
                <option value="">Select relationship</option>
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Sister">Sister</option>
                <option value="Brother">Brother</option>
                <option value="Caregiver">Caregiver</option>
                <option value="Support Worker">Support Worker</option>
                <option value="Carer">Carer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number 1 *</label>
                <input
                  type="tel"
                  name="caregiver_phone1"
                  placeholder="Primary phone"
                  value={signUpData.caregiver_phone1}
                  onChange={handleSignUpChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Phone Number 2</label>
                <input
                  type="tel"
                  name="caregiver_phone2"
                  placeholder="Secondary phone"
                  value={signUpData.caregiver_phone2}
                  onChange={handleSignUpChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="caregiver_email"
                placeholder="Email address"
                value={signUpData.caregiver_email}
                onChange={handleSignUpChange}
                disabled={loading}
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="login-footer">
          <p>The KOTO System - Empowering Communication</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
