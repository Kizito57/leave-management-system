// Importing necessary React hooks and libraries
import { createContext, useContext, useState, useEffect } from 'react'; // React hooks
import axios from '../lib/axios'; // Axios instance for making HTTP requests
import toast from 'react-hot-toast'; // Library for showing toast notifications

// Creating the AuthContext to share authentication state across components
const AuthContext = createContext();

// The AuthProvider component provides authentication context to the children components
export function AuthProvider({ children }) {
  // State to store user information and loading state
  const [user, setUser] = useState(null); // Initially, user is null (not logged in)
  const [isLoading, setIsLoading] = useState(true); // Initially loading is true until authentication is determined

  // Effect hook to check if the user is already logged in (by checking localStorage)
  useEffect(() => {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    if (token) { // If token exists in localStorage, it means the user is logged in
      const userData = JSON.parse(localStorage.getItem('user') || 'null'); // Retrieve user data from localStorage
      setUser(userData); // Set the user state to the data found in localStorage
    }
    setIsLoading(false); // Set loading to false after the check
  }, []); // Empty dependency array means this effect runs only once when the component mounts

  // Login function to authenticate the user with email and password
  const login = async (email, password) => {
    try {
      const response = await axios.post('/login', { email, password }); // Make a POST request to the login endpoint
      // Save the token and user data in localStorage
      localStorage.setItem('token', response.data.access_token); // Store JWT token
      localStorage.setItem('user', JSON.stringify({
        email,
        role: response.data.role
      })); // Store user data (email and role)
      setUser({ email, role: response.data.role }); // Set user state with email and role
      return response.data; // Return the response data
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Login failed'); // Show error toast if login fails
      throw error; // Re-throw the error for further handling if needed
    }
  };

  // Register function to create a new user account
  const register = async (data) => {
    try {
      const response = await axios.post('/api/register', data); // Make a POST request to the registration endpoint
      toast.success('Registration successful! Please wait for admin approval.'); // Show success toast
      return response.data; // Return response data
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Registration failed'); // Show error toast if registration fails
      throw error; // Re-throw the error for further handling
    }
  };

  // Logout function to log the user out
  const logout = async () => {
    try {
      await axios.post('/api/logout'); // Make a POST request to the logout endpoint
    } catch (error) {
      console.error('Logout error:', error); // Log any errors that occur during logout
    } finally {
      // Remove token and user data from localStorage, then set user state to null
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null); // Set user state to null (logged out)
    }
  };

  // The AuthContext.Provider provides authentication data and functions to children components
  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children} {/* Render children components inside the AuthProvider */}
    </AuthContext.Provider>
  );
}

// Custom hook to access authentication context data in other components
export const useAuth = () => {
  const context = useContext(AuthContext); // Retrieve the context value
  if (context === undefined) { // If context is undefined, it means useAuth is used outside the provider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context; // Return the context value (user, login, logout, register, isLoading)
};
