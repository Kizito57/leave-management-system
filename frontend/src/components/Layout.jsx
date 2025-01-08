import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
  const { logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Top Navigation Bar */}
      <header className="bg-gradient-to-r from-primary-500 to-primary-700 dark:from-gray-800 dark:to-gray-900 shadow-lg">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          {/* Logo and Title Section */}
          <div className="flex items-center space-x-4">
            <img
              src="/src/logo.png"
              alt="Logo"
              className="h-11 w-11 rounded-xl shadow-md transform transition-transform hover:scale-105 object-cover"
            />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Leave Management
            </h1>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-6">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 dark:bg-gray-700/50 dark:hover:bg-gray-700/70 transition-all duration-300 shadow-md group"
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="text-yellow-300 group-hover:rotate-6 transition-transform" size={24} />
              ) : (
                <Moon className="text-gray-100 group-hover:-rotate-6 transition-transform" size={24} />
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-white hover:text-gray-200 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-all duration-300 group"
            >
              <LogOut size={22} className="group-hover:translate-x-0.5 transition-transform" />
              <span className="text-lg font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6 mt-4">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300">
          {children}
        </div>
      </main>
    </div>
  );
}