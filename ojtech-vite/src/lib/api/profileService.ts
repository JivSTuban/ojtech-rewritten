import axios from 'axios';
import authService from './authService'; // To get the token

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const API_URL = `${API_BASE_URL}/profile`;

const getAuthHeaders = () => {
  const user = authService.getCurrentUser();
  if (user && user.accessToken) {
    return { Authorization: 'Bearer ' + user.accessToken };
  }
  return {};
};

// Generic profile endpoint
const getCurrentProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/me`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching general profile:", error.message);
    throw error;
  }
};

// Update profile with basic information
const updateProfile = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/update`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error: any) {
    console.error("Error updating profile:", error.message);
    throw error;
  }
};

// Create initial profile after registration
const createInitialProfile = async (fullName: string) => {
  try {
    const user = authService.getCurrentUser();
    if (!user) {
      throw new Error("User must be logged in to create profile");
    }
    
    console.log(`Creating initial profile for user ${user.username} with full name: ${fullName}`);
    
    // First check if profile already exists to avoid duplicate creation
    try {
      const existingProfile = await axios.get(`${API_URL}/me`, { headers: getAuthHeaders() });
      console.log('Profile already exists:', existingProfile.data);
      
      // If profile exists but doesn't have a fullName, update it
      if (existingProfile.data && (!existingProfile.data.fullName || existingProfile.data.fullName.trim() === '')) {
        console.log('Updating existing profile with full name');
        return await axios.post(`${API_URL}/update`, 
          { fullName },
          { headers: getAuthHeaders() }
        );
      }
      
      return existingProfile.data;
    } catch (error: any) {
      // If profile doesn't exist (404) or other error, create a new one
      if (error.response?.status === 404 || !error.response) {
        console.log('No existing profile found, creating new profile');
        const response = await axios.post(`${API_URL}/create`, 
          { fullName },
          { headers: getAuthHeaders() }
        );
        console.log('Profile creation response:', response.data);
        return response.data;
      } else {
        throw error; // Re-throw if it's not a 404
      }
    }
  } catch (error: any) {
    console.error("Error creating initial profile:", error.message);
    if (error.response?.data) {
      console.error("Server error details:", error.response.data);
    }
    throw error;
  }
};

// Student Profile
const completeStudentOnboarding = async (data: any) => {
  try {
    console.log('Sending student onboarding data:', data);
    const response = await axios.post(`${API_URL}/student/onboarding-v2`, data, { 
      headers: getAuthHeaders(),
      timeout: 15000 // Add a timeout to prevent hanging requests
    });
    console.log('Student onboarding successful response:', response.data);
    
    // Update local user data
    try {
      const userData = authService.getCurrentUser();
      if (userData) {
        // Update the stored user with completed onboarding flag
        const updatedUser = {
          ...userData,
          hasCompletedOnboarding: true
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('Updated local user data with completed onboarding flag');
      }
    } catch (updateError) {
      console.error('Failed to update local user data:', updateError);
      // This is not critical, so we don't throw the error
    }
    
    return response.data;
  } catch (error: any) {
    console.error("Error completing student onboarding:", error);
    
    // Log more details about the error
    if (error.response) {
      console.error("Server responded with status:", error.response.status);
      console.error("Response data:", error.response.data);
      console.error("Response headers:", error.response.headers);
      
      // Check for specific error types
      if (error.response.status === 403) {
        throw new Error("Authentication failed. Please log in again.");
      } else if (error.response.status === 400) {
        throw new Error(error.response.data?.message || "Invalid data provided. Please check your form entries.");
      } else if (error.response.status === 500) {
        if (error.response.data?.message?.includes('JSON') || 
            error.response.data?.message?.includes('depth') ||
            error.response.data?.message?.includes('circular')) {
          throw new Error("The server encountered a data processing error. This is likely due to circular references in the data model.");
        } else {
          throw new Error("Server error. Please try again later.");
        }
      }
    } else if (error.request) {
      console.error("No response received from server - request:", error.request);
      throw new Error("No response from server. Please check your internet connection.");
    } else {
      console.error("Error setting up request:", error.message);
      throw new Error(`Request failed: ${error.message}`);
    }
    
    // Generic error if none of the specific cases were caught
    throw error;
  }
};

const uploadStudentCv = async (cvFile: File) => {
  const formData = new FormData();
  formData.append('cvFile', cvFile);
  try {
    const response = await axios.post(`${API_URL}/student/cv`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error uploading student CV:", error.message);
    throw error;
  }
};

const getCurrentStudentProfile = async () => {
  try {
    console.log('Attempting to fetch student profile...');
    // First try to get the main profile
    const response = await axios.get(`${API_URL}/student/me`, { 
      headers: getAuthHeaders(),
      // Add a timeout to prevent hanging requests
      timeout: 15000
    });
    console.log('Successfully retrieved student profile:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error("Error fetching student profile:", error);
    
    // Check for specific error types
    if (error.response) {
      // Server responded with an error status code
      console.error("Server error response:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      
      if (error.response.status === 403) {
        console.error("Authentication failed - token may be invalid");
        throw error; // Re-throw auth errors to handle at component level
      }
      
      if (error.response.status === 404) {
        console.warn("Profile not found - this may be normal for new users");
      } else if (error.response.status === 500) {
        console.error("Server error:");
        if (error.response.data?.message?.includes('JSON') || 
            error.response.data?.message?.includes('depth') ||
            error.response.data?.message?.includes('circular') ||
            error.message?.includes('JSON') || 
            error.message?.includes('depth') ||
            error.message?.includes('circular')) {
          console.error("JSON serialization error detected - likely circular references in the entity model");
          console.info("Returning a minimal profile object to allow the UI to proceed");
        }
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("No response received from server. Network issue or server is down.");
    } else {
      // Error setting up the request
      console.error("Error setting up the request:", error.message);
    }
    
    // Return a minimal profile object to allow the UI to render the onboarding form
    return {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      university: '',
      major: '',
      graduationYear: undefined,
      bio: '',
      skills: [],
      githubUrl: '',
      linkedinUrl: '',
      portfolioUrl: '',
      hasCompletedOnboarding: false
    };
  }
};

const submitStudentOnboarding = async (data: any) => {
  try {
    console.log('Submitting student onboarding data:', data);
    const response = await axios.post(`${API_URL}/student/onboarding-v2`, data, { headers: getAuthHeaders() });
    console.log('Student onboarding successful:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error submitting student onboarding:', error.message);
    throw error;
  }
};

// Employer Profile
const completeEmployerOnboarding = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/employer/onboarding`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error: any) {
    console.error("Error completing employer onboarding:", error.message);
    throw error;
  }
};

const uploadEmployerLogo = async (logoFile: File) => {
  const formData = new FormData();
  formData.append('logoFile', logoFile);
  try {
    const response = await axios.post(`${API_URL}/employer/logo`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error uploading employer logo:", error.message);
    throw error;
  }
};

const getCurrentEmployerProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/employer/me`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.warn("Employer profile not found - this may be normal for new users");
    } else {
      console.error("Error fetching employer profile:", error.message);
    }
    throw error;
  }
};

const profileService = {
  getCurrentProfile,
  updateProfile,
  createInitialProfile,
  completeStudentOnboarding,
  uploadStudentCv,
  getCurrentStudentProfile,
  submitStudentOnboarding,
  completeEmployerOnboarding,
  uploadEmployerLogo,
  getCurrentEmployerProfile,
};

export default profileService; 