import apiClient from './apiClient';
import { JobApplication, ApplicationStatus } from '../types/application';

const API_URL = '/api/applications';

// Get all applications for the logged-in student
const getStudentApplications = async (): Promise<JobApplication[]> => {
  const response = await apiClient.get(API_URL);
  return response.data;
};

// Get all applications for a specific job (for employers)
const getJobApplications = async (jobId: string): Promise<JobApplication[]> => {
  console.log("jobApplicationService.getJobApplications called with jobId:", jobId);
  const response = await apiClient.get(`${API_URL}/job/${jobId}`);
  return response.data;
};

// Apply for a job
const applyForJob = async (
  jobId: string, 
  applicationData: { 
    cvId?: string, 
    coverLetter?: string 
  }
): Promise<JobApplication> => {
  const response = await apiClient.post(`${API_URL}/apply/${jobId}`, applicationData);
  return response.data;
};

// Update application status (for employers)
const updateApplicationStatus = async (
  applicationId: string, 
  statusData: { 
    status: ApplicationStatus, 
    feedback?: string 
  }
): Promise<JobApplication> => {
  console.log("jobApplicationService.updateApplicationStatus called with:", applicationId, statusData);
  const response = await apiClient.put(`${API_URL}/${applicationId}/status`, statusData);
  return response.data;
};

// Get a specific application by ID
const getApplicationById = async (applicationId: string): Promise<JobApplication> => {
  const response = await apiClient.get(`${API_URL}/${applicationId}`);
  return response.data;
};

// Withdraw an application (for students)
const withdrawApplication = async (applicationId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`${API_URL}/${applicationId}`);
  return response.data;
};

// Get CV details for employers
interface CV {
  id: string;
  createdAt: string;
  updatedAt: string;
  parsedResume: string;
  lastUpdated: string;
  active: boolean;
  generated: boolean;
  certifications: any[];
  experiences: any[];
}

const getEmployerCVDetails = async (cvId: string): Promise<CV> => {
  console.log("jobApplicationService.getEmployerCVDetails called with cvId:", cvId);
  const response = await apiClient.get(`/api/cvs/employer/view/${cvId}`);
  return response.data;
};

const jobApplicationService = {
  getStudentApplications,
  getJobApplications,
  applyForJob,
  updateApplicationStatus,
  getApplicationById,
  withdrawApplication,
  getEmployerCVDetails,
};

export default jobApplicationService; 