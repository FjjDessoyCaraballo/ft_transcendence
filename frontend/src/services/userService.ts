import { apiRequest } from './Api';
import { User } from '../UI/UserManager'
import { GameType } from '../UI/Types';
import { Buffer } from 'node:buffer'

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
      throw error;
  }
};

export const updateAvatar = async (avatar_url: string): Promise<{AvatarUrl: string}> => {
  try {
    return await apiRequest('users/avatar', {
      method: 'POST',
      body: avatar_url
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Login user
 * 
 * @param userData User registration data
 * @returns Promise with user data
 */
export const loginUser = async (registerData: RegisterData): Promise<{ token: string, user: User }> => {
  try {
    const response = await apiRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify(registerData)
    });
    return response;
  } catch (error) {
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
  }
};

/**
 * Update user statistics after a game
 * 
 * @param winner Winner user data
 * @param loser Loser user data
 * @returns Promise with the updated user data
 */
export const updateUserStatsAPI = async (winner: User, loser: User, gameType: GameType): Promise<{ winner: User, loser: User }> => {
  try {

	let gameTypeString = '';
	if (gameType === GameType.BLOCK_BATTLE)
		gameTypeString = 'blockbattle';
	else if (gameType === GameType.PONG)
		gameTypeString = 'pong';

    return await apiRequest('/users/update-stats', {
      method: 'POST',
      body: JSON.stringify({ winner, loser, gameTypeString })
    });    
  } catch (error) {
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
  }
};
 
