import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth, api } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthForms.css';

const AuthForms = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { login, register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please enter email and new password');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setIsLoading(true);
    
    try {
      await api.post('/auth/reset-password', {
        email: formData.email,
        newPassword: formData.password
      });
      setSuccess(true);
      toast.success('Password reset successfully (Demo Mode)!');
      setTimeout(() => {
        setIsForgotPassword(false);
        setSuccess(false);
        setFormData({ ...formData, email: '', password: '' });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
      toast.error(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setSuccess(false);

    try {
      if (!isLogin) {
        if (formData.name.trim().length < 2) {
          setError('Name must be at least 2 characters');
          toast.error('Name must be at least 2 characters');
          setIsLoading(false);
          return;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters');
          toast.error('Password must be at least 8 characters');
          setIsLoading(false);
          return;
        }
      }

      if (isLogin) {
        await login(formData.email, formData.password);
        setSuccess(true);
        toast.success('Login successful!');
      } else {
        await register(formData.name, formData.email, formData.password);
        setSuccess(true);
        toast.success('Account created! Please sign in.');
        setTimeout(() => {
          setIsLogin(true);
          setSuccess(false);
          setIsLoading(false);
          setFormData({ name: '', email: formData.email, password: '' });
        }, 1500);
      }
    } catch (err) {
      setError(err);
      toast.error(err || 'Something went wrong');
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-tabs">
        <button 
          type="button"
          className={`auth-tab ${isLogin && !isForgotPassword ? 'active' : ''}`} 
          onClick={() => { setIsLogin(true); setIsForgotPassword(false); setError(''); setSuccess(false); }}
        >
          Sign In
        </button>
        <button 
          type="button"
          className={`auth-tab ${!isLogin && !isForgotPassword ? 'active' : ''}`} 
          onClick={() => { setIsLogin(false); setIsForgotPassword(false); setError(''); setSuccess(false); }}
        >
          Register
        </button>
        <div className={`tab-indicator ${isForgotPassword ? 'hidden' : isLogin ? 'left' : 'right'}`} style={{ display: isForgotPassword ? 'none' : 'block' }}></div>
      </div>

      {isForgotPassword ? (
        <form onSubmit={handleForgotPassword} className="auth-form animate-fade-in" key="forgot">
          <div style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '0.95rem', padding: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning-bg)', borderRadius: '8px' }}>
            <strong style={{ color: 'var(--warning-text)' }}>Quick Reset:</strong><br/>
            Enter your registered email and a new password to reset it instantly.
          </div>
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          <div className="input-group">
            <Mail className="input-icon" size={18} />
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="input-group">
            <Lock className="input-icon" size={18} />
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              placeholder="New Password (min 8 chars)" 
              value={formData.password}
              onChange={handleChange}
              required 
              minLength={8}
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="input-hint" style={{ marginTop: '0px' }}>Password must be at least 8 characters</p>

          <button 
            type="submit" 
            className={`primary-btn submit-btn ${success ? 'success' : ''}`} 
            disabled={isLoading || success}
          >
            {isLoading ? 'Resetting...' : success ? (
              <>
                <CheckCircle size={18} />
                Password Reset!
              </>
            ) : (
              <>
                Reset Password
                <ArrowRight size={18} />
              </>
            )}
          </button>
          <button 
            type="button" 
            onClick={() => { setIsForgotPassword(false); setError(''); setFormData({ ...formData, password: '' }) }}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', marginTop: '8px', cursor: 'pointer', fontWeight: 500 }}
          >
            Back to Sign In
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form animate-fade-in" key={isLogin ? 'login' : 'register'}>
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {!isLogin && (
            <div className="input-group">
              <User className="input-icon" size={18} />
              <input 
                type="text" 
                name="name" 
                placeholder="Full Name" 
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
              />
            </div>
          )}
          
          <div className="input-group">
            <Mail className="input-icon" size={18} />
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={18} />
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {!isLogin && (
            <p className="input-hint">Password must be at least 8 characters</p>
          )}

          {isLogin && <button type="button" onClick={() => setIsForgotPassword(true)} className="forgot-password" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>Forgot password?</button>}

          <button 
            type="submit" 
            className={`primary-btn submit-btn ${success ? 'success' : ''}`} 
            disabled={isLoading || success}
          >
            {isLoading ? 'Processing...' : success ? (
              <>
                <CheckCircle size={18} />
                {isLogin ? 'Login Successful' : 'Account Created'}
              </>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default AuthForms;
