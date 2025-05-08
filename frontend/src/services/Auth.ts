import { apiRequest } from './Api';
import { User } from "../UI/UserManager"

// Login and get token
export const login = async (email: string, password: string) => {
  const data = await apiRequest('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  // Store token and user data
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  return data;
};

// Get current user from local storage
export const getCurrentUser = (): User | null => {
  const userString = localStorage.getItem('user');
  return userString ? JSON.parse(userString) : null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};

// Logout - clear local storage
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};