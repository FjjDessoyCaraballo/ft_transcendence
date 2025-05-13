import { apiRequest } from './Api';
import { User } from "../UI/UserManager"
import { clearToken } from './TokenService';

interface LoginData {
  username: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
  message?: string;
}

/**
 * This helper function performs the login and gets a JWT token.
 * 
 * @param username self-explanatory right?
 * @param password again, still self-explanatony
 * @returns Promise with login response
 */
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const data = await apiRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('logged-in', 'true');
    localStorage.setItem('LoggedIn', JSON.stringify(username));

    window.dispatchEvent(new Event('loginStatusChanged'));

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Login failed. Please try again.');
  } finally {
    await clearToken();

    // Take this out later
    localStorage.removeItem('user');
    localStorage.setItem('logged-in', 'false');
    localStorage.removeItem('LoggedIn');
    
    window.dispatchEvent(new Event('loginStatusChanged'));
  }
};

/**
 * Getter for current user that is stored in the local storage.
 * 
 * @returns User object or null if not logged in
 */
export const getCurrentUser = (): User | null => {
  const userString = localStorage.getItem('user');
  return userString ? JSON.parse(userString) : null;
}

/**
 * Check if user is authenticated
 * 
 * @returns Boolean indicating if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null && localStorage.getItem('logged-in') === 'true';
}

/**
 * Logout - clear local storage and API logout
 * 
 * @returns Promise that resolves when logout is complete
 */
export const logout = async (): Promise<void> => {
  try {
    await apiRequest('/users/logout', {
      method: 'POST'
    });
  } catch (error) {
    console.error('Error during logout API call:', error);
    // even if this fails, we logout locally from localStorage
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.setItem('logged-in', 'false');
    localStorage.removeItem('LoggedIn');
    
    window.dispatchEvent(new Event('loginStatusChanged'));
  }
};

/**
 * Verify if token is still valid
 * 
 * @returns Promise that resolves to boolean indicating if token is valid
 */
export const verifyToken = async (): Promise<boolean> => {
  try {
    if (!isAuthenticated()) {
      return (false);
    }

    await apiRequest ('/users/verify-token');
    return (true);
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.setItem('logged-in', 'false');
    localStorage.removeItem('LoggedIn');

    window.dispatchEvent(new Event('loginStatusChanged'));

    return (false);
  }
};
