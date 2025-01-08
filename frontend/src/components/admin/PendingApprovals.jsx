// Importing necessary hooks, components, icons, and the axios instance (api)
import { useState, useEffect } from 'react';
import { UserCheck, UserX, Clock } from 'lucide-react'; // Icons from lucide-react
import api from '../../lib/axios'; // Axios instance for API calls
import toast from 'react-hot-toast'; // Toast notifications for feedback

// The main component to handle the pending user approvals
export default function PendingApprovals() {
  // State to hold the list of pending users
  const [pendingUsers, setPendingUsers] = useState([]);
  // State to track loading status (when fetching data)
  const [isLoading, setIsLoading] = useState(true);

  // useEffect hook to fetch pending users when the component mounts
  useEffect(() => {
    fetchPendingUsers(); // Fetch the pending users
  }, []); // Empty dependency array means it only runs once, after the initial render

  // Function to fetch the list of pending users from the API
  const fetchPendingUsers = async () => {
    try {
      // Making an API call to fetch the pending users
      const response = await api.get('/api/admin/pending-users');
      // Setting the pending users in the state
      setPendingUsers(response.data.pending_users);
    } catch (error) {
      // Displaying an error toast if the request fails
      toast.error('Failed to fetch pending users');
    } finally {
      // Updating the loading state to false once data is fetched or error is handled
      setIsLoading(false);
    }
  };

  // Function to handle approval or rejection of a user based on action ('approve' or 'reject')
  const handleApproval = async (userId, action) => {
    try {
      // Making an API call to approve or reject the user
      await api.post('/api/admin/approve-user', {
        user_id: userId,
        action
      });
      // Displaying a success toast with the appropriate action message
      toast.success(`User ${action}d successfully`);
      // Refetch the list of pending users after approval/rejection
      fetchPendingUsers();
    } catch (error) {
      // Displaying an error toast if the request fails
      toast.error(`Failed to ${action} user`);
    }
  };

  // If data is still loading, show a loading spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin">
          <Clock className="w-8 h-8 text-gray-500 dark:text-gray-400" />
        </div>
        <span className="ml-2 text-gray-500 dark:text-gray-400">Loading pending approvals...</span>
      </div>
    );
  }

  // Render the component when data is loaded
  return (
    <div className="bg-white dark:bg-gray-900 shadow-xl rounded-xl overflow-hidden">
      {/* Header section */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Pending User Approvals
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Review and manage user access requests
        </p>
      </div>

      {/* Conditional rendering based on whether there are pending users */}
      {pendingUsers.length === 0 ? (
        // If there are no pending users, show a message
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <UserCheck className="w-12 h-12 text-green-500 dark:text-green-400 mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-300">
            No pending approvals at the moment
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            All user requests have been processed
          </p>
        </div>
      ) : (
        // If there are pending users, map over them and display each user's info
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {pendingUsers.map((user) => (
            <li 
              key={user.id} 
              className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center justify-between">
                {/* User information section */}
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        {user.email.charAt(0).toUpperCase()} {/* Display the first letter of the email */}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.email}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Requested Role: {user.role}
                    </p>
                  </div>
                </div>
                {/* Action buttons to approve or reject the user */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApproval(user.id, 'approve')}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:text-green-300 dark:bg-green-900 dark:hover:bg-green-800"
                  >
                    <UserCheck className="mr-1.5 h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproval(user.id, 'reject')}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:text-red-300 dark:bg-red-900 dark:hover:bg-red-800"
                  >
                    <UserX className="mr-1.5 h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
