import { apiRequest } from './Api';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  color?: string;
}

export const registerUser = async (userData: RegisterData) => {
  return apiRequest('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};