export interface JobApplication {
  id: string;
  createdAt: string;
  updatedAt: string;
  coverLetter: string;
  status: ApplicationStatus;
  appliedAt: string;
  lastUpdatedAt: string;
  active: boolean;
  studentId: string;
  studentFullName: string;
  studentFirstName: string;
  studentLastName: string;
  studentUniversity: string;
  studentMajor: string;
  studentGraduationYear: number;
  studentSkills: string;
  cvId: string;
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  matchScore: number;
}

export type ApplicationStatus = 'PENDING' | 'REVIEWED' | 'INTERVIEW' | 'REJECTED' | 'ACCEPTED';

export interface ApplicationFilters {
  status?: ApplicationStatus | null;
  searchTerm?: string;
  sortBy?: 'date' | 'company' | 'status';
  sortDirection?: 'asc' | 'desc';
} 