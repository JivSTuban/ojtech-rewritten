import React, { Component } from 'react';
import jobService from '@/lib/api/jobService';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button'; // Assuming you have a Button component
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'; // Assuming Card components
import { PlusCircle, Edit3, Trash2, Eye } from 'lucide-react'; // Icons

// Define an interface for the Job data structure from backend
interface Job {
  id: number;
  title: string;
  location: string;
  jobType: string;
  isActive: boolean;
  postedDate: string; // Assuming ISO string date
  // Add other relevant fields you want to display
  skillsRequired?: string[];
  description?: string; // For a brief view or on hover
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
    const { user } = this.context || {};
    
    if (!user || !user.roles.includes('ROLE_EMPLOYER')) {
      this.setState({ redirectTo: '/login' });
        return;
    }
    
    this.setState({ isLoading: true, error: null });
    
    try {
      const data = await jobService.getEmployerJobs(page, 5); // 5 jobs per page
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
        await jobService.deleteJob(jobId);
        // Refresh the job list
        this.fetchJobs(this.state.currentPage);
        // Could also filter out the job from current state for faster UI update
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
    const { user } = this.context || {};

    if (redirectTo) {
      return <Navigate to={redirectTo} />;
    }

  if (!user) return null; // Should be handled by ProtectedRoute or useEffect redirect

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
            <Card key={job.id} className="dark:bg-gray-800">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl text-gray-900 dark:text-white">{job.title}</CardTitle>
                        <CardDescription className="dark:text-gray-400">{job.location} - {job.jobType}</CardDescription>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${job.isActive ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200'}`}>
                        {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{job.description || 'No description available.'}</p>
                {job.skillsRequired && job.skillsRequired.length > 0 && (
                    <div className="mt-2">
                        <h4 className="text-xs font-semibold dark:text-gray-400">Skills:</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {job.skillsRequired.map(skill => (
                                <span key={skill} className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">{skill}</span>
                            ))}
                        </div>
                    </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Posted: {new Date(job.postedDate).toLocaleDateString()}</p>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Link to={`/employer/jobs/applications/${job.id}`}> 
                  <Button variant="outline" size="sm">
                    <Eye className="mr-1 h-4 w-4" /> View Apps
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