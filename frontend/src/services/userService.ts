import { apiRequest } from './Api';


interface RegisterData {
  username: string;
  password: string;
}

export const registerUser = async (userData: RegisterData) => {
  return apiRequest('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};