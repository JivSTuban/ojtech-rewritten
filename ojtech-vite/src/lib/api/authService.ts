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
  // Log the raw data received
  console.log('Login function called with raw data:', data);
  
  // Ensure data is properly formatted
  const loginData = {
    usernameOrEmail: data.usernameOrEmail,
    password: data.password
  };
  
  console.log('Sending login request with data:', JSON.stringify(loginData, null, 2));
  console.log('To URL:', `${AUTH_API_URL}/signin`);
  
  try {
    // Send the data directly as expected by the backend
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
      console.error('Error response headers:', error.response.headers);
    }
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('user');
  console.log('User logged out, localStorage user data cleared');
  // Potentially call a backend endpoint to invalidate the token if implemented
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
      localStorage.removeItem('user'); // Clear invalid data
      return null;
    }
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