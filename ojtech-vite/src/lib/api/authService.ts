import axios from 'axios';
import { API_BASE_URL } from '../../apiConfig';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
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

interface GoogleAuthResponse {
  accessToken: string;
}

const register = async (data: SignupData) => {
  console.log('Sending registration data:', JSON.stringify(data, null, 2));
  console.log('To URL:', `${AUTH_API_URL}/signup`);
  try {
    const response = await axios.post(`${AUTH_API_URL}/signup`, data);
    console.log('Registration response status:', response.status);
    console.log('Registration response data:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Registration API error:', error);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
    throw error;
  }
};

const login = async (data: LoginData) => {
  console.log('Login function called with raw data:', data);
  
  const loginData = {
    usernameOrEmail: data.usernameOrEmail,
    password: data.password
  };
  
  console.log('Sending login request with data:', JSON.stringify(loginData, null, 2));
  console.log('To URL:', `${AUTH_API_URL}/signin`);
  
  try {
    const response = await axios.post(`${AUTH_API_URL}/signin`, loginData);
    console.log('Login response status:', response.status);
    console.log('Login response data structure:', Object.keys(response.data));
    
    if (response.data.accessToken) {
      console.log('Access token received, storing user data');
      localStorage.setItem('user', JSON.stringify(response.data));
    } else {
      console.warn('No access token in response data');
    }
    return response.data;
  } catch (error: any) {
    console.error('Login API error:', error);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
    throw error;
  }
};

const googleLogin = async (tokenId: string) => {
  console.log('Google login function called with token (first 10 chars):', tokenId.substring(0, 10) + '...');
  
  try {
    const response = await axios.post(`${AUTH_API_URL}/oauth2/google`, { tokenId });
    
    console.log('Google auth backend response:', response.data);
    
    if (response.data && response.data.accessToken) {
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } else {
      throw new Error('Invalid response from backend OAuth endpoint');
    }
  } catch (error: any) {
    console.error('Google authentication error:', error);
    let errorMessage = error.response?.data?.message || 'Failed to authenticate with Google';
    throw new Error(errorMessage);
  }
};

const logout = () => {
  localStorage.removeItem('user');
  console.log('User logged out, localStorage user data cleared');
};

const getCurrentUser = (): UserData | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const userData = JSON.parse(userStr) as UserData;
      console.log('Current user retrieved from localStorage:', userData.username);
      return userData;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      localStorage.removeItem('user');
      return null;
    }
  }
  return null;
};

const authService = {
  register,
  login,
  googleLogin,
  logout,
  getCurrentUser,
};

export default authService; 