import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import LeaveCalendar from '../components/calendar/LeaveCalendar';
import LeaveRequestForm from '../components/employee/LeaveRequestForm';
import LeaveHistory from '../components/employee/LeaveHistory';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export default function EmployeeDashboard() {
  // State management with more descriptive initial states
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedDates, setSelectedDates] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Consolidated data fetching effect
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setIsLoading(true);
        // Parallel data fetching for improved performance
        const [historyResponse, typesResponse] = await Promise.all([
          api.get('/api/employee/leave-history'),
          api.get('/api/leave-types')
        ]);

        setLeaveRequests(historyResponse.data.leave_history || []);
        setLeaveTypes(typesResponse.data || []);
      } catch (error) {
        toast.error('Failed to load dashboard data. Please refresh or contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  // Memoized leave request submission handler
  const handleLeaveRequest = useMemo(() => async (data) => {
    try {
      await api.post('/api/employee/apply-leave', data);
      
      // Comprehensive success handling
      toast.success('Leave request submitted successfully', {
        duration: 4000,
        position: 'top-right'
      });

      // Reset form and refresh data
      setSelectedDates(null);
      setShowRequestForm(false);

      // Refetch leave history to update immediately
      const response = await api.get('/api/employee/leave-history');
      setLeaveRequests(response.data.leave_history || []);
    } catch (error) {
      // Detailed error handling
      const errorMessage = error.response?.data?.message 
        || 'Failed to submit leave request. Please check your details and try again.';
      
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-right'
      });
    }
  }, []);

  // Memoized calendar events for performance
  const calendarEvents = useMemo(() => 
    leaveRequests.map(request => ({
      title: request.leave_type,
      start: request.start_date,
      end: request.end_date,
      color: request.status === 'Approved' 
        ? '#10B981'   // Green for approved
        : request.status === 'Pending'
          ? '#F59E0B' // Amber for pending
          : '#EF4444' // Red for rejected
    })), 
    [leaveRequests]
  );

  // Loading state component
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl font-semibold text-gray-600 dark:text-gray-400 animate-pulse">
            Loading Employee Dashboard...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Leave Request Section */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Apply for Leave
            </h2>
            <button
              onClick={() => setShowRequestForm(!showRequestForm)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              {showRequestForm ? 'Cancel' : 'New Request'}
            </button>
          </div>

          {showRequestForm ? (
            <LeaveRequestForm
              selectedDates={selectedDates}
              onSubmit={handleLeaveRequest}
              leaveTypes={leaveTypes}
            />
          ) : (
            <LeaveCalendar
              onDateSelect={(dates) => {
                setSelectedDates(dates);
                setShowRequestForm(true);
              }}
              events={calendarEvents}
            />
          )}
        </section>

        {/* Leave History Section */}
        <LeaveHistory 
          leaveRequests={leaveRequests} 
          emptyStateMessage="No leave requests found. Start by applying for a leave!" 
        />
      </div>
    </Layout>
  );
}