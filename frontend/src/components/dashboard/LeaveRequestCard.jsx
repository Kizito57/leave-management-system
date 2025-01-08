import { Calendar, Clock, CheckCircle, XCircle, Mail, Info } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export default function LeaveRequestCard({ request, onApprove, onReject }) {
  // Determine status color and icon
  const getStatusStyles = (status) => {
    switch (status) {
      case 'Approved': 
        return {
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: CheckCircle,
          textColor: 'text-green-800'
        };
      case 'Rejected': 
        return {
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: XCircle,
          textColor: 'text-red-800'
        };
      default: 
        return {
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          icon: Info,
          textColor: 'text-yellow-800'
        };
    }
  };

  // Calculate leave duration
  const leaveDuration = differenceInDays(
    new Date(request.end_date), 
    new Date(request.start_date)
  ) + 1;

  const statusStyles = getStatusStyles(request.status);
  const StatusIcon = statusStyles.icon;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="p-6 space-y-4">
        {/* Header with Status */}
        <div className="flex justify-between items-center">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${statusStyles.color}`}>
            <StatusIcon className="w-4 h-4" />
            <span className={`text-sm font-medium ${statusStyles.textColor}`}>
              {request.status}
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {format(new Date(request.created_at), 'MMM dd, yyyy')}
          </div>
        </div>

        {/* Request Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date Range */}
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {format(new Date(request.start_date), 'MMM dd, yyyy')} - 
                {format(new Date(request.end_date), 'MMM dd, yyyy')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {leaveDuration} day{leaveDuration !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Leave Type */}
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Leave Type: {request.leave_type}
              </p>
            </div>
          </div>

          {/* User Email */}
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <div>
              <a 
                href={`mailto:${request.user_email}`} 
                className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {request.user_email}
              </a>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Request from {request.user_name || 'Employee'}
              </p>
            </div>
          </div>
        </div>

        {/* Approval Actions for Pending Requests */}
        {request.status === 'Pending' && onApprove && onReject && (
          <div className="mt-4 flex space-x-3">
            <button
              onClick={() => onApprove(request.id)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Approve</span>
            </button>
            
            <button
              onClick={() => onReject(request.id)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <XCircle className="w-5 h-5" />
              <span>Reject</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
