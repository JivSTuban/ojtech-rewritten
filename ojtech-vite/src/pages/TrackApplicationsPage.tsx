import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../providers/AuthProvider';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { ApplicationCard } from '../components/ui/ApplicationCard';
import { toast } from '../components/ui/toast-utils';

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogo: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'interview' | 'rejected' | 'accepted';
  lastUpdated: string;
}

interface TrackApplicationsPageState {
  isLoading: boolean;
  applications: Application[];
  error: string | null;
  view: 'grid' | 'list';
  filterStatus: string | null;
  searchTerm: string;
}

export class TrackApplicationsPage extends Component<{}, TrackApplicationsPageState> {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  constructor(props: {}) {
    super(props);
    this.state = {
      isLoading: true,
      applications: [],
      error: null,
      view: 'grid',
      filterStatus: null,
      searchTerm: ''
    };
  }

  async componentDidMount() {
    // Check if user is authenticated
    if (!this.context.isAuthenticated) {
      // Don't call toast in componentDidMount to avoid infinite updates
      this.setState({ 
        error: 'Authentication required',
        isLoading: false
      });
      return;
    }

    try {
      // Since this is just mock data for now, we don't need to make an actual fetch
      // Mock data for applications until backend is ready
      const mockApplications: Application[] = [
        {
          id: '1',
          jobId: 'job-1',
          jobTitle: 'Frontend Developer',
          companyName: 'TechCorp',
          companyLogo: 'https://via.placeholder.com/40',
          appliedDate: new Date().toISOString(),
          status: 'pending',
          lastUpdated: new Date().toISOString()
        },
        {
          id: '2',
          jobId: 'job-2',
          jobTitle: 'UX Designer',
          companyName: 'DesignStudio',
          companyLogo: 'https://via.placeholder.com/40',
          appliedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'interview',
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          jobId: 'job-3',
          jobTitle: 'Backend Developer',
          companyName: 'ServerTech',
          companyLogo: 'https://via.placeholder.com/40',
          appliedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'rejected',
          lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      this.setState({
        isLoading: false,
        applications: mockApplications
      });

      // Optional: Once real API is available, you can uncomment this code
      /*
      const response = await fetch('/api/job-applications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      
      const applications = await response.json();
      this.setState({
        isLoading: false,
        applications: applications
      });
      */
    } catch (error) {
      console.error('Error fetching applications:', error);
      this.setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load applications'
      });
    }
  }

  handleViewChange = (view: 'grid' | 'list') => {
    this.setState({ view });
  };

  handleStatusFilter = (status: string | null) => {
    this.setState({ filterStatus: status });
  };

  handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: e.target.value });
  };

  getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'reviewed':
        return 'gray';
      case 'interview':
        return 'purple';
      case 'rejected':
        return 'red';
      case 'accepted':
        return 'green';
      default:
        return 'gray';
    }
  };

  formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  getFilteredApplications = () => {
    const { applications, filterStatus, searchTerm } = this.state;
    
    return applications.filter(app => {
      // Apply status filter
      if (filterStatus && app.status !== filterStatus) {
        return false;
      }
      
      // Apply search filter
      if (searchTerm && !app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !app.companyName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  renderFilterButton = (label: string, value: string | null) => {
    const { filterStatus } = this.state;
    const isActive = filterStatus === value || (value === null && filterStatus === null);
    
    return (
      <button
        className={`px-3 py-1.5 text-sm font-medium rounded-sm ${
          isActive 
            ? 'bg-background text-foreground shadow-sm' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        onClick={() => this.handleStatusFilter(value)}
      >
        {label}
      </button>
    );
  };

  render() {
    const { isLoading, error, view } = this.state;
    
    if (error === 'Authentication required') {
      return <Navigate to="/auth/login" state={{ returnTo: '/track' }} />;
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
              <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Applications</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      );
    }
    
    const filteredApplications = this.getFilteredApplications();
    
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Applications</h1>
              <p className="text-gray-600">Track and manage your job applications</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={view === 'grid' ? 'default' : 'outline'} 
                onClick={() => this.handleViewChange('grid')}
                size="sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Grid
              </Button>
              <Button 
                variant={view === 'list' ? 'default' : 'outline'} 
                onClick={() => this.handleViewChange('list')}
                size="sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                List
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1">
              <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground mb-4">
                {this.renderFilterButton("All", null)}
                {this.renderFilterButton("Pending", "pending")}
                {this.renderFilterButton("Interview", "interview")}
                {this.renderFilterButton("Accepted", "accepted")}
                {this.renderFilterButton("Rejected", "rejected")}
              </div>
              
              <div className="w-full mb-6">
                <input
                  type="text"
                  placeholder="Search by company or position..."
                  className="w-full p-2 border rounded-md"
                  onChange={this.handleSearch}
                />
              </div>
              
              {filteredApplications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="rounded-full bg-gray-100 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-1">No applications found</h3>
                  <p className="text-gray-500 mb-4">
                    {this.state.applications.length === 0
                      ? "You haven't applied for any jobs yet."
                      : "No applications match your current filters."}
                  </p>
                  {this.state.applications.length === 0 && (
                    <Button onClick={() => window.location.href = '/opportunities'}>
                      Browse Opportunities
                    </Button>
                  )}
                </div>
              ) : view === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredApplications.map(application => (
                    <ApplicationCard
                      key={application.id}
                      id={application.id}
                      jobTitle={application.jobTitle}
                      companyName={application.companyName}
                      companyLogo={application.companyLogo}
                      appliedDate={this.formatDate(application.appliedDate)}
                      status={application.status}
                      lastUpdated={this.formatDate(application.lastUpdated)}
                      onViewDetails={() => window.location.href = `/opportunities/${application.jobId}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.Head>Position</Table.Head>
                        <Table.Head>Company</Table.Head>
                        <Table.Head>Applied Date</Table.Head>
                        <Table.Head>Status</Table.Head>
                        <Table.Head>Last Updated</Table.Head>
                        <Table.Head></Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {filteredApplications.map(application => (
                        <Table.Row key={application.id}>
                          <Table.Cell className="font-medium">{application.jobTitle}</Table.Cell>
                          <Table.Cell>
                            <div className="flex items-center gap-2">
                              {application.companyLogo && (
                                <img
                                  src={application.companyLogo}
                                  alt={application.companyName}
                                  className="w-6 h-6 rounded-full object-contain"
                                />
                              )}
                              {application.companyName}
                            </div>
                          </Table.Cell>
                          <Table.Cell>{this.formatDate(application.appliedDate)}</Table.Cell>
                          <Table.Cell>
                            <Badge variant={this.getStatusColor(application.status) as any}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>{this.formatDate(application.lastUpdated)}</Table.Cell>
                          <Table.Cell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.location.href = `/opportunities/${application.jobId}`}
                            >
                              View Job
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
} 