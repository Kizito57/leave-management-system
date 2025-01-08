// Import Navigate component from react-router-dom for navigation
import { Navigate } from 'react-router-dom';

// Import the custom authentication context hook to get the current user and loading state
import { useAuth } from '../contexts/AuthContext';

// The ProtectedRoute component is responsible for guarding routes that require authentication
export default function ProtectedRoute({ children }) {
  // Use the useAuth hook to get the current user and the loading state
  const { user, isLoading } = useAuth();

  // If the authentication state is still loading, show a loading message
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If there is no user (i.e., the user is not authenticated), redirect to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the user is authenticated, render the children components passed to ProtectedRoute
  return children(user);
}
