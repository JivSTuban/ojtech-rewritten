import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const AUTH_API_URL = `${API_BASE_URL}/auth`;

interface SignupData {
  username: string;
  email: string;
  password: string;
  roles?: string[];
}

interface LoginData {
  usernameOrEmail: string;
  password: string;
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  roles: string[];
  accessToken: string;
}

const register = async (data: SignupData) => {
  console.log('Sending registration data:', data);
  console.log('To URL:', `${AUTH_API_URL}/signup`);
  try {
    const response = await axios.post(`${AUTH_API_URL}/signup`, data);
    console.log('Registration response:', response);
    return response.data;
  } catch (error) {
    console.error('Registration API error:', error);
    throw error;
  }
};

const login = async (data: LoginData) => {
  const response = await axios.post(`${AUTH_API_URL}/signin`, data);
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