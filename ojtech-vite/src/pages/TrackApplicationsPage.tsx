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
  coverLetter: string;
  studentSkills: string;
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
  declare context: React.ContextType<typeof AuthContext>;

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
    const user = this.context?.user;
    // Comment out the authentication check to always load mock data
    /*if (!user) {
      this.setState({ 
        // error: 'Authentication required', // Commented out as requested
        isLoading: false
      });
      return;
    }*/

    try {
      // TEMPORARY: Using mock data until backend is ready
      // TODO: Replace with actual API call when backend is implemented
      const mockApplications: Application[] = [
        {
          id: '1',
          jobId: 'job-1',
          jobTitle: 'Frontend Developer',
          companyName: 'TechCorp',
          companyLogo: 'TC',
          appliedDate: new Date().toISOString(),
          status: 'pending',
          lastUpdated: new Date().toISOString(),
          coverLetter: "I am excited to apply for the Frontend Developer position at TechCorp. With my experience in React and TypeScript, I believe I would be a great fit for your team.",
          studentSkills: "React, TypeScript, CSS, HTML, JavaScript"
        },
        {
          id: '2',
          jobId: 'job-2',
          jobTitle: 'UX Designer',
          companyName: 'DesignStudio',
          companyLogo: 'DS',
          appliedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'interview',
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          coverLetter: "As a passionate UX Designer with experience in creating user-centered designs, I am applying for the position at DesignStudio. My portfolio demonstrates my ability to solve complex design problems.",
          studentSkills: "Figma, Adobe XD, User Research, Prototyping, UI Design"
        },
        {
          id: '3',
          jobId: 'job-3',
          jobTitle: 'Backend Developer',
          companyName: 'ServerTech',
          companyLogo: 'ST',
          appliedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'rejected',
          lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          coverLetter: "I am writing to express my interest in the Backend Developer position at ServerTech. With my strong background in Node.js and database design, I am confident in my ability to contribute to your team.",
          studentSkills: "Node.js, Express, MongoDB, SQL, API Development"
        },
        {
          id: '4',
          jobId: 'job-4',
          jobTitle: 'Full Stack Engineer',
          companyName: 'WebSolutions',
          companyLogo: 'WS',
          appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'accepted',
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          coverLetter: "I am thrilled to apply for the Full Stack Engineer position at WebSolutions. My experience with both frontend and backend technologies makes me well-suited for this role, and I am eager to contribute to your innovative projects.",
          studentSkills: "JavaScript, React, Node.js, Python, AWS, Docker"
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

  getInitialBgColor = (initial: string) => {
    switch (initial) {
      case 'TC':
        return 'bg-green-100 text-green-800';
      case 'DS':
        return 'bg-purple-100 text-purple-800';
      case 'ST':
        return 'bg-red-100 text-red-800';
      case 'WS':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
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
        className={`px-4 py-2 text-sm font-medium ${
          isActive 
            ? 'bg-gray-800 text-white' 
            : 'text-gray-300 hover:text-white'
        }`}
        onClick={() => this.handleStatusFilter(value)}
      >
        {label}
      </button>
    );
  };

  render() {
    const { isLoading, error, view } = this.state;
    
    // If not authenticated, redirect to login
    const user = this.context?.user;
    // Commented out to use mock data without authentication
    /*if (!user) {
      return <Navigate to="/login" state={{ returnTo: '/track' }} />;
    }*/
    
    if (isLoading) {
      return (
        <div className="container mx-auto py-8 px-4 bg-black text-white">
          <div className="flex justify-center items-center min-h-[50vh]">
            <Spinner size="lg" />
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="container mx-auto py-8 px-4 bg-black text-white">
          <Card className="p-6 max-w-3xl mx-auto bg-gray-900 border-gray-800">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-500 mb-2">Error Loading Applications</h2>
              <p className="text-gray-400 mb-4">{error}</p>
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
              <p className="text-gray-400">Track and manage your job applications</p>
            </div>
            
            <div className="flex bg-gray-900 rounded">
              <Button 
                variant={view === 'grid' ? 'default' : 'outline'} 
                onClick={() => this.handleViewChange('grid')}
                className={view === 'grid' ? 'bg-gray-700' : 'bg-transparent'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Grid
              </Button>
              <Button 
                variant={view === 'list' ? 'default' : 'outline'} 
                onClick={() => this.handleViewChange('list')}
                className={view === 'list' ? 'bg-gray-700' : 'bg-transparent'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                List
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-start w-full">
            <div className="w-full">
              <div className="flex bg-gray-900 rounded mb-4 overflow-hidden">
                {this.renderFilterButton("All", null)}
                {this.renderFilterButton("Pending", "pending")}
                {this.renderFilterButton("Interview", "interview")}
                {this.renderFilterButton("Accepted", "accepted")}
                {this.renderFilterButton("Rejected", "rejected")}
              </div>
              
              <div className="w-full mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by company or position..."
                    className="w-full p-3 pr-10 bg-gray-900 border-none rounded-md text-white placeholder-gray-500"
                    onChange={this.handleSearch}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {filteredApplications.length === 0 ? (
                <div className="text-center py-8 bg-gray-900 rounded-md p-6">
                  <div className="rounded-full bg-gray-800 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-1 text-white">No applications found</h3>
                  <p className="text-gray-400 mb-4">
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
                    <Card key={application.id} className="bg-gray-900 border-gray-800 p-0 overflow-hidden">
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className={`w-12 h-12 flex items-center justify-center rounded-md ${this.getInitialBgColor(application.companyLogo)}`}>
                            <span className="text-lg font-bold">{application.companyLogo}</span>
                          </div>
                          <Badge variant={application.status === 'accepted' ? 'default' : 
                                         application.status === 'rejected' ? 'destructive' : 
                                         application.status === 'interview' ? 'secondary' : 'outline'} 
                                 className={`capitalize ${
                                   application.status === 'accepted' ? 'bg-green-500' : 
                                   application.status === 'rejected' ? 'bg-red-500' : 
                                   application.status === 'interview' ? 'bg-purple-500' : 
                                   'bg-yellow-500 text-yellow-900'
                                 }`}>
                            {application.status}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold mb-1">{application.jobTitle}</h3>
                        <p className="text-gray-400 mb-3">{application.companyName}</p>
                        
                        <div className="space-y-1 text-sm text-gray-400 mb-3">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Applied: {this.formatDate(application.appliedDate).replace(', ', ' ')}
                          </div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Updated: {this.formatDate(application.lastUpdated).replace(', ', ' ')}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-300 mb-1">Skills</div>
                          <div className="flex flex-wrap gap-1">
                            {application.studentSkills.split(',').map((skill, index) => (
                              <span key={index} className="px-2 py-1 text-xs bg-gray-800 rounded-full">
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-300 mb-1">Cover Letter</div>
                          <p className="text-sm text-gray-400 line-clamp-3">{application.coverLetter}</p>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-800 p-4">
                        <button 
                          onClick={() => window.location.href = `/opportunities/${application.jobId}`}
                          className="flex items-center justify-between w-full text-green-400 hover:text-green-300 transition"
                        >
                          <span>View Job Details</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto bg-gray-900 rounded-md">
                  <Table className="w-full">
                    <thead className="border-b border-gray-800">
                      <tr>
                        <th className="text-left py-3 px-4">Position</th>
                        <th className="text-left py-3 px-4">Company</th>
                        <th className="text-left py-3 px-4">Applied Date</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Skills</th>
                        <th className="text-left py-3 px-4">Last Updated</th>
                        <th className="text-left py-3 px-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.map(application => (
                        <tr key={application.id} className="border-b border-gray-800">
                          <td className="py-3 px-4 font-medium">{application.jobTitle}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 flex items-center justify-center rounded ${this.getInitialBgColor(application.companyLogo)}`}>
                                <span className="text-sm font-bold">{application.companyLogo}</span>
                              </div>
                              {application.companyName}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-400">{this.formatDate(application.appliedDate)}</td>
                          <td className="py-3 px-4">
                            <Badge variant={application.status === 'accepted' ? 'default' : 
                                         application.status === 'rejected' ? 'destructive' : 
                                         application.status === 'interview' ? 'secondary' : 'outline'} 
                                 className={`capitalize ${
                                   application.status === 'accepted' ? 'bg-green-500' : 
                                   application.status === 'rejected' ? 'bg-red-500' : 
                                   application.status === 'interview' ? 'bg-purple-500' : 
                                   'bg-yellow-500 text-yellow-900'
                                 }`}>
                              {application.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {application.studentSkills.split(',').slice(0, 3).map((skill, index) => (
                                <span key={index} className="px-2 py-1 text-xs bg-gray-800 rounded-full">
                                  {skill.trim()}
                                </span>
                              ))}
                              {application.studentSkills.split(',').length > 3 && (
                                <span className="px-2 py-1 text-xs bg-gray-800 rounded-full">
                                  +{application.studentSkills.split(',').length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-400">{this.formatDate(application.lastUpdated)}</td>
                          <td className="py-3 px-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.location.href = `/opportunities/${application.jobId}`}
                              className="text-green-400 hover:text-green-300"
                            >
                              View Job
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
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