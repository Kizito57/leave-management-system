// Importing axios, a popular HTTP client for making API requests
import axios from 'axios';

// Create an axios instance with a predefined configuration
const api = axios.create({
  // Setting the base URL for all HTTP requests
  baseURL: 'http://localhost:5000',
});

// Adding a request interceptor to include the authentication token in the request headers
api.interceptors.request.use((config) => {
  // Retrieving the token from localStorage (if available)
  const token = localStorage.getItem('token');
  
  // If a token exists, add it to the Authorization header in the request configuration
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Returning the modified config object so that the request can proceed
  return config;
});

// Exporting the axios instance so that it can be used throughout the app
export default api;
