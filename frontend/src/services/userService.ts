import { apiRequest } from './Api';
import { User } from '../UI/UserManager'

interface RegisterData {
  username: string;
  password: string;
}

interface RegisterResponse {
  user: User;
  token: string;
  message: string;
}

/**
 * Register a new user with the API
 * 
 * @param userData User registration data
 * @returns Promise with the API response
 */
export const registerUser = async (userData: RegisterData) => {
  try {
    return await apiRequest('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  } catch (error) {
    if (error instanceof Error)
      throw Error;
    throw new Error('Registration failed. Please try again later.');
  }
};

/**
 * Get user data from the API
 * 
 * @param username Username to fetch
 * @returns Promise with user data
 */
export const getUserData = async (username: string): Promise<User> => {
  try {
    return await apiRequest(`/users/${username}`);
  } catch (error) {
    if (error instanceof Error) 
      throw error;
    throw new Error('Failed to fetch user data.');
  }
};

/**
 * Get all registered users in an array.
 * 
 * @returns Promise with an array of all users
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    return await apiRequest('/users');
  } catch (error) {
    if (error instanceof Error)
      throw error;
    throw new Error('Failed to fetch user list.');
  }
};

/**
 * Update user statistics after a game
 * 
 * @param winner Winner user data
 * @param loser Loser user data
 * @returns Promise with the updated user data
 */
export const updateUserStats = async (winner: User, loser: User): Promise<{ winner: User, loser: User }> => {
  try {
    return await apiRequest('/users/update-stats', {
      method: 'POST',
      body: JSON.stringify({ winner, loser })
    });
  } catch (error) {
    if (error instanceof Error)
      throw error;
    throw new Error('Fauiled to updated user statistics');
  }
};

/**
 * Delete a user account
 * 
 * @returns Promise with the deletion confirmation
 */
export const deleteUserAccount = async (): Promise<{ success: boolean, message: string }> => {
  try {
    return await apiRequest('users/delete', {
      method: 'DELETE'
    });
  } catch (error) {
    if (error instanceof Error)
      throw error;
    throw new Error('Failed to delete user account. Contact data protection officer.');
  }
};

/**
 *  Get user data for download (GDPR compliance);
 * 
 * @returns Promise with the whole data collected from user
 */
export const getUserDataForDownload = async (): Promise<any> => {
  try {
    return await apiRequest('/users/data-download');
  } catch (error) {
    if (error instanceof Error)
      throw error;
    throw new Error('Failed to retrieve user data for download. Contact data protection officer.');
  }
};