import { apiRequest } from './Api';
import { MatchData, User } from '../UI/UserManager'
import { GameType } from '../UI/Types';
import { Buffer } from 'node:buffer'
import { bbMatchData } from '../game/BlockBattle';
import { pongMatchData } from '../game/pong/Pong';
import { TournamentPlayer } from '../game/Tournament';
import { Weapon } from '../game/Weapons';
import { match } from 'node:assert';

interface RegisterData {
  username: string;
  password: string;
}

interface AvatarData {
  data: string;
  size: number;
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

interface LanguageResponse {
  language: string;
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

export const updateAvatar = async (avatar: AvatarData): Promise<{AvatarUrl: string}> => {
  try {
    return await apiRequest('/users/avatar', {
      method: 'POST',
      body: JSON.stringify({avatar})
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
 * Verify opponent
 * 
 * @param userData User registration data
 * @returns Promise with user data
 */
export const verifyOpponent = async (registerData: RegisterData): Promise<{ status: string }> => {
  try {
    const response = await apiRequest('/users/verify-opponent', {
      method: 'POST',
      body: JSON.stringify(registerData)
    });
    return response;
  } catch (error) {
      throw error;
  }
};

/**
 * Verify tournament player
 * 
 * @param registerData User registration data
 * @returns Promise with already registered tournament player array
 */
export const verifyTournamentPlayer = async (registerData: RegisterData): Promise<TournamentPlayer[]> => {
  try {
    return await apiRequest('/users/verify-tournament-player', {
      method: 'POST',
      body: JSON.stringify(registerData)
    });
  } catch (error) {
      throw error;
  }
};

/**
 * Remove tournament player
 * 
 * @param playerId Id of the player that should be removed from the tournament
 * @returns Promise with already registered tournament player array
 */
export const removeTournamentPlayer = async (playerId: number): Promise<TournamentPlayer[]> => {
  try {
    return await apiRequest('/users/remove-tournament-player', {
      method: 'POST',
      body: JSON.stringify(playerId)
    });
  } catch (error) {
      throw error;
  }
};

/**
 * Post weapon data (related to Block Battle tournament mode) to backend
 * 
 * @returns 
 */
export const saveWeaponDataToDB = async (p1Weapons: Weapon[], p2Weapons: Weapon[]): Promise< {status: string} > => {
  try {
    return await apiRequest('/users/save-weapon-data', {
      method: 'POST',
      body: JSON.stringify({p1Weapons: p1Weapons, p2Weapons: p2Weapons})
    });
  } catch (error) {
      throw error;
  }
};

/**
 * Start a tournament by clearing old tournament data from DB and adding loggedIn user to it
 * 
 * @returns Promise with user data
 */
export const startNewTournament = async (): Promise< {status: string} > => {
  try {
    	return await apiRequest(`/users/start-new-tournament`);
  } catch (error) {
    	throw error;
  }
};

/**
 * End Tournament. Backend will verify results and return the winner user(s)
 * 
 * @returns Promise with winner user(s) data
 */
export const endTournamentAPI = async (): Promise< TournamentPlayer[] > => {
  try {
    	return await apiRequest(`/users/end-tournament`);
  } catch (error) {
    	throw error;
  }
};


/**
 * Check from backend if Tournament is ready to be played (meaning, if it already has have 4 validated players)
 * 
 */
export const checkTournamentStatus = async (): Promise<{status: string}> => {
  try {
    return await apiRequest(`/users/check-tournament-status`);
  } catch (error) {
      throw error;
  }
};

/**
 * Get tournament player data from backend
 * 
 */
export const getTournamentPlayers = async (): Promise<TournamentPlayer[]> => {
  try {
    return await apiRequest(`/users/tournament-players`);
  } catch (error) {
      throw error;
  }
};

/**
 * Get user data of the next Tournament game participants
 * 
 */
export const getNextTournamentGameData = async (): Promise<TournamentPlayer[]> => {
  try {
    return await apiRequest(`/users/next-tournament-game-data`);
  } catch (error) {
      throw error;
  }
};

/**
 * Get current opponent's data from backend
 * 
 */
export const getOpponentData = async (): Promise<User> => {
  try {
    return await apiRequest(`/users/opponent-data`);
  } catch (error) {
      throw error;
  }
};



/**
 * Check from backend if we have a logged in user or not (based on JWT token)
 * This makes it safer for us to track the logged in state (rather than using frontend's localStorage)
 * 
 */
export const checkIsLoggedIn = async (): Promise<{status: string}> => {
  try {
    return await apiRequest(`/users/is-logged-in`);
  } catch (error) {
      throw error;
  }
};

/**
 * Authenticates current logged in user with JWT and returns the user data for him/her.
 * 
 */
export const getLoggedInUserData = async (): Promise<User> => {
  try {
    return await apiRequest(`/users/logged-in-user-data`);
  } catch (error) {
      throw error;
  }
};

/**
 * Get user data for EndScreen by ID
 * 
 * @param id Username to fetch
 * @returns Promise with user data
 */
export const getEndScreenData = async (id: number): Promise<User> => {
  try {
    return await apiRequest(`/users/name-and-rank/${id}`);
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
export const getUserDataByUsername = async (username: string): Promise<User> => {
  try {
    return await apiRequest(`/users/by-username/${username}`);
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
export const recordMatchResult = async (player1: User, player2: User, matchData: bbMatchData | pongMatchData): Promise<{ status: string }> => {
  try {
    return await apiRequest('/games/record-match', {
      method: 'POST',
      body: JSON.stringify({ player1, player2, matchData })
    });    
  } catch (error) {
      throw error;
  }
}; 

/**
 * Update user statistics after a tournament game
 * 
 * @param winner Winner user data
 * @param loser Loser user data
 * @returns Promise with status string
 */
export const recordTournamentMatchResult = async (player1: User, player2: User, matchData: bbMatchData | pongMatchData): Promise<{ status: string }> => {
  try {

    return await apiRequest('/games/record-tournament-match', {
      method: 'POST',
      body: JSON.stringify({ player1, player2, matchData })
    });    
  } catch (error) {
      throw error;
  }
}; 


/**
 * Get player data for Tournament mode EndScreen
 * 
 * @returns Promise with the updated Tournament game user data
 */
export const getTournamentEndScreenData = async (): Promise<{winner: TournamentPlayer, loser: TournamentPlayer, playerArr: TournamentPlayer[], matchCount: number}> => {
  try {
    return await apiRequest('/games/get-tournament-end-screen-data');    
  } catch (error) {
      throw error;
  }
}; 

/**
 * Get the whole match history of a user based on user ID
 * 
 */
export const getMatchHistoryByID = async (id: number): Promise<MatchData[]> => {
  try {
    const matchData = await apiRequest(`/games/matches/player/${id}`);
	return matchData.matches;
  } catch (error) {
      throw error;
  }
};

/**
 * Get single match data by match ID
 * 
 */
export const getMatchByID = async (id: number): Promise<MatchData> => {
  try {
    const { match, gameStats } = await apiRequest(`/games/match/${id}`);

	const finalData: MatchData = match;
	finalData.game_data = gameStats;
	return finalData;
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
/*
export const updateUserStats = async (winner: User, loser: User): Promise<{ winner: User, loser: User }> => {
  try {
    return await apiRequest('/users/update-stats', {
      method: 'POST',
      body: JSON.stringify({ winner, loser })
    });    
  } catch (error) {
      throw error;
  }
}; */


/**
 * Update user statistics after a game
 * 
 * @param winner Winner user data
 * @param loser Loser user data
 * @returns Promise with the updated user data
 */
/*
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
}; */

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

export const getPreferredLanguage = async (): Promise<LanguageResponse> => {
  try {
    return await apiRequest('/users/language');
  } catch (error) {
    throw error;
  }
};

export const updatePreferredLanguage = async (language: string): Promise<{ success: boolean; language: string }> => {
  try {
    return await apiRequest('/users/language', {
      method: 'PUT',
      body: JSON.stringify({ language })
    });
  } catch (error) {
    throw error;
  }
};

 
