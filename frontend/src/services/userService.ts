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
export const registerUser = async (registerData: RegisterData): Promise<RegisterResponse> => {
  try {
    // For local development when backend is not available yet
    // Check if we're in development mode without backend connectivity
    // const newUser = {
    //   username: registerData.username,
    //   password: registerData.password,
    //   wins: 0,
    //   losses: 0,
    //   rankingPoint: 1000,
    // };
    
    // localStorage.setItem(registerData.username, JSON.stringify(newUser));
    
    // const userArrKey = 'registeredUsers';
    // const userArrData = localStorage.getItem(userArrKey);
    
    // if (!userArrData) {
    //   let userArr: string[] = [registerData.username];
    //   localStorage.setItem(userArrKey, JSON.stringify(userArr));
    // } else {
    //   let userArr: string[] = JSON.parse(userArrData);
    //   userArr.push(registerData.username);
    //   localStorage.setItem(userArrKey, JSON.stringify(userArr));
    // }
    
    // // Mock response for development
    // return {
    //   user: newUser as User,
    //   token: "mock-token-for-dev",
    //   message: "Registration successful"
    // };
    
    // Real API implementation (uncomment when backend is ready)
    return await apiRequest('/users/register', {
      method: 'POST',
      body: JSON.stringify(registerData)
    });
  } catch (error) {
    if (error instanceof Error)
      throw error;
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
    // Development fallback
    const userData = localStorage.getItem(username);
    if (userData) {
      return JSON.parse(userData);
    }
    
    // When backend is ready:
    // return await apiRequest(`/users/${username}`);
    
    throw new Error('User not found');
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
    // Development fallback
    const userArrKey = 'registeredUsers';
    const userArrData = localStorage.getItem(userArrKey);
    
    if (userArrData) {
      const usernames: string[] = JSON.parse(userArrData);
      const users: User[] = [];
      
      for (const username of usernames) {
        const userData = localStorage.getItem(username);
        if (userData) {
          users.push(JSON.parse(userData));
        }
      }
      
      return users;
    }
    
    // When backend is ready:
    // return await apiRequest('/users');
    
    return [];
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
    // Development fallback
    localStorage.setItem(winner.username, JSON.stringify(winner));
    localStorage.setItem(loser.username, JSON.stringify(loser));
    
    // When backend is ready:
    // return await apiRequest('/users/update-stats', {
    //   method: 'POST',
    //   body: JSON.stringify({ winner, loser })
    // });
    
    return { winner, loser };
  } catch (error) {
    if (error instanceof Error)
      throw error;
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
    // Development fallback
    const username = localStorage.getItem('username');
    if (username) {
      localStorage.removeItem(username);
      
      // Also remove from the registered users array
      const userArrKey = 'registeredUsers';
      const userArrData = localStorage.getItem(userArrKey);
      
      if (userArrData) {
        let userArr: string[] = JSON.parse(userArrData);
        userArr = userArr.filter(u => u !== username);
        localStorage.setItem(userArrKey, JSON.stringify(userArr));
      }
    }
    
    // When backend is ready:
    // return await apiRequest('users/delete', {
    //   method: 'DELETE'
    // });
    
    return { success: true, message: 'Account deleted successfully' };
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
    // Development fallback
    const username = localStorage.getItem('username');
    if (username) {
      const userData = localStorage.getItem(username);
      if (userData) {
        return JSON.parse(userData);
      }
    }
    
    // When backend is ready:
    // return await apiRequest('/users/data-download');
    
    throw new Error('No user data found');
  } catch (error) {
    if (error instanceof Error)
      throw error;
    throw new Error('Failed to retrieve user data for download. Contact data protection officer.');
  }
};