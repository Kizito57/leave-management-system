// Importing necessary React hooks
import { createContext, useContext, useState, useEffect } from 'react';

// Creating the ThemeContext to share the theme state across components
const ThemeContext = createContext();

// The ThemeProvider component provides the theme state and toggle function to the children components
export function ThemeProvider({ children }) {
  // useState hook to manage the dark mode state, initially checking localStorage or system preference
  const [isDark, setIsDark] = useState(() => {
    // Retrieve the saved theme from localStorage (if any)
    const savedTheme = localStorage.getItem('theme');
    // Set the theme to dark if the saved theme is 'dark', or if there's no saved theme and the system prefers dark mode
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // useEffect hook to apply the theme and save the selection to localStorage
  useEffect(() => {
    // Toggle the 'dark' class on the document element based on the isDark state
    document.documentElement.classList.toggle('dark', isDark);
    // Save the theme selection to localStorage so it persists across sessions
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]); // Runs every time the isDark state changes

  // toggleTheme function to switch between dark and light themes
  const toggleTheme = () => setIsDark(!isDark);

  // Providing the theme state (isDark) and the toggleTheme function to children components
  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children} {/* Render the child components inside the ThemeProvider */}
    </ThemeContext.Provider>
  );
}

// Custom hook to access theme context data in other components
export const useTheme = () => {
  // Retrieve the current context value (isDark and toggleTheme)
  const context = useContext(ThemeContext);
  // If context is undefined, it means useTheme is used outside of the ThemeProvider
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context; // Return the context value
};
