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

// Student Profile
const completeStudentOnboarding = async (data: any) => {
  return axios.post(`${API_URL}/student/onboarding`, data, { headers: getAuthHeaders() });
};

const uploadStudentCv = async (cvFile: File) => {
  const formData = new FormData();
  formData.append('cvFile', cvFile);
  return axios.post(`${API_URL}/student/cv`, formData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data',
    },
  });
};

const getCurrentStudentProfile = async () => {
  const response = await axios.get(`${API_URL}/student/me`, { headers: getAuthHeaders() });
  return response.data;
};

// Employer Profile
const completeEmployerOnboarding = async (data: any) => {
  return axios.post(`${API_URL}/employer/onboarding`, data, { headers: getAuthHeaders() });
};

const uploadEmployerLogo = async (logoFile: File) => {
  const formData = new FormData();
  formData.append('logoFile', logoFile);
  return axios.post(`${API_URL}/employer/logo`, formData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data',
    },
  });
};

const getCurrentEmployerProfile = async () => {
  const response = await axios.get(`${API_URL}/employer/me`, { headers: getAuthHeaders() });
  return response.data;
};

const profileService = {
  completeStudentOnboarding,
  uploadStudentCv,
  getCurrentStudentProfile,
  completeEmployerOnboarding,
  uploadEmployerLogo,
  getCurrentEmployerProfile,
};

export default profileService; 