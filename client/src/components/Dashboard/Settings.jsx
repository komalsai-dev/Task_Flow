import React, { useEffect, useState } from 'react';
import { api } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import './Settings.css';

const Settings = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        setProfile({ name: res.data.name, email: res.data.email });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg({ type: '', text: '' });
    try {
      await api.put('/users/me', { name: profile.name, email: profile.email });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      toast.success('Profile updated!');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update profile';
      setProfileMsg({ type: 'error', text: msg });
      toast.error(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwords.newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters.' });
      toast.error('Password must be at least 8 characters');
      return;
    }
    setIsSavingPassword(true);
    setPasswordMsg({ type: '', text: '' });
    try {
      await api.put('/users/me', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed!');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to change password';
      setPasswordMsg({ type: 'error', text: msg });
      toast.error(msg);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setIsSendingReset(true);
    // redirect user to use the login page reset flow instead
    setTimeout(() => {
      setIsSendingReset(false);
      toast.error('Demo Mode: Please log out and use the Forgot Password link on the login page to instantly reset it.', { duration: 5000 });
    }, 1000);
  };

  const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <div className="settings-page">
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '4px' }}>Settings</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your account and preferences</p>
      </div>

      {isLoadingProfile ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading profile...</p>
      ) : (
        <div className="settings-grid">
          {/* Profile Section */}
          <div className="settings-card glass-panel">
            <div className="settings-card-header">
              <User size={20} />
              <h3>Profile Information</h3>
            </div>

            <div className="avatar-row">
              <div className="avatar-circle">{initials}</div>
              <div>
                <p className="avatar-name">{profile.name}</p>
                <p className="avatar-email">{profile.email}</p>
                <span className="role-badge">{authUser?.role || 'MEMBER'}</span>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="settings-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Your full name"
                  className="settings-input"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  placeholder="your@email.com"
                  className="settings-input"
                />
              </div>
              {profileMsg.text && (
                <p className={`settings-msg ${profileMsg.type}`}>{profileMsg.text}</p>
              )}
              <button type="submit" className="primary-btn settings-save-btn" disabled={isSavingProfile}>
                <Save size={16} />
                {isSavingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Password Section */}
          <div className="settings-card glass-panel">
            <div className="settings-card-header">
              <Lock size={20} />
              <h3>Change Password</h3>
            </div>

            <form onSubmit={handlePasswordSave} className="settings-form">
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Current Password</label>
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    disabled={isSendingReset}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
                  >
                    {isSendingReset ? 'Sending...' : 'Forgot password?'}
                  </button>
                </div>
                <input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="settings-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                  placeholder="At least 8 characters"
                  className="settings-input"
                  required
                  minLength={8}
                />
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', opacity: 0.8 }}>Password must be at least 8 characters</p>
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  placeholder="Repeat new password"
                  className="settings-input"
                  required
                />
              </div>
              {passwordMsg.text && (
                <p className={`settings-msg ${passwordMsg.type}`}>{passwordMsg.text}</p>
              )}
              <button type="submit" className="primary-btn settings-save-btn" disabled={isSavingPassword}>
                <Lock size={16} />
                {isSavingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
