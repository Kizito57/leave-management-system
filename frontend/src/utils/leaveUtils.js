// Function to return a color class based on the leave status
export const getLeaveStatusColor = (status) => {
  // Defining an object that maps leave statuses to their corresponding color classes
  const statusColors = {
    Approved: 'text-green-500', // Approved status gets a green color
    Rejected: 'text-red-500',  // Rejected status gets a red color
    Pending: 'text-yellow-500' // Pending status gets a yellow color
  };
  
  // Return the corresponding color class for the given status. 
  // If the status is not found in the object, return a default gray color class
  return statusColors[status] || 'text-gray-500';
};

// Function to return a label for the leave type
export const getLeaveTypeLabel = (type) => {
  // Defining an object that maps leave type IDs to their corresponding labels
  const typeLabels = {
    1: 'Annual Leave',   // Type 1 corresponds to Annual Leave
    2: 'Sick Leave',      // Type 2 corresponds to Sick Leave
    3: 'Personal Leave'   // Type 3 corresponds to Personal Leave
  };
  
  // Return the corresponding label for the given leave type. 
  // If the type is not found in the object, return 'Other' as the default
  return typeLabels[type] || 'Other';
};
