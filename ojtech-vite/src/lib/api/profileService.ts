import axios from 'axios';
import authService from './authService'; // To get the token

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/profile';

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
    
    const response = await axios.post(`${API_URL}/create`, 
      { fullName },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error creating initial profile:", error.message);
    throw error;
  }
};

// Student Profile
const completeStudentOnboarding = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/student/onboarding`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error: any) {
    console.error("Error completing student onboarding:", error.message);
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
    const response = await axios.get(`${API_URL}/student/me`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.warn("Student profile not found - this may be normal for new users");
    } else {
      console.error("Error fetching student profile:", error.message);
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
  completeEmployerOnboarding,
  uploadEmployerLogo,
  getCurrentEmployerProfile,
};

export default profileService; 