import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ThemeToggle from './components/ThemeToggle';
import { useAuth } from './context/AuthContext';
import AuthForms from './components/Auth/AuthForms';
import Dashboard from './components/Dashboard/Dashboard';
import ProjectList from './components/Dashboard/ProjectList';
import ProjectDetails from './components/Dashboard/ProjectDetails';
import CalendarView from './components/Dashboard/CalendarView';
import MyTasks from './components/Dashboard/MyTasks';
import Analytics from './components/Dashboard/Analytics';
import Settings from './components/Dashboard/Settings';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // Let AuthContext handle loading initially
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AuthLayout = () => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="app-container">
      <nav className="navbar glass-panel">
        <div className="nav-brand">
          <div className="brand-dot"></div>
          <h1>TaskFlow</h1>
        </div>
        <ThemeToggle />
      </nav>

      <main className="main-content">
        <div className="hero-section animate-fade-in">
          <div className="hero-text">
            <h2>Streamline Your <span>Workflow</span></h2>
            <p className="subtitle">
              The ultimate project management tool. Organize tasks, collaborate with your team, and deliver faster.
            </p>
          </div>
          
          <div className="auth-wrapper">
            <div className="auth-card glass-panel">
              <div className="auth-header">
                <h3>Get Started</h3>
                <p>Enter your credentials to continue.</p>
              </div>
              
              <AuthForms />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <>
    <Toaster position="top-right" toastOptions={{
      duration: 3000,
      style: { borderRadius: '10px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontSize: '0.9rem' },
      success: { iconTheme: { primary: 'var(--success-text)', secondary: '#fff' } },
      error: { iconTheme: { primary: 'var(--danger-text)', secondary: '#fff' } },
    }} />
    <Router>
      <Routes>
        <Route path="/login" element={<AuthLayout />} />
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <Routes>
                <Route element={<Dashboard />}>
                  <Route index element={<ProjectList />} />
                  <Route path="project/:id" element={<ProjectDetails />} />
                  <Route path="calendar" element={<CalendarView />} />
                  <Route path="my-tasks" element={<MyTasks />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Routes>
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
