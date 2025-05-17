import axios from 'axios';

// Base API URL - can be loaded from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log(`apiClient request: ${config.method?.toUpperCase()} ${config.url}`);
    
    if (token) {
      console.log('apiClient request: Token found, length:', token.length);
      console.log('apiClient request: Token preview:', token.substring(0, 20) + '...');
      
      // If token already has Bearer prefix, use it directly
      if (token.startsWith('Bearer ')) {
        config.headers.Authorization = token;
        console.log('apiClient request: Using token with existing Bearer prefix');
      } else {
        // Otherwise add the Bearer prefix
        config.headers.Authorization = `Bearer ${token}`;
        console.log('apiClient request: Adding Bearer prefix to token');
      }
      
      // Log the actual header being sent for debugging
      console.log('apiClient request: Authorization header:', config.headers.Authorization.substring(0, 20) + '...');
    } else {
      console.log('apiClient request: No token found in localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized or 403 Forbidden errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error('Authentication error:', error.response.status, 'URL:', error.config.url, 'Method:', error.config.method);
      console.error('Request headers:', JSON.stringify(error.config.headers));
      console.error('Response data:', JSON.stringify(error.response.data || {}));
      
      // Don't clear auth for specific endpoints that are expected to fail sometimes
      const isCVMeEndpoint = error.config.url?.includes('/cvs/me');
      const isProfileMeEndpoint = error.config.url?.includes('/profiles/me');
      
      // Check if this is occurring during login flow
      const justLoggedIn = localStorage.getItem('_justLoggedIn') === 'true';
      const isPendingLogin = localStorage.getItem('isPendingLogin') === 'true';
      const loginTimestamp = localStorage.getItem('_loginTimestamp');
      const loginAttemptTime = localStorage.getItem('_loginAttempt') 
        ? parseInt(localStorage.getItem('_loginAttempt') || '0', 10) 
        : 0;
      
      // Consider this a valid post-login state where 403s are expected for some endpoints
      const isPostLoginCheck = justLoggedIn && 
        (Date.now() - loginAttemptTime < 60000); // Within 1 minute of login attempt
        
      const debugInfo = {
        justLoggedIn,
        isPendingLogin,
        loginTimestamp,
        loginAttemptTime,
        requestUrl: error.config.url,
        status: error.response.status
      };
      
      // For CV endpoint, allow 403/404 errors without logging out
      if (isCVMeEndpoint) {
        console.log('CV endpoint returned error - this is normal for users without CVs');
        return Promise.reject(error);
      }
      
      // If just logged in and getting a profile check failure, don't logout
      if (isPostLoginCheck) {
        console.log('Detected post-login profile check, NOT clearing auth data - this is expected during login flow', debugInfo);
        return Promise.reject(error);
      }
      
      // If no special cases apply, log the user out
      if (!isPostLoginCheck && !isCVMeEndpoint) {
        console.error('Authentication failed, clearing auth data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('_justLoggedIn');
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  // Register a new user
  register: async (userData: any) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (email: string, password: string) => {
    console.log('apiClient: Attempting login for', email);
    
    try {
      // Clear any existing token data before attempting login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('_justLoggedIn');
      localStorage.removeItem('_pendingLogin');
      localStorage.removeItem('_loginAttempt');
      
      // Set a timestamp for this login attempt
      const loginTimestamp = Date.now().toString();
      localStorage.setItem('_loginAttempt', loginTimestamp);
      
      const response = await apiClient.post('/auth/login', { email, password });
      console.log('apiClient: Raw login response:', JSON.stringify(response.data));
      
      // Check for token in the response
      const token = response.data.token;
      
      if (!token) {
        console.error('apiClient: Invalid login response - missing token');
        throw new Error('Invalid response from server - missing token');
      }
      
      // Verify that the token is in a valid JWT format (has three parts separated by dots)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('apiClient: Invalid token format, not a valid JWT');
        throw new Error('Invalid token format received from server');
      }
      
      // Try to decode the token's payload to verify it's properly formatted
      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        if (!payload.sub) {
          console.error('apiClient: Invalid token payload, missing subject');
          throw new Error('Invalid token structure');
        }
        console.log('apiClient: JWT validation successful, token contains user:', payload.sub);
      } catch (e) {
        console.error('apiClient: Failed to parse token payload:', e);
        throw new Error('Malformed token received from server');
      }
      
      const { id, email: userEmail, fullName, role, onboardingCompleted = false } = response.data;
      
      if (!id || !userEmail) {
        console.error('apiClient: Invalid login response - missing user data');
        throw new Error('Invalid user data received');
      }
      
      // Extract user data from response
      const user = {
        id,
        email: userEmail,
        fullName,
        role,
        onboardingCompleted
      };
      
      console.log('apiClient: Login successful, storing token and user data');
      
      // Store token and user data with explicit debugging
      try {
        localStorage.setItem('token', token);
        console.log('apiClient: Token stored, length:', token.length);
        console.log('apiClient: Token preview:', token.substring(0, 20) + '...');
      } catch (error) {
        console.error('apiClient: Failed to store token:', error);
        throw new Error('Failed to store token');
      }
      
      try {
        const userJson = JSON.stringify(user);
        localStorage.setItem('user', userJson);
        console.log('apiClient: User data stored, length:', userJson.length);
      } catch (error) {
        console.error('apiClient: Failed to store user data:', error);
        throw new Error('Failed to store user data');
      }
      
      // Set flags to prevent premature logout
      localStorage.setItem('_justLoggedIn', 'true');
      localStorage.setItem('_loginTimestamp', loginTimestamp);
      console.log('apiClient: Set _justLoggedIn flag to prevent premature logout');
      
      // Set a timeout to clear the flag after 10 seconds
      // Use a more reliable approach with window.setTimeout to ensure it works across different contexts
      if (typeof window !== 'undefined') {
        window.setTimeout(() => {
          // Only clear if the timestamp matches (no newer login has happened)
          if (localStorage.getItem('_loginTimestamp') === loginTimestamp) {
            localStorage.removeItem('_justLoggedIn');
            localStorage.removeItem('_loginTimestamp');
            console.log('apiClient: Cleared _justLoggedIn flag after timeout');
          } else {
            console.log('apiClient: Not clearing _justLoggedIn flag as a newer login occurred');
          }
        }, 10000); // Extended to 10 seconds for better reliability
      }
      
      // Verify data was stored correctly
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (!storedToken || !storedUser) {
          console.error('apiClient: Failed to store authentication data');
          throw new Error('Failed to store authentication data');
        }
        
        console.log('apiClient: Stored user data verification successful');
        console.log('apiClient: Verified token in localStorage, length:', storedToken.length);
        console.log('apiClient: Verified user in localStorage, length:', storedUser.length);
      } catch (error) {
        console.error('apiClient: Error verifying stored data:', error);
        throw error;
      }
      
      return user;
    } catch (error) {
      console.error('apiClient: Login failed:', error);
      // Clear any partial data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('_justLoggedIn');
      localStorage.removeItem('_loginTimestamp');
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('_justLoggedIn');
  },

  // Get current user
  getCurrentUser: () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || token === "undefined" || token === "null") {
        console.log('apiClient getCurrentUser: No valid token found');
        return null;
      }
      
      // Log token format to help diagnose issues
      const hasBearerPrefix = token.startsWith('Bearer ');
      console.log('apiClient getCurrentUser: Token found, length:', token.length, 
                 'has Bearer prefix:', hasBearerPrefix);
      
      const userStr = localStorage.getItem('user');
      
      // Check if the user item exists and is not the string "undefined" or "null"
      if (!userStr || userStr === "undefined" || userStr === "null") {
        console.log('apiClient getCurrentUser: No valid user data found, clearing token');
        localStorage.removeItem('token');
        return null;
      }
      
      try {
        // Make sure the string is valid JSON before parsing
        const user = JSON.parse(userStr);
        if (!user || !user.id || !user.email) {
          console.log('apiClient getCurrentUser: Invalid user data (missing required fields)');
          // Clean up invalid data to prevent future errors
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          return null;
        }
        
        console.log('apiClient getCurrentUser: Valid user found:', user.email);
        return user;
      } catch (error) {
        console.error('apiClient getCurrentUser: Error parsing user data:', error, 'Data was:', userStr);
        // Clean up invalid data to prevent future errors
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return null;
      }
    } catch (error) {
      console.error('apiClient getCurrentUser: Unexpected error accessing localStorage:', error);
      return null;
    }
  },

  // Verify email
  verifyEmail: async (token: string) => {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, password: string) => {
    const response = await apiClient.post('/auth/reset-password', { token, password });
    return response.data;
  }
};

// Profile service
export const profileService = {
  // Get user profile
  getProfile: async () => {
    const response = await apiClient.get('/profiles/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData: any) => {
    // Get current user ID first
    const user = authService.getCurrentUser();
    if (!user || !user.id) {
      throw new Error('User not authenticated');
    }
    
    const response = await apiClient.put(`/profiles/${user.id}`, profileData);
    return response.data;
  }
};

// Resume service
export const resumeService = {
  // Get user's resume/CV data
  getResumeData: async () => {
    try {
      const response = await apiClient.get('/cvs/me');
      return response.data;
    } catch (error) {
      // Handle 404/403 gracefully for CV endpoints
      if (error.response && (error.response.status === 404 || error.response.status === 403 || error.response.status === 204)) {
        // This is expected for users without CVs
        console.log('No resume uploaded yet');
        return null;
      }
      throw error;
    }
  },

  // Get user's skills extracted from resume
  getSkills: async () => {
    const response = await apiClient.get('/cvs/skills');
    return response.data;
  },

  // Upload a new resume
  uploadResume: async (formData: FormData) => {
    const response = await apiClient.post('/cvs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get the URL to view the resume
  getResumeUrl: async () => {
    const response = await apiClient.get('/cvs/url');
    return response.data.url;
  }
};

export default apiClient; 