import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/toast-utils';
import { Card, CardContent } from '@/components/ui/Card';
import { PlusCircle, Edit3, MapPin, X, Mail, Phone, Globe, Users, Building2, Search, CheckCircle, RotateCcw } from 'lucide-react';
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
  companyName?: string;
  employer?: {
    companyName?: string;
  };
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

interface NLOJobsPageState {
  jobsPage: Page<Job> | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  redirectTo: string | null;
  showDeleteAlert: boolean;
  jobToDelete: string | null;
  activeTab: 'active' | 'inactive';
  filters: {
    status: 'ALL' | 'ACTIVE' | 'INACTIVE';
    searchTerm: string;
    sortBy: 'postedAt' | 'title';
    sortDirection: 'asc' | 'desc';
  };
}


export class NLOJobsPage extends Component<{}, NLOJobsPageState> {
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
      jobToDelete: null,
      activeTab: 'active',
      filters: {
        status: 'ACTIVE',
        searchTerm: '',
        sortBy: 'postedAt',
        sortDirection: 'desc'
      }
    };
  }

  componentDidMount() {
    this.fetchJobsByTab(this.state.currentPage);
  }

  fetchJobsByTab = async (page: number) => {
    if (this.state.activeTab === 'active') {
      this.fetchActiveJobs(page);
    } else {
      this.fetchInactiveJobs(page);
    }
  };

  fetchActiveJobs = async (page: number) => {
    const { user } = this.context || {};

    if (!user || !user.roles.includes('ROLE_NLO')) {
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
        error: err.message || 'Failed to fetch active jobs.',
        isLoading: false
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  fetchInactiveJobs = async (page: number) => {
    const { user } = this.context || {};

    if (!user || !user.roles.includes('ROLE_NLO')) {
      this.setState({ redirectTo: '/login' });
      return;
    }

    this.setState({ isLoading: true, error: null });

    try {
      const data = await jobService.getEmployerInactiveJobs(page, 5);
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
    if (!this.state.jobToDelete) return;

    this.setState({ isLoading: true });

    try {
      await jobService.deleteJob(this.state.jobToDelete);
      // Refresh the job list
      this.fetchJobsByTab(this.state.currentPage);
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

  handleReactivate = async (jobId: string) => {
    this.setState({ isLoading: true });

    try {
      await jobService.reactivateJob(jobId);
      // Refresh the job list
      this.fetchJobsByTab(this.state.currentPage);
      toast.success({
        title: "Success",
        description: "Job posting reactivated successfully"
      });
    } catch (err: any) {
      toast.destructive({
        title: "Error",
        description: "Failed to reactivate job posting"
      });
      this.setState({
        error: err.message || 'Failed to reactivate job.'
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  handlePageChange = (newPage: number) => {
    this.setState({ currentPage: newPage }, () => {
      this.fetchJobsByTab(newPage);
    });
  };

  handleFilterChange = (filterType: keyof NLOJobsPageState['filters'], value: any) => {
    this.setState(prevState => ({
      filters: {
        ...prevState.filters,
        [filterType]: value
      }
    }));
  };

  handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.handleFilterChange('searchTerm', e.target.value);
  };

  handleStatusFilterChange = (status: 'ALL' | 'ACTIVE' | 'INACTIVE') => {
    this.handleFilterChange('status', status);
  };

  handleSortChange = (sortBy: 'postedAt' | 'title') => {
    this.setState(prevState => ({
      filters: {
        ...prevState.filters,
        sortBy,
        sortDirection: prevState.filters.sortBy === sortBy && prevState.filters.sortDirection === 'desc' ? 'asc' : 'desc'
      }
    }));
  };

  handleResetFilters = () => {
    this.setState({
      filters: {
        status: 'ACTIVE',
        searchTerm: '',
        sortBy: 'postedAt',
        sortDirection: 'desc'
      }
    });
  };

  getFilteredJobs = () => {
    const { jobsPage } = this.state;
    if (!jobsPage || !jobsPage.content) return [];

    const { searchTerm, sortBy, sortDirection } = this.state.filters;

    // Filter by search term only (status filtering is now done by separate API endpoints)
    let filtered = jobsPage.content.filter(job => {
      // Filter by search term
      if (searchTerm && !this.matchesSearchTerm(job, searchTerm)) {
        return false;
      }

      return true;
    });

    // Then sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'postedAt':
          comparison = new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  matchesSearchTerm = (job: Job, searchTerm: string) => {
    const term = searchTerm.toLowerCase();
    const companyName = this.getCompanyName(job);
    return (
      job.title.toLowerCase().includes(term) ||
      companyName.toLowerCase().includes(term) ||
      job.description?.toLowerCase().includes(term) ||
      job.location?.toLowerCase().includes(term) ||
      job.requiredSkills?.toLowerCase().includes(term) ||
      job.employmentType?.toLowerCase().includes(term)
    );
  };

  getCompanyName = (job: Job): string => {
    return job.companyName || job.employer?.companyName || 'Unknown Company';
  };

  getFilteredJobsByTab = () => {
    // Since we now fetch active/inactive jobs separately, just return filtered jobs
    return this.getFilteredJobs();
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

        <div className="min-h-screen bg-gray-950 text-white">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-semibold">NLO Jobs</h1>
              <Link to="/nlo/jobs/create">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create New Job
                </Button>
              </Link>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-2 border-b border-gray-800">
              <button
                onClick={() => {
                  this.setState({ activeTab: 'active', currentPage: 0 }, () => {
                    this.fetchActiveJobs(0);
                  });
                }}
                className={`px-4 py-2 font-medium transition-colors ${this.state.activeTab === 'active'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                <CheckCircle className="inline-block mr-2 h-4 w-4" />
                Active Jobs
              </button>
              <button
                onClick={() => {
                  this.setState({ activeTab: 'inactive', currentPage: 0 }, () => {
                    this.fetchInactiveJobs(0);
                  });
                }}
                className={`px-4 py-2 font-medium transition-colors ${this.state.activeTab === 'inactive'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                <X className="inline-block mr-2 h-4 w-4" />
                Inactive Jobs
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by company name, job title, location..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                  value={this.state.filters.searchTerm}
                  onChange={this.handleSearchChange}
                />
              </div>
            </div>

            {isLoading && <p className="text-center text-gray-400 py-12">Loading jobs...</p>}
            {error && <p className="text-center text-red-400 py-12">Error: {error}</p>}

            {!isLoading && jobsPage?.content?.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">You haven't posted any jobs yet.</p>
                <Link to="/nlo/jobs/create">
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Job
                  </Button>
                </Link>
              </div>
            )}

            {jobsPage && jobsPage.content?.length > 0 && this.getFilteredJobsByTab().length === 0 && (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  {this.state.activeTab === 'active'
                    ? 'No active jobs found.'
                    : 'No inactive jobs found.'}
                </p>
                {this.state.filters.searchTerm && (
                  <Button
                    variant="outline"
                    className="mt-4 border-gray-700 hover:bg-gray-800"
                    onClick={this.handleResetFilters}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}

            {/* Jobs Grid */}
            {jobsPage && jobsPage.content?.length > 0 && this.getFilteredJobsByTab().length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {this.getFilteredJobsByTab().map((job: Job) => {
                  const companyName = this.getCompanyName(job);
                  const companyInitials = companyName.substring(0, 2).toUpperCase();
                  const hrEmail = job.hrEmail;
                  const hrPhone = job.hrPhone;

                  return (
                    <Link key={job.id} to={`/nlo/jobs/${job.id}`} className="block">
                      <Card className="bg-gray-900 border-gray-800 hover:border-gray-600 hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
                        <CardContent className="p-6">
                          {/* Header with Logo and Actions */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {/* Company Logo/Avatar */}
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                {companyInitials}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-white text-base truncate">{job.title}</h3>
                                <p className="text-sm text-gray-400 truncate">{companyName}</p>
                                {job.active ? (
                                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-400 rounded mt-1">
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-500/20 text-gray-400 rounded mt-1">
                                    Inactive
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Action Icons */}
                            <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.preventDefault()}>
                              <Link to={`/nlo/jobs/edit/${job.id}`}>
                                <button className="p-1.5 hover:bg-gray-800 rounded transition-colors">
                                  <Edit3 className="h-4 w-4 text-gray-400 hover:text-white" />
                                </button>
                              </Link>
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Mail className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{hrEmail}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Phone className="h-4 w-4 flex-shrink-0" />
                              <span>{hrPhone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{job.location}</span>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 rounded text-xs text-gray-300">
                              <Globe className="h-3 w-3" />
                              <span>Website</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 rounded text-xs text-gray-300">
                              <Users className="h-3 w-3" />
                              <span>{job.employmentType}</span>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                            {job.description || 'No description available.'}
                          </p>

                          {/* Footer Actions */}
                          <div className="flex gap-2 pt-4 border-t border-gray-800" onClick={(e) => e.preventDefault()}>
                            {job.active ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  this.handleDelete(job.id);
                                }}
                                disabled={isLoading}
                                className="w-full bg-red-600 hover:bg-red-700"
                              >
                                <X className="mr-1.5 h-3.5 w-3.5" /> Deactivate
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  this.handleReactivate(job.id);
                                }}
                                disabled={isLoading}
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reactivate
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {jobsPage && jobsPage.totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => this.handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0 || isLoading}
                  className="border-gray-700 hover:bg-gray-800"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-400 px-4">
                  Page {currentPage + 1} of {jobsPage.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => this.handlePageChange(currentPage + 1)}
                  disabled={currentPage === jobsPage.totalPages - 1 || isLoading}
                  className="border-gray-700 hover:bg-gray-800"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
}
