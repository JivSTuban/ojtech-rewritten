import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/toast-utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { PlusCircle, Edit3, Trash2, Eye, MapPin, Briefcase, Calendar, Clock, X } from 'lucide-react';
import jobService from '@/lib/api/jobService';
import AlertDialog from '@/components/ui/AlertDialog';

// Define interfaces for the Job data structure from backend
interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  requiredSkills: string;
  employmentType: string;
  minSalary: number;
  maxSalary: number;
  currency: string;
  postedAt: string;
  active: boolean;
  applications: JobApplication[];
}

interface JobApplication {
  id: string;
  coverLetter: string;
  status: string;
  appliedAt: string;
  lastUpdatedAt: string;
  active: boolean;
}

interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

interface EmployerJobsPageState {
  jobsPage: Page<Job> | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  redirectTo: string | null;
  showDeleteAlert: boolean;
  jobToDelete: string | null;
}


export class EmployerJobsPage extends Component<{}, EmployerJobsPageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  constructor(props: {}) {
    super(props);
    this.state = {
      jobsPage: {
        content: [],
        pageable: {
          pageNumber: 0,
          pageSize: 5,
          sort: {
            empty: true,
            sorted: false,
            unsorted: true,
          },
          offset: 0,
          paged: true,
          unpaged: false,
        },
        last: true,
        totalPages: 0,
        totalElements: 0,
        first: true,
        size: 5,
        number: 0,
        sort: {
          empty: true,
          sorted: false,
          unsorted: true,
        },
        numberOfElements: 0,
        empty: true,
      },
      isLoading: true,
      error: null,
      currentPage: 0,
      redirectTo: null,
      showDeleteAlert: false,
      jobToDelete: null
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
      const data = await jobService.getEmployerJobs(page, 5);
      // Convert array response to Page<Job> format
      const pageData: Page<Job> = {
        content: Array.isArray(data) ? data : [],
        pageable: {
          pageNumber: page,
          pageSize: 5,
          sort: {
            empty: true,
            sorted: false,
            unsorted: true,
          },
          offset: page * 5,
          paged: true,
          unpaged: false,
        },
        last: true,
        totalPages: 1,
        totalElements: Array.isArray(data) ? data.length : 0,
        first: page === 0,
        size: 5,
        number: page,
        sort: {
          empty: true,
          sorted: false,
          unsorted: true,
        },
        numberOfElements: Array.isArray(data) ? data.length : 0,
        empty: Array.isArray(data) ? data.length === 0 : true,
      };
      
      this.setState({
        jobsPage: pageData,
        currentPage: page
      });
    } catch (err: any) {
      this.setState({
        error: err.message || 'Failed to fetch jobs.'
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  handleDelete = (jobId: string) => {
    this.setState({
      showDeleteAlert: true,
      jobToDelete: jobId
    });
  };

  confirmDelete = async () => {
    const { jobToDelete } = this.state;
    if (!jobToDelete) return;

    this.setState({ isLoading: true, showDeleteAlert: false });
    
    try {
      await jobService.deleteJob(jobToDelete);
      // Refresh the job list
      this.fetchJobs(this.state.currentPage);
      toast.success({
        title: "Success",
        description: "Job posting deleted successfully"
      });
    } catch (err: any) {
      toast.destructive({
        title: "Error",
        description: "Failed to delete job posting"
      });
      this.setState({
        error: err.message || 'Failed to delete job.'
      });
    } finally {
      this.setState({ isLoading: false, jobToDelete: null });
    }
  };

  cancelDelete = () => {
    this.setState({
      showDeleteAlert: false,
      jobToDelete: null
    });
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

    if (!user) {
      return <Navigate to="/login" />;
    }

    return (
      <>
        <AlertDialog
          open={this.state.showDeleteAlert}
          onOpenChange={() => this.setState({ showDeleteAlert: false, jobToDelete: null })}
          title="Are you sure?"
          description="You want to stop accepting applications?."
          cancelText="Cancel"
          confirmText="Confirm"
          onCancel={this.cancelDelete}
          onConfirm={this.confirmDelete}
        />

    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Job Postings</h1>
        <Link to="/employer/jobs/create">
          <Button variant="default">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Job
          </Button>
        </Link>
      </div>

      {isLoading && <p className="text-center text-gray-600 dark:text-gray-400">Loading jobs...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      {!isLoading && jobsPage?.content?.length === 0 && (
        <p className="text-center text-gray-600 dark:text-gray-400">You haven't posted any jobs yet.</p>
      )}

      {jobsPage && jobsPage.content?.length > 0 && (
        <div className="space-y-4">
          {jobsPage?.content?.map((job) => (
            <Card key={job.id} className="dark:bg-gray-800 border-0 shadow-md overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">{job.title}</CardTitle>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      job.active ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400' : 
                      'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400'
                    }`}>
                      {job.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{job.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span className="text-sm">{job.employmentType}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="text-sm">Posted: {new Date(job.postedAt).toLocaleDateString('en-US', { 
                        month: 'numeric', day: 'numeric', year: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-3">
                  <p className="text-gray-700 dark:text-gray-300">{job.description || 'No description available.'}</p>
                  
                  {job.requiredSkills && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-400">Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.split(',').map((skill: string) => (
                          <span key={skill.trim()} className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>
              <CardFooter className="flex justify-between items-center py-3 bg-gray-750 dark:bg-gray-850">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  
                  <span className="text-sm"></span>
                </div>
                <div className="flex gap-2">
                  <Link to={`/employer/jobs/applications/${job.id}`}> 
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Eye className="mr-1 h-4 w-4" /> View Apps
                      <span className="ml-1 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                        {job.applications?.length || 0}
                      </span>
                    </Button>
                  </Link>
                  <Link to={`/employer/jobs/edit/${job.id}`}> 
                    <Button variant="outline" size="sm">
                      <Edit3 className="mr-1 h-4 w-4" /> Edit
                    </Button>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={() => this.handleDelete(job.id)} disabled={isLoading}>
                    <X className="mr-1 h-4 w-4" /> Close
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
      </>
    );
  }
}
