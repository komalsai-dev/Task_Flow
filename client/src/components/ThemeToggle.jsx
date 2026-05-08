import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className={`theme-toggle ${theme}`} 
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <div className="toggle-track">
        <div className="toggle-thumb">
          {theme === 'light' ? (
            <Sun className="icon sun-icon" size={14} strokeWidth={2.5} />
          ) : (
            <Moon className="icon moon-icon" size={14} strokeWidth={2.5} />
          )}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
