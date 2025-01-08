// Importing necessary functions from 'date-fns' library
import { format, parseISO } from 'date-fns'; // 'format' is used to format a date, 'parseISO' is used to parse an ISO 8601 date string

// Function to format a date string into a readable format (e.g., "Jan 01, 2024")
export const formatDate = (dateString) => {
  try {
    // Checking if the input is a string, and if so, parsing it into a date object
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);

    // Using 'format' from 'date-fns' to format the date as "MMM dd, yyyy" (e.g., "Jan 01, 2024")
    return format(date, 'MMM dd, yyyy');
  } catch (error) {
    // If an error occurs during parsing or formatting, log the error to the console and return the original string
    console.error('Date formatting error:', error);
    return dateString;
  }
};

// Function to format a date range (e.g., "Jan 01, 2024 - Jan 10, 2024")
export const formatDateRange = (startDate, endDate) => {
  // Format both the start and end dates and return them as a string in the format "startDate - endDate"
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

// Function to calculate the number of days between two dates
export const calculateDuration = (startDate, endDate) => {
  // Convert both the start and end dates to JavaScript Date objects
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculate the absolute difference in time (in milliseconds) between the start and end dates
  const diffTime = Math.abs(end - start);

  // Convert the time difference from milliseconds to days and add 1 to include both start and end dates
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};
