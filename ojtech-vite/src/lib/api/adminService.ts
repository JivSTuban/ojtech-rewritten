import apiClient from './apiClient';

// Types
interface Role {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Profile {
  id: string;
  fullName: string;
  role: string;
  hasCompletedOnboarding: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  // Other profile fields may be present
}

interface User {
  id: string;
  username: string;
  email: string;
  roles: Role[];
  enabled: boolean;
  emailVerified: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: Profile;
}

interface Stats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
}

interface DetailedStats {
  totalUsers: number;
  userDistribution: {
    admin: number;
    employer: number;
    student: number;
  };
  totalJobs: number;
  totalApplications: number;
}

interface ApiResponse {
  users: User[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

// Dashboard Statistics
const getStats = async (): Promise<Stats> => {
  const response = await apiClient.get('/api/admin/stats');
  return response.data;
};

const getDetailedStats = async (): Promise<DetailedStats> => {
  const response = await apiClient.get('/api/admin/stats/detailed');
  return response.data;
};

// User Management
const getAllUsers = async (): Promise<User[]> => {
  const response = await apiClient.get('/api/admin/users');
  return response.data;
};

const getPaginatedUsers = async (
  page = 0,
  size = 10,
  sortBy = 'username',
  direction = 'asc'
): Promise<ApiResponse> => {
  const response = await apiClient.get('/api/admin/users/paginated', {
    params: { page, size, sortBy, direction }
  });
  return response.data;
};

const searchUsers = async (
  query?: string,
  page = 0,
  size = 10
): Promise<ApiResponse> => {
  const response = await apiClient.get('/api/admin/users/search', {
    params: { query, page, size }
  });
  return response.data;
};

const createUser = async (userData: {
  username: string;
  email: string;
  password: string;
  role?: string;
}): Promise<User> => {
  const response = await apiClient.post('/api/admin/users', userData);
  return response.data;
};

const getUserById = async (id: string): Promise<User> => {
  const response = await apiClient.get(`/api/admin/users/${id}`);
  return response.data;
};

const updateUser = async (id: string, userData: {
  username?: string;
  email?: string;
  password?: string;
}): Promise<User> => {
  const response = await apiClient.put(`/api/admin/users/${id}`, userData);
  return response.data;
};

const deleteUser = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`/api/admin/users/${id}`);
  return response.data;
};

const updateUserRoles = async (id: string, roles: string[]): Promise<User> => {
  const response = await apiClient.put(`/api/admin/users/${id}/roles`, roles);
  return response.data;
};

const toggleUserStatus = async (id: string): Promise<User> => {
  const response = await apiClient.put(`/api/admin/users/${id}/toggle-status`);
  return response.data;
};

// Jobs Management
const getPaginatedJobs = async (
  page = 0, 
  size = 10
): Promise<any> => {
  const response = await apiClient.get('/api/admin/jobs', {
    params: { page, size }
  });
  return response.data;
};

const deleteJob = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`/api/admin/jobs/${id}`);
  return response.data;
};

// Applications Management
const getPaginatedApplications = async (
  page = 0,
  size = 10
): Promise<any> => {
  const response = await apiClient.get('/api/admin/applications', {
    params: { page, size }
  });
  return response.data;
};

const getApplicationById = async (id: string): Promise<any> => {
  const response = await apiClient.get(`/api/admin/applications/${id}`);
  return response.data;
};

const deleteApplication = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`/api/admin/applications/${id}`);
  return response.data;
};

const adminService = {
  // Statistics
  getStats,
  getDetailedStats,
  // User Management
  getAllUsers,
  getPaginatedUsers,
  searchUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRoles,
  toggleUserStatus,
  // Jobs Management
  getPaginatedJobs,
  deleteJob,
  // Applications Management
  getPaginatedApplications,
  getApplicationById,
  deleteApplication,
};

export default adminService;
