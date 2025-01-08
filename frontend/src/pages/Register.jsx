import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Mail, 
  Lock, 
  UserCircle, 
  CheckCircle2, 
  EyeIcon, 
  EyeOffIcon, 
  AlertCircle 
} from 'lucide-react';

export default function Register() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setRegistrationError(null);
      await registerUser(data);
      navigate('/login', { 
        state: { 
          message: 'Account created successfully. Please log in.' 
        } 
      });
    } catch (error) {
      setRegistrationError(error.message || 'Registration failed. Please try again.');
    }
  };

  // Password strength validation
  const passwordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const getPasswordStrengthColor = (strength) => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];
    return colors[strength] || 'bg-red-500';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 dark:from-gray-800 dark:to-gray-900 px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden">
        {/* Header Section */}
        <div className="px-8 pt-10 text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/src/logo.png" 
              alt="Company Logo" 
              className="h-24 w-24 rounded-full shadow-lg"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Join our comprehensive leave management system
          </p>
        </div>
        
        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-8 pt-6 pb-8">
          {/* Error Notification */}
          {registrationError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg flex items-center">
              <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
              <span className="text-red-700 dark:text-red-200 text-sm">
                {registrationError}
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
                    required: 'Corporate email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid corporate email address'
                    }
                  })}
                  type="email"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="corporate@company.com"
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
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    },
                    validate: (value) => {
                      const strength = passwordStrength(value);
                      return strength >= 3 || 'Password is too weak';
                    }
                  })}
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Strong password required"
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
              {/* Password Strength Indicator */}
              <div className="mt-1 flex space-x-1">
                {[0, 1, 2, 3, 4].map((index) => (
                  <div 
                    key={index} 
                    className={`h-1 w-full rounded-full ${
                      passwordStrength(password) > index 
                        ? getPasswordStrengthColor(passwordStrength(password))
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 pl-3">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircle className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <select
                  {...register('role', { 
                    required: 'Please select a role',
                    validate: (value) => 
                      ['Employee', 'Admin'].includes(value) || 'Invalid role selected'
                  })}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
                >
                  <option value="">Select your role</option>
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600 pl-3">
                  {errors.role.message}
                </p>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="mt-4 flex items-center">
            <input
              {...register('terms', {
                required: 'You must accept the terms and conditions'
              })}
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              I agree to the{' '}
              <Link 
                to="/terms" 
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                Terms and Conditions
              </Link>
            </label>
          </div>
          {errors.terms && (
            <p className="mt-1 text-sm text-red-600 pl-3">
              {errors.terms.message}
            </p>
          )}

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-2 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account? {' '}
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold"
              >
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}