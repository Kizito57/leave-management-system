import { useState } from 'react';
import { Calendar, Clock, Filter } from 'lucide-react'; // Icons for the calendar, clock, and filter
import { formatDate } from '../../utils/dateUtils'; // Utility function to format dates

// Functional component to display leave history with optional filtering
export default function LeaveHistory({ leaveRequests }) {
  // State to manage the selected filter value ('all', 'pending', 'approved', 'rejected')
  const [filter, setFilter] = useState('all');

  // Filtering the leave requests based on the selected filter
  const filteredHistory = leaveRequests.filter(request => {
    // If 'all' is selected, show all requests
    if (filter === 'all') return true;
    // Otherwise, filter based on the status of the request
    return request.status.toLowerCase() === filter.toLowerCase();
  });

  // Function to determine the status color of the leave request (for UI styling)
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'; // Green for approved
      case 'rejected':
        return 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'; // Red for rejected
      default:
        return 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'; // Yellow for others (e.g., pending)
    }
  };

  // Function to calculate remaining leave days
  const getRemainingDays = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const differenceInTime = end - today; // Difference in milliseconds
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24)); // Convert milliseconds to days
    return differenceInDays > 0 ? differenceInDays : 0; // If the leave end date is in the past, return 0
  };

  return (
    <div className="space-y-6">
      {/* Section for the header and filter control */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Leave History
        </h2>
        {/* Filter dropdown to select the type of leave requests to display */}
        <div className="relative">
          <select
            value={filter} // The selected filter value
            onChange={(e) => setFilter(e.target.value)} // Update the filter state when selection changes
            className="appearance-none w-40 pl-3 pr-8 py-2 text-sm border-0 bg-primary-50 dark:bg-gray-800 text-primary-800 dark:text-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all"
          >
            {/* Option values for the filter */}
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          {/* Filter icon placed inside the dropdown */}
          <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-600 dark:text-primary-400 pointer-events-none" />
        </div>
      </div>

      {/* Section to display the leave request cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Mapping over the filtered leave requests */}
        {filteredHistory.map((request) => (
          <div
            key={request.id} // Unique key for each leave request
            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="space-y-4">
              {/* Status and leave type */}
              <div className="flex justify-between items-center">
                {/* Status badge with dynamic background color based on the leave status */}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
                {/* Displaying the leave type */}
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {request.leave_type}
                </span>
              </div>

              {/* Divider for the date section */}
              <div className="border-b dark:border-gray-700 pb-4">
                {/* Displaying the leave dates */}
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4 text-primary-500 dark:text-primary-400" />
                  <span>{formatDate(request.start_date)} - {formatDate(request.end_date)}</span> {/* Formatted date */}
                </div>

                {/* Displaying the date when the request was submitted */}
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4 text-primary-500 dark:text-primary-400" />
                  <span>Submitted on {formatDate(request.created_at)}</span> {/* Formatted submission date */}
                </div>

                {/* Displaying remaining leave days */}
                {request.status.toLowerCase() === 'approved' && (
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>Remaining Days: {getRemainingDays(request.end_date)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* If no filtered history is found, show a message */}
        {filteredHistory.length === 0 && (
          <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
            No leave requests found
          </p>
        )}
      </div>
    </div>
  );
}
