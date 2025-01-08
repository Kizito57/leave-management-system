import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, FileText, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

export default function LeaveRequestForm({ selectedDates, onSuccessfulSubmit }) {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      start_date: selectedDates?.start || '',
      end_date: selectedDates?.end || '',
    }
  });

  // State management
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [isLoadingLeaveTypes, setIsLoadingLeaveTypes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Watching form values for dynamic calculations
  const startDate = watch('start_date');
  const endDate = watch('end_date');

  // Calculate leave duration
  const calculateLeaveDuration = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  // Fetch leave types
  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      setIsLoadingLeaveTypes(true);
      const response = await api.get('/api/leave-types');
      setLeaveTypes(response.data.leave_types);
    } catch (error) {
      toast.error('Failed to fetch leave types. Please refresh the page.');
    } finally {
      setIsLoadingLeaveTypes(false);
    }
  };

  // Handle form submission
  const handleLeaveRequest = async (data) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      const leaveRequestData = {
        leave_type_id: data.leave_type_id,
        start_date: data.start_date,
        end_date: data.end_date
      };

      const response = await api.post('/api/employee/apply-leave', leaveRequestData);

      toast.success(response.data.msg || 'Leave request submitted successfully');

      reset();

      if (onSuccessfulSubmit) {
        onSuccessfulSubmit(leaveRequestData);
      }
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data.msg || 'Failed to submit leave request';
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error('No response from server. Please check your internet connection.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
      <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b dark:border-gray-700 flex items-center space-x-3">
        <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Leave Request Form
        </h2>
      </div>

      <form onSubmit={handleSubmit(handleLeaveRequest)} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="date"
                {...register('start_date', { 
                  required: 'Start date is required',
                  validate: {
                    notInPast: (value) => {
                      const today = new Date().toISOString().split('T')[0];
                      return value >= today || 'Start date cannot be in the past';
                    }
                  }
                })}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              />
            </div>
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.start_date.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="date"
                {...register('end_date', { 
                  required: 'End date is required',
                  validate: {
                    afterStartDate: (value) => {
                      return !startDate || value >= startDate || 'End date must be after start date';
                    }
                  }
                })}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              />
            </div>
            {errors.end_date && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.end_date.message}
              </p>
            )}
          </div>
        </div>

        {startDate && endDate && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex items-center space-x-3">
            <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Total Leave Duration: {calculateLeaveDuration()} day(s)
            </span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Leave Type
          </label>
          {isLoadingLeaveTypes ? (
            <div className="mt-1 block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white opacity-50">
              Loading leave types...
            </div>
          ) : (
            <select
              {...register('leave_type_id', { required: 'Leave type is required' })}
              className="mt-1 block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
            >
              <option value="">Select leave type</option>
              {leaveTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          )}
          {errors.leave_type_id && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.leave_type_id.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLoadingLeaveTypes}
          className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200"
        >
          {isSubmitting ? (
            <>
              <Clock className="w-5 h-5 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Submit Leave Request
            </>
          )}
        </button>
      </form>
    </div>
  );
}