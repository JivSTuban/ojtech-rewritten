export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  appliedDate: string;
  status: ApplicationStatus;
  lastUpdated: string;
  matchPercentage?: number;
  resumeUrl?: string;
  coverLetter?: string;
  applicantId?: string;
  applicantName?: string;
  applicantEmail?: string;
}

export type ApplicationStatus = 'pending' | 'reviewed' | 'interview' | 'rejected' | 'accepted';

export interface ApplicationFilters {
  status?: ApplicationStatus | null;
  searchTerm?: string;
  sortBy?: 'date' | 'company' | 'status';
  sortDirection?: 'asc' | 'desc';
} 