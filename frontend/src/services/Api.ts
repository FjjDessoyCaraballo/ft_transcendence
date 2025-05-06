const API_URL = 'http://localhost:3000/api';

// Helper function for making API requests
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // Get token from localStorage if available
  const token = localStorage.getItem('token');
  
  // Set default headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  
  // Add authorization header if token exists
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    // Make the fetch request
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    // Parse the JSON response
    const data = await response.json();
    
    // Check if request was successful
    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};