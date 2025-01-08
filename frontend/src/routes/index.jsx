// Import necessary components from react-router-dom for routing and navigation
import { Routes, Route, Navigate } from 'react-router-dom';

// Import the page components for login, registration, dashboards, and ProtectedRoute
import Login from '../pages/Login';
import Register from '../pages/Register';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Route for the Login page */}
      <Route path="/login" element={<Login />} />

      {/* Route for the Register page */}
      <Route path="/register" element={<Register />} />

      {/* Protected route for the Dashboard page */}
      <Route
        path="/dashboard"
        element={
          // The ProtectedRoute component ensures that the user is authenticated
          <ProtectedRoute>
            {/* The ProtectedRoute passes the user object, and based on the user's role, either the Admin or Employee dashboard is rendered */}
            {(user) => 
              // Check if the user is an Admin or Employee
              user?.role === 'Admin' ? <AdminDashboard /> : <EmployeeDashboard />
            }
          </ProtectedRoute>
        }
      />

      {/* Default route that redirects to the /dashboard route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
