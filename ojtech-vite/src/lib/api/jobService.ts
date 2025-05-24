import axios from 'axios';
import authService from './authService'; // To get the token

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/jobs';

const getAuthHeaders = () => {
  const user = authService.getCurrentUser();
  if (user && user.accessToken) {
    return { Authorization: 'Bearer ' + user.accessToken };
  }
  return {};
};

// For Employers
const createJob = async (jobData: any) => {
  return axios.post(`${API_URL}/jobs`, jobData, { headers: getAuthHeaders() });
};

const updateJob = async (jobId: string | number, jobData: any) => {
  return axios.put(`${API_URL}/jobs/${jobId}`, jobData, { headers: getAuthHeaders() });
};

const deleteJob = async (jobId: string | number) => {
  return axios.delete(`${API_URL}/jobs/${jobId}`, { headers: getAuthHeaders() });
};

const getEmployerJobs = async (page = 0, size = 10) => {
  const response = await axios.get(`${API_URL}/jobs/employer?page=${page}&size=${size}`, { headers: getAuthHeaders() });

  return response.data; // Expected to be a Page<Job> object
};

const getEmployerJobById = async (jobId: string | number) => {
  const response = await axios.get(`${API_URL}/jobs/${jobId}`, { headers: getAuthHeaders() });
  return response.data;
};

// For Public/Students
const getAllActiveJobs = async (page = 0, size = 10) => {
  const response = await axios.get(`${API_URL}?page=${page}&size=${size}`);
  return response.data; // Expected to be a Page<Job> object
};

const getActiveJobById = async (jobId: string | number) => {
  const response = await axios.get(`${API_URL}/${jobId}`);
  return response.data;
};

const searchActiveJobsByTitle = async (title: string, page = 0, size = 10) => {
  const response = await axios.get(`${API_URL}/search?title=${encodeURIComponent(title)}&page=${page}&size=${size}`);
  return response.data;
};


const jobService = {
  // Employer
  createJob,
  updateJob,
  deleteJob,
  getEmployerJobs,
  getEmployerJobById,
  // Public
  getAllActiveJobs,
  getActiveJobById,
  searchActiveJobsByTitle,
};

export default jobService;
