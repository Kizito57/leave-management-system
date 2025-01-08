import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import LeaveTypeForm from '../components/admin/LeaveTypeForm';
import PendingApprovals from '../components/admin/PendingApprovals';
import LeaveRequestCard from '../components/dashboard/LeaveRequestCard';
import LeaveStatistics from '../components/dashboard/LeaveStatistics';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  // State management for dashboard data
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [showLeaveTypeForm, setShowLeaveTypeForm] = useState(false);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial dashboard data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Centralized data fetching method
  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Parallel data fetching for improved performance
      const [requestsResponse, statsResponse] = await Promise.all([
        api.get('/api/admin/leave-requests'),
        api.get('/api/admin/leave-stats')
      ]);

      setLeaveRequests(requestsResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      // Improved error handling with specific error message
      toast.error('Unable to retrieve dashboard information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Memoized leave request action handler to prevent unnecessary re-renders
  const handleLeaveAction = useMemo(() => async (requestId, action) => {
    try {
      await api.post('/api/admin/review-leave', {
        leave_request_id: requestId,
        action
      });
      
      // Enhanced success notification
      toast.success(`Leave request ${action.charAt(0).toUpperCase() + action.slice(1)}d successfully`);
      
      // Refresh data after successful action
      fetchData();
    } catch (error) {
      toast.error(`Failed to ${action} leave request. Please try again.`);
    }
  }, []);

  // Loading state component for better user experience
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl font-semibold text-gray-600 dark:text-gray-400 animate-pulse">
            Loading Dashboard...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Leave Statistics Overview */}
        <LeaveStatistics stats={stats} />

        {/* Pending Approvals Section */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pending Approvals
            </h2>
          </div>
          <PendingApprovals onUserAction={fetchData} />
        </section>

        {/* Leave Types Management */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Leave Types
            </h2>
            <button
              onClick={() => setShowLeaveTypeForm(!showLeaveTypeForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
            >
              {showLeaveTypeForm ? 'Cancel' : 'Add Leave Type'}
            </button>
          </div>
          
          {showLeaveTypeForm && (
            <LeaveTypeForm
              onSuccess={() => {
                setShowLeaveTypeForm(false);
                fetchData();
              }}
            />
          )}
        </section>

        {/* Leave Requests Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Leave Requests
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {leaveRequests.map((request) => (
              <LeaveRequestCard
                key={request.id}
                request={request}
                onApprove={() => handleLeaveAction(request.id, 'approve')}
                onReject={() => handleLeaveAction(request.id, 'reject')}
              />
            ))}
            
            {/* Empty state handling */}
            {leaveRequests.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 col-span-full">
                No pending leave requests
              </p>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}