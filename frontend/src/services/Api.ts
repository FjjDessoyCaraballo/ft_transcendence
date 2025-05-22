const API_URL = 'https://localhost:3443/api';
import { getToken } from './TokenService'

/**
 * Helper function for making API requests. Abstraction to help other API calls easier.
 * 
 * @param endpoint API endpoint path (starting with /)
 * @param options fetch options
 * @returns Promise with the API response
 * @throws Error with message from API or generic error
 */
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = await getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text(); 
    }

    if (!response.ok) {
      if (typeof data === 'object' && data !== null && 'error' in data)
        throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error. Please check your connection and try again.');
  }
};

/**
 * Check if the API is available
 * 
 * @returns Promise that resolves to true if API is available. False if it is not. Amazing, right?
 */
export const checkApiAvailability = async (): Promise<boolean> => {
  try {
    await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return (true);
  } catch (error) {
    console.error('API unavailable:', error);
    return (false);
  }
}

/**
 * Helper function to help fetch API URL. Not sure if this might be a vulnerability.
 * 
 * @returns URL of the API
 */
export const getApiUrl = (): string => {
  return API_URL;
}
