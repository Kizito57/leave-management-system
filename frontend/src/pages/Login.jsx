import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Mail, 
  Lock, 
  EyeIcon, 
  EyeOffIcon, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const onSubmit = async (data) => {
    try {
      setLoginError(null);
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (error) {
      setLoginError(error.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 dark:from-gray-800 dark:to-gray-900 px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden">
        {/* Logo and Header Section */}
        <div className="px-8 pt-10 text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/src/logo.png" 
              alt="Company Logo" 
              className="h-24 w-24 rounded-full shadow-lg"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to manage your leave requests
          </p>
        </div>
        
        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-8 pt-6 pb-8">
          {/* Error Notification */}
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg flex items-center">
              <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
              <span className="text-red-700 dark:text-red-200 text-sm">
                {loginError}
              </span>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="you@example.com"
                />
                {!errors.email && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 pl-3">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 pl-3">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right mt-2">
            <Link 
              to="/forgot-password" 
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-2 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account? {' '}
              <Link 
                to="/register" 
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold"
              >
                Register Now
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}