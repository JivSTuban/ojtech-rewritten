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

// Google OAuth Authentication - Convert Google token to JWT
const googleLogin = async (tokenId: string) => {
  console.log('Google login function called with token (first 10 chars):', tokenId.substring(0, 10) + '...');
  
  try {
    // Extract user information from the Google token (which is already in JWT format)
    const tokenParts = tokenId.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid Google token format');
    }
    
    // Decode the payload (second part of the JWT)
    const payload = JSON.parse(atob(tokenParts[1]));
    console.log('Decoded Google token payload:', payload);
    
    // Extract user information from the payload
    const email = payload.email;
    const name = payload.name || '';
    const picture = payload.picture || '';
    const sub = payload.sub; // Google's unique ID for the user
    
    if (!email) {
      throw new Error('Email not found in Google token');
    }
    
    // Generate a username from the email
    const username = email.split('@')[0];
    
    // Create a user object with the extracted information
    const user = {
      id: parseInt(sub.substring(0, 8), 16) || 9999, // Convert part of sub to a number for ID
      username,
      email,
      name,
      picture,
      roles: ['ROLE_STUDENT'], // Default role
      accessToken: tokenId, // Use the Google token as the access token
    };
    
    // Store the user in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    console.log('Google authentication successful, user stored:', username);
    
    return user;
  } catch (error: any) {
    console.error('Google token processing error:', error);
    
    // Format error message for UI
    let errorMessage = 'Failed to process Google authentication token';
    if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
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
  googleLogin,
  logout,
  getCurrentUser,
};

export default authService; 