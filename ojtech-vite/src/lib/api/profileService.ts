import axios from 'axios';
import authService from './authService';
import { API_BASE_URL } from '../../apiConfig';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const API_URL = `${API_BASE_URL}/profiles`;

const getAuthHeaders = () => {
  // First, try to get the token from the user object
  const user = authService.getCurrentUser();
  if (user && user.accessToken) {
    console.log('Found token in user object');
    return { Authorization: 'Bearer ' + user.accessToken };
  }
  
  // If not found, check if there's a standalone token
  const token = localStorage.getItem('token');
  if (token) {
    console.log('Found standalone token in localStorage');
    return { Authorization: 'Bearer ' + token };
  }
  
  console.warn('No authentication token found');
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
        throw error;
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
    
    // First, check if the user already has a profile
    let profileExists = false;
    try {
      const checkResponse = await axios.get(`${API_URL}/me`, { headers: getAuthHeaders() });
      if (checkResponse && checkResponse.data) {
        profileExists = true;
        console.log('Existing profile found:', checkResponse.data);
      }
    } catch (error: any) {
      // If 404, profile doesn't exist, which is fine
      if (error.response?.status !== 404) {
        console.error("Error checking existing profile:", error);
      } else {
        console.log('No existing profile found (404 response)');
      }
    }
    
    // If no profile exists yet, create a simple profile first
    if (!profileExists) {
      try {
        console.log('Creating initial student profile...');
        
        // Extract education data properly
        const education = data.education || {};
        
        const initialProfileData = {
          fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          location: data.location || '',
          // Include education data
          university: education.university || data.university || '',
          major: education.major || data.major || '',
          graduationYear: education.graduationYear || data.graduationYear || null,
          // Include contact info and professional links
          phoneNumber: data.phoneNumber || '',
          githubUrl: data.githubUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          portfolioUrl: data.portfolioUrl || '',
          // Include other minimal required fields
          skills: data.skills || []
        };
        
        console.log('Initial profile data:', initialProfileData);
        await axios.post(`${API_URL}/create`, initialProfileData, { headers: getAuthHeaders() });
        console.log('Created initial profile successfully');
      } catch (error: any) {
        console.error("Error creating initial profile:", error);
        if (error.response?.data) {
          console.error("Server error details:", error.response.data);
        }
      }
    }
    
    // Ensure token is still valid before continuing
    const authHeaders = getAuthHeaders();
    console.log('Using auth headers for onboarding submission:', authHeaders);
    
    // Now proceed with the onboarding data submission
    console.log('Submitting complete onboarding data');
    const response = await axios.post(`${API_BASE_URL}/student-profiles/complete-onboarding`, data, { headers: authHeaders });
    console.log('Student onboarding successful response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error completing student onboarding:", error);
    if (error.response) {
      console.error("Server response status:", error.response.status);
      console.error("Server response data:", error.response.data);
    }
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
    const response = await axios.get(`${API_URL}/me`, { headers: getAuthHeaders() });
    console.log('Successfully retrieved profile:', response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching student profile:", error.message);
    throw error;
  }
};

const submitStudentOnboarding = async (data: any) => {
  try {
    console.log('Submitting student onboarding data:', data);
    
    // First, check if the user already has a profile
    let profileExists = false;
    try {
      const checkResponse = await axios.get(`${API_URL}/me`, { headers: getAuthHeaders() });
      if (checkResponse && checkResponse.data) {
        profileExists = true;
        console.log('Existing profile found:', checkResponse.data);
      }
    } catch (error: any) {
      // If 404, profile doesn't exist, which is fine
      if (error.response?.status !== 404) {
        console.error("Error checking existing profile:", error);
      } else {
        console.log('No existing profile found (404 response)');
      }
    }
    
    // If no profile exists yet, create a simple profile first
    if (!profileExists) {
      try {
        console.log('Creating initial student profile...');
        
        // Extract education data properly
        const education = data.education || {};
        
        const initialProfileData = {
          fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          location: data.location || '',
          // Include education data
          university: education.university || data.university || '',
          major: education.major || data.major || '',
          graduationYear: education.graduationYear || data.graduationYear || null,
          // Include other minimal required fields
          skills: data.skills || []
        };
        
        console.log('Initial profile data:', initialProfileData);
        await axios.post(`${API_URL}/create`, initialProfileData, { headers: getAuthHeaders() });
        console.log('Created initial profile successfully');
      } catch (error: any) {
        console.error("Error creating initial profile:", error);
        if (error.response?.data) {
          console.error("Server error details:", error.response.data);
        }
      }
    }
    
    // Ensure token is still valid before continuing
    const authHeaders = getAuthHeaders();
    console.log('Using auth headers for onboarding submission:', authHeaders);
    
    // Now proceed with the onboarding data submission
    console.log('Submitting complete onboarding data');
    const response = await axios.post(`${API_BASE_URL}/student-profiles/complete-onboarding`, data, { headers: authHeaders });
    console.log('Student onboarding successful response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error submitting student onboarding:', error.message);
    if (error.response) {
      console.error("Server response status:", error.response.status);
      console.error("Server response data:", error.response.data);
    }
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
    const response = await axios.get(`${API_URL}/me`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching employer profile:", error.message);
    throw error;
  }
};

const updateEducationInfo = async (educationData: any) => {
  try {
    console.log('Updating education info:', educationData);
    
    // Format the education data for the API
    const updateData = {
      university: educationData.university || '',
      major: educationData.major || '',
      graduationYear: educationData.graduationYear || null
    };
    
    // Update the profile via the API
    const response = await axios.put(`${API_URL}/me`, updateData, { headers: getAuthHeaders() });
    console.log('Education info updated successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating education info:', error.message);
    if (error.response) {
      console.error("Server response status:", error.response.status);
      console.error("Server response data:", error.response.data);
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
  updateEducationInfo,
};

export default profileService; 