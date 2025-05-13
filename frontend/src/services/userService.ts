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

interface PasswordChange {
  oldPassword: string;
  newPassword: string;
}

/**
 * Register a new user with the API
 * 
 * @param userData User registration data
 * @returns Promise with the API response
 */
export const registerUser = async (registerData: RegisterData): Promise<RegisterResponse> => {
  try {    
    return await apiRequest('/users/register', {
      method: 'POST',
      body: JSON.stringify(registerData)
    });
  } catch (error) {
      throw new Error('Registration failed. Please try again later.');
  }
};

/**
 * Login user
 * 
 * @param userData User registration data
 * @returns Promise with user data
 */
export const loginUser = async (registerData: RegisterData): Promise<RegisterData> => {
  try {
    return await apiRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify(registerData)
    });
  } catch (error) {
      throw new Error('Failed to fetch user data.');
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
      throw new Error('Failed to update user statistics');
  }
};

/**
 * Delete a user account
 * 
 * @returns Promise with the deletion confirmation
 */
export const deleteUserAccount = async (): Promise<{ success: boolean, message: string }> => {
  try {
    return await apiRequest('/users/account', {
      method: 'DELETE'
    });    
  } catch (error) {
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
    return await apiRequest('/users/export-data');    
  } catch (error) {
      throw new Error('Failed to retrieve user data for download. Contact data protection officer.');
  }
};

/**
 * Simple password change request
 * 
 * @param passwordChange old and new password
 * @returns promise with the changed password
 */
export const changePassword = async (passwordChange: PasswordChange): Promise<PasswordChange> => {
  try {
    const formattedPayload = {
      currentPassword: passwordChange.oldPassword,
      newPassword: passwordChange.newPassword
    };

    return await apiRequest('/users/password', {
      method: 'PUT',
      body: JSON.stringify(formattedPayload)
    });
  } catch (error) {
      throw new Error('Password change failed. Please try again later.');
  }
};
