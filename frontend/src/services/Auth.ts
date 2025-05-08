import { apiRequest } from './Api';
import { User } from "../UI/UserManager"

interface LoginData {
  username: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
  message?: string;
}


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
  }
};