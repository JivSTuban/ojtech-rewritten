import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/auth';

interface SignupData {
  username?: string;
  email?: string;
  password?: string;
  roles?: string[];
}

interface LoginData {
  usernameOrEmail?: string;
  password?: string;
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  roles: string[];
  accessToken: string;
}

const register = async (data: SignupData) => {
  return axios.post(`${API_URL}/signup`, data);
};

const login = async (data: LoginData) => {
  const response = await axios.post(`${API_URL}/signin`, data);
  if (response.data.accessToken) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
  // Potentially call a backend endpoint to invalidate the token if implemented
};

const getCurrentUser = (): UserData | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr) as UserData;
  }
  return null;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default authService; 