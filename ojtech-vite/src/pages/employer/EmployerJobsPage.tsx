import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { PlusCircle, Edit3, Trash2, Eye, MapPin, Briefcase, Calendar, Clock } from 'lucide-react';

// Define an interface for the Job data structure from backend
interface Job {
  id: number;
  title: string;
  location: string;
  jobType: string;
  isActive: boolean;
  postedDate: string;
  skillsRequired?: string[];
  description?: string;
}

interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // current page number
  size: number;
}

interface EmployerJobsPageState {
  jobsPage: Page<Job> | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  redirectTo: string | null;
}

// Mock data for temporary use
const mockJobs: Job[] = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    location: "Remote",
    jobType: "Full-time",
    isActive: true,
    postedDate: new Date().toISOString(),
    skillsRequired: ["React", "TypeScript", "CSS"],
    description: "We are looking for a skilled frontend developer with experience in React and TypeScript."
  },
  {
    id: 2,
    title: "Backend Engineer",
    location: "New York, NY",
    jobType: "Full-time",
    isActive: true,
    postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    skillsRequired: ["Java", "Spring Boot", "SQL"],
    description: "Seeking a backend engineer to help build and maintain our API infrastructure."
  },
  {
    id: 3,
    title: "UX/UI Designer",
    location: "San Francisco, CA",
    jobType: "Contract",
    isActive: false,
    postedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    skillsRequired: ["Figma", "Adobe XD", "User Research"],
    description: "Looking for a talented designer to improve our product's user experience."
  },
  {
    id: 4,
    title: "DevOps Engineer",
    location: "Austin, TX",
    jobType: "Full-time",
    isActive: true,
    postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    skillsRequired: ["AWS", "Docker", "Kubernetes", "CI/CD"],
    description: "Join our team to enhance our deployment pipelines and cloud infrastructure."
  },
  {
    id: 5,
    title: "Mobile Developer",
    location: "Chicago, IL",
    jobType: "Part-time",
    isActive: true,
    postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    skillsRequired: ["React Native", "iOS", "Android"],
    description: "Help us build our cross-platform mobile application using React Native."
  },
  {
    id: 6,
    title: "Data Scientist",
    location: "Boston, MA",
    jobType: "Full-time",
    isActive: true,
    postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    skillsRequired: ["Python", "Machine Learning", "SQL", "Data Visualization"],
    description: "Looking for a data scientist to help extract insights from our customer data."
  }
];

// Mock service for jobs
const mockJobService = {
  getEmployerJobs: (page: number, size: number): Promise<Page<Job>> => {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        const start = page * size;
        const end = start + size;
        const paginatedJobs = mockJobs.slice(start, end);
        
        resolve({
          content: paginatedJobs,
          totalPages: Math.ceil(mockJobs.length / size),
          totalElements: mockJobs.length,
          number: page,
          size: size
        });
      }, 500); // 500ms delay to simulate network request
    });
  },
  
  deleteJob: (jobId: number): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockJobs.findIndex(job => job.id === jobId);
        if (index !== -1) {
          mockJobs.splice(index, 1);
        }
        resolve();
      }, 500);
    });
  }
};

export class EmployerJobsPage extends Component<{}, EmployerJobsPageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  constructor(props: {}) {
    super(props);
    this.state = {
      jobsPage: null,
      isLoading: false,
      error: null,
      currentPage: 0,
      redirectTo: null
    };
  }

  componentDidMount() {
    this.fetchJobs(this.state.currentPage);
  }

  fetchJobs = async (page: number) => {
    // Temporarily bypass authentication check
    /*
    const { user } = this.context || {};
    
    if (!user || !user.roles.includes('ROLE_EMPLOYER')) {
      this.setState({ redirectTo: '/login' });
        return;
    }
    */
    
    this.setState({ isLoading: true, error: null });
    
    try {
      // Using mock service instead of real API
      const data = await mockJobService.getEmployerJobs(page, 5); // 5 jobs per page
      this.setState({
        jobsPage: data,
        currentPage: data.number
      });
    } catch (err: any) {
      this.setState({
        error: err.response?.data?.message || 'Failed to fetch jobs.'
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  handleDelete = async (jobId: number) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      this.setState({ isLoading: true });
      
      try {
        // Using mock service instead of real API
        await mockJobService.deleteJob(jobId);
        // Refresh the job list
        this.fetchJobs(this.state.currentPage);
      } catch (err: any) {
        this.setState({
          error: err.response?.data?.message || 'Failed to delete job.'
        });
      } finally {
        this.setState({ isLoading: false });
      }
    }
  };
  
  handlePageChange = (newPage: number) => {
    this.setState({ currentPage: newPage }, () => {
      this.fetchJobs(newPage);
    });
  };

  render() {
    const { jobsPage, isLoading, error, currentPage, redirectTo } = this.state;
    // Temporarily bypass authentication check
    // const { user } = this.context || {};

    if (redirectTo) {
      return <Navigate to={redirectTo} />;
    }

  // Temporarily bypass authentication check
  // if (!user) return null; // Should be handled by ProtectedRoute or useEffect redirect

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Job Postings</h1>
        <Link to="/employer/jobs/create">
          <Button variant="default">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Job
          </Button>
        </Link>
      </div>

      {isLoading && !jobsPage && <p className="text-center text-gray-600 dark:text-gray-400">Loading jobs...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      {!isLoading && jobsPage && jobsPage.content.length === 0 && (
        <p className="text-center text-gray-600 dark:text-gray-400">You haven't posted any jobs yet.</p>
      )}

      {jobsPage && jobsPage.content.length > 0 && (
        <div className="space-y-4">
          {jobsPage.content.map((job) => (
            <Card key={job.id} className="dark:bg-gray-800 border-0 shadow-md overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">{job.title}</CardTitle>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      job.isActive ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400' : 
                      'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400'
                    }`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{job.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span className="text-sm">{job.jobType}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="text-sm">Posted: {new Date(job.postedDate).toLocaleDateString('en-US', { 
                        month: 'numeric', day: 'numeric', year: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-3">
                  <p className="text-gray-700 dark:text-gray-300">{job.description || 'No description available.'}</p>
                  
                  {job.skillsRequired && job.skillsRequired.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-400">Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.skillsRequired.map(skill => (
                          <span key={skill} className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>
              <CardFooter className="flex justify-between items-center py-3 bg-gray-750 dark:bg-gray-850">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">30 days remaining</span>
                </div>
                <div className="flex gap-2">
                  <Link to={`/employer/jobs/applications/${job.id}`}> 
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Eye className="mr-1 h-4 w-4" /> View Apps
                      <span className="ml-1 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                        12
                      </span>
                    </Button>
                  </Link>
                  <Link to={`/employer/jobs/edit/${job.id}`}> 
                    <Button variant="outline" size="sm">
                      <Edit3 className="mr-1 h-4 w-4" /> Edit
                    </Button>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={() => this.handleDelete(job.id)} disabled={isLoading}>
                    <Trash2 className="mr-1 h-4 w-4" /> Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {jobsPage && jobsPage.totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <Button 
            variant="outline" 
              onClick={() => this.handlePageChange(currentPage - 1)} 
            disabled={currentPage === 0 || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage + 1} of {jobsPage.totalPages}
          </span>
          <Button 
            variant="outline" 
              onClick={() => this.handlePageChange(currentPage + 1)} 
            disabled={currentPage === jobsPage.totalPages - 1 || isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
  }
} 