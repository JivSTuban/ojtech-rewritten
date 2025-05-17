import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../providers/AuthProvider';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { Tabs } from '../components/ui/Tabs';
import { EmployerJobCard } from '../components/employer/jobs/EmployerJobCard';
import { EmployerBreadcrumb } from '../components/employer/EmployerBreadcrumb';
import { toast } from '../components/ui/toast-utils';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  description: string;
  requirements: string[];
  postedDate: string;
  updatedDate: string;
  status: 'active' | 'draft' | 'archived' | 'filled';
  applicationsCount: number;
  viewsCount: number;
}

interface EmployerJobsPageState {
  isLoading: boolean;
  jobs: Job[];
  error: string | null;
  filterStatus: string | null;
  searchTerm: string;
  isEmployerVerified: boolean;
}

export class EmployerJobsPage extends Component<{}, EmployerJobsPageState> {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  constructor(props: {}) {
    super(props);
    this.state = {
      isLoading: true,
      jobs: [],
      error: null,
      filterStatus: null,
      searchTerm: '',
      isEmployerVerified: false
    };
  }

  async componentDidMount() {
    // Check if user is authenticated
    if (!this.context.session) {
      toast({
        title: "Authentication Required",
        description: "Please login to view your job postings",
        variant: "destructive"
      });
      this.setState({ error: 'Authentication required' });
      return;
    }

    // Check if user has the employer role
    if (this.context.user?.user_metadata?.role !== 'employer') {
      toast({
        title: "Access Denied",
        description: "Only employer accounts can access this page",
        variant: "destructive"
      });
      this.setState({ error: 'Access denied' });
      return;
    }

    try {
      // Check if employer has completed onboarding
      const verificationResponse = await fetch('/api/employer/verification', {
        headers: {
          'Authorization': `Bearer ${this.context.session?.access_token}`
        }
      });
      
      if (!verificationResponse.ok) {
        // If error is 404, employer needs to complete onboarding
        if (verificationResponse.status === 404) {
          this.setState({
            isLoading: false,
            isEmployerVerified: false
          });
          return;
        }
        
        throw new Error('Failed to check employer verification status');
      }
      
      const verificationData = await verificationResponse.json();
      
      if (!verificationData.isVerified) {
        // Not verified, stay on page but show onboarding message
        this.setState({
          isLoading: false,
          isEmployerVerified: false
        });
        return;
      }
      
      // Employer is verified, fetch jobs
      this.setState({ isEmployerVerified: true });
      
      const jobsResponse = await fetch('/api/employer/jobs', {
        headers: {
          'Authorization': `Bearer ${this.context.session?.access_token}`
        }
      });
      
      if (!jobsResponse.ok) {
        throw new Error('Failed to fetch job postings');
      }
      
      const jobs = await jobsResponse.json();
      this.setState({
        isLoading: false,
        jobs
      });
    } catch (error) {
      console.error('Error fetching employer data:', error);
      this.setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load employer data'
      });
    }
  }

  handleStatusFilter = (status: string | null) => {
    this.setState({ filterStatus: status });
  };

  handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: e.target.value });
  };

  getFilteredJobs = () => {
    const { jobs, filterStatus, searchTerm } = this.state;
    
    return jobs.filter(job => {
      // Apply status filter
      if (filterStatus && job.status !== filterStatus) {
        return false;
      }
      
      // Apply search filter
      if (searchTerm && !job.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !job.company.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  render() {
    const { isLoading, error, isEmployerVerified } = this.state;
    
    if (error === 'Authentication required') {
      return <Navigate to="/auth/login" state={{ returnTo: '/employer/jobs' }} />;
    }
    
    if (error === 'Access denied') {
      return <Navigate to="/profile" />;
    }
    
    // If employer is not verified, redirect to onboarding
    if (!isLoading && !isEmployerVerified) {
      return (
        <div className="container mx-auto py-8 px-4">
          <EmployerBreadcrumb
            items={[
              { title: 'Dashboard', href: '/employer/dashboard' },
              { title: 'Jobs', href: '/employer/jobs' }
            ]}
          />
          
          <Card className="p-6 max-w-3xl mx-auto mt-6">
            <div className="text-center">
              <div className="rounded-full bg-gray-200 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-300 mb-2">Complete Your Employer Profile</h2>
              <p className="text-gray-600 mb-6">
                You need to complete your employer profile before you can post job listings.
                Set up your company information, contact details, and logo to get started.
              </p>
              <Button onClick={() => window.location.href = '/onboarding/employer'}>
                Complete Your Profile
              </Button>
            </div>
          </Card>
        </div>
      );
    }
    
    if (isLoading) {
      return (
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center min-h-[50vh]">
            <Spinner size="lg" />
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="container mx-auto py-8 px-4">
          <Card className="p-6 max-w-3xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Job Postings</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      );
    }
    
    const filteredJobs = this.getFilteredJobs();
    
    return (
      <div className="container mx-auto py-8 px-4">
        <EmployerBreadcrumb
          items={[
            { title: 'Dashboard', href: '/employer/dashboard' },
            { title: 'Jobs', href: '/employer/jobs' }
          ]}
        />
        
        <div className="flex flex-col gap-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Job Postings</h1>
              <p className="text-gray-600">Manage and track your job listings</p>
            </div>
            
            <Button onClick={() => window.location.href = '/employer/jobs/create'}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Post New Job
            </Button>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <Tabs className="w-full" defaultValue="all">
                <Tabs.List className="mb-4">
                  <Tabs.Trigger value="all" onClick={() => this.handleStatusFilter(null)}>
                    All Jobs
                  </Tabs.Trigger>
                  <Tabs.Trigger value="active" onClick={() => this.handleStatusFilter('active')}>
                    Active
                  </Tabs.Trigger>
                  <Tabs.Trigger value="draft" onClick={() => this.handleStatusFilter('draft')}>
                    Drafts
                  </Tabs.Trigger>
                  <Tabs.Trigger value="archived" onClick={() => this.handleStatusFilter('archived')}>
                    Archived
                  </Tabs.Trigger>
                  <Tabs.Trigger value="filled" onClick={() => this.handleStatusFilter('filled')}>
                    Filled
                  </Tabs.Trigger>
                </Tabs.List>
                
                <div className="w-full mb-6">
                  <input
                    type="text"
                    placeholder="Search by title or location..."
                    className="w-full p-2 border rounded-md"
                    onChange={this.handleSearch}
                  />
                </div>
                
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="rounded-full bg-gray-100 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-1">No job postings found</h3>
                    <p className="text-gray-500 mb-4">
                      {this.state.jobs.length === 0
                        ? "You haven't created any job postings yet."
                        : "No jobs match your current filters."}
                    </p>
                    {this.state.jobs.length === 0 && (
                      <Button onClick={() => window.location.href = '/employer/jobs/create'}>
                        Create Your First Job Posting
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredJobs.map(job => (
                      <EmployerJobCard
                        key={job.id}
                        id={job.id}
                        title={job.title}
                        location={job.location}
                        jobType={job.jobType}
                        postedDate={this.formatDate(job.postedDate)}
                        status={job.status}
                        applicationsCount={job.applicationsCount}
                        viewsCount={job.viewsCount}
                        onEdit={() => window.location.href = `/employer/jobs/${job.id}/edit`}
                        onViewApplications={() => window.location.href = `/employer/jobs/${job.id}/applications`}
                      />
                    ))}
                  </div>
                )}
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    );
  }
} 