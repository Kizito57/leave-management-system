import React from 'react';
import { 
  PieChart, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';

// Reusable Statistic Card Component
const StatisticCard = ({ 
  icon: Icon, 
  label, 
  value, 
  bgColor, 
  textColor, 
  darkBgColor 
}) => (
  <div className={`
    bg-white dark:bg-gray-800 
    p-4 rounded-lg shadow-md 
    hover:shadow-lg transition-all duration-300 
    transform hover:-translate-y-1
  `}>
    <div className="flex items-center space-x-4">
      <div className={`
        p-3 rounded-lg 
        ${bgColor} ${darkBgColor}
      `}>
        <Icon className={`w-6 h-6 ${textColor} dark:${textColor}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  </div>
);

export default function LeaveStatistics({ stats }) {
  // Prepare statistics with default values and percentages
  const totalRequests = stats?.total_requests || 0;
  const approvedRequests = stats?.approved_requests || 0;
  const pendingRequests = stats?.pending_requests || 0;
  const rejectedRequests = stats?.rejected_requests || 0;

  const calculatePercentage = (part, whole) => 
    whole > 0 ? Math.round((part / whole) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total Requests */}
      <StatisticCard
        icon={Calendar}
        label="Total Requests"
        value={totalRequests}
        bgColor="bg-blue-50"
        textColor="text-blue-600"
        darkBgColor="dark:bg-blue-900"
      />

      {/* Approved Requests */}
      <StatisticCard
        icon={CheckCircle}
        label="Approved"
        value={`${approvedRequests} (${calculatePercentage(approvedRequests, totalRequests)}%)`}
        bgColor="bg-green-50"
        textColor="text-green-600"
        darkBgColor="dark:bg-green-900"
      />

      {/* Pending Requests */}
      <StatisticCard
        icon={Clock}
        label="Pending"
        value={`${pendingRequests} (${calculatePercentage(pendingRequests, totalRequests)}%)`}
        bgColor="bg-yellow-50"
        textColor="text-yellow-600"
        darkBgColor="dark:bg-yellow-900"
      />

      {/* Rejected Requests */}
      <StatisticCard
        icon={XCircle}
        label="Rejected"
        value={`${rejectedRequests} (${calculatePercentage(rejectedRequests, totalRequests)}%)`}
        bgColor="bg-red-50"
        textColor="text-red-600"
        darkBgColor="dark:bg-red-900"
      />
    </div>
  );
}