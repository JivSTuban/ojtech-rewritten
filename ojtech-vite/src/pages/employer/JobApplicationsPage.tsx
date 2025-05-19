import React, { Component } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table";
import { Skeleton } from "../../components/ui/Skeleton";
import { FileText, Download, Eye, Mail, CheckCircle, XCircle } from "lucide-react";
import { Navigate, useParams, Link } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";
import apiClient from "../../lib/api/apiClient";

interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  resumeUrl: string;
  coverLetter: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  dateApplied: string;
  matchPercentage: number;
}

interface ApplicationsPageState {
  applications: Application[];
  job: {
    id: string;
    title: string;
    company: string;
  } | null;
  loading: boolean;
  error: string | null;
}

interface JobApplicationsPageProps {
  jobId: string;
}

class JobApplicationsPageClass extends Component<JobApplicationsPageProps, ApplicationsPageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;
  
  constructor(props: JobApplicationsPageProps) {
    super(props);
    this.state = {
      applications: [],
      job: null,
      loading: true,
      error: null,
    };
  }
  
  componentDidMount() {
    this.fetchApplications();
  }
  
  async fetchApplications() {
    const { jobId } = this.props;
    
    try {
      // Fetch job details first
      const jobResponse = await apiClient.get(`/api/employer/jobs/${jobId}`);
      
      // Fetch applications for this job
      const applicationsResponse = await apiClient.get(`/api/employer/jobs/${jobId}/applications`);
      
      this.setState({
        job: jobResponse.data,
        applications: applicationsResponse.data,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching applications:", error);
      this.setState({ 
        loading: false,
        error: typeof error === 'string' ? error : "Failed to load applications" 
      });
    }
  }
  
  handleUpdateStatus = async (applicationId: string, newStatus: 'reviewed' | 'accepted' | 'rejected') => {
    try {
      await apiClient.put(`/api/employer/applications/${applicationId}/status`, { status: newStatus });
      
      // Update the local state
      this.setState(prevState => ({
        applications: prevState.applications.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      }));
    } catch (error) {
      console.error(`Error updating application status to ${newStatus}:`, error);
    }
  }
  
  getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">Pending</span>;
      case 'reviewed':
        return <span className="px-2 py-1 rounded-full bg-gray-200 text-gray-800 text-xs font-medium">Reviewed</span>;
      case 'accepted':
        return <span className="px-2 py-1 rounded-full bg-gray-300 text-gray-900 text-xs font-medium">Accepted</span>;
      case 'rejected':
        return <span className="px-2 py-1 rounded-full bg-gray-400 text-gray-900 text-xs font-medium">Rejected</span>;
      default:
        return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">{status}</span>;
    }
  }
  
  render() {
    const { user } = this.context || {};
    const { applications, job, loading, error } = this.state;
    
    // Redirect if not logged in
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    // Redirect if not an employer
    if (!user.roles?.includes('ROLE_EMPLOYER')) {
      return <Navigate to="/" />;
    }
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            {loading ? (
              <Skeleton className="h-8 w-72 mb-2" />
            ) : (
              <>
                <h1 className="text-2xl font-bold tracking-tight">{job?.title} - Applications</h1>
                <p className="text-muted-foreground">
                  Manage applications for this position
                </p>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Link to="/employer/jobs">
              <Button variant="outline">Back to Jobs</Button>
            </Link>
            <Button onClick={() => this.fetchApplications()}>
              Refresh
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>
              {applications.length} {applications.length === 1 ? 'application' : 'applications'} received
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">
                {error}
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/60" />
                <p className="text-lg font-medium">No applications yet</p>
                <p className="text-sm">Applications will appear here when candidates apply for this position.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Match</TableHead>
                      <TableHead>Date Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map(application => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{application.applicantName}</div>
                            <div className="text-sm text-muted-foreground">{application.applicantEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div 
                              className={`h-2.5 rounded-full w-full mr-2 ${
                                application.matchPercentage >= 80 ? 'bg-gray-500' :
                                application.matchPercentage >= 60 ? 'bg-gray-400' :
                                'bg-gray-300'
                              }`}
                            >
                              <div 
                                className="h-2.5 rounded-full bg-primary" 
                                style={{ width: `${application.matchPercentage}%` }}
                              />
                            </div>
                            <span>{application.matchPercentage}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(application.dateApplied).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {this.getStatusLabel(application.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              title="View Resume"
                              onClick={() => window.open(application.resumeUrl, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Download Resume"
                              onClick={() => window.open(application.resumeUrl, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Contact Applicant"
                              onClick={() => window.location.href = `mailto:${application.applicantEmail}`}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            
                            {application.status === 'pending' && (
                              <Button
                                variant="default"
                                size="sm"
                                title="Mark as Reviewed"
                                onClick={() => this.handleUpdateStatus(application.id, 'reviewed')}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            )}
                            
                            {(application.status === 'pending' || application.status === 'reviewed') && (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="bg-gray-600 hover:bg-gray-700"
                                  title="Accept Application"
                                  onClick={() => this.handleUpdateStatus(application.id, 'accepted')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  title="Reject Application"
                                  onClick={() => this.handleUpdateStatus(application.id, 'rejected')}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
}

// Wrapper component to provide URL params
export const JobApplicationsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  
  // Handle case when jobId is undefined (should not happen with proper routing)
  if (!jobId) {
    return <Navigate to="/employer/jobs" />;
  }
  
  return <JobApplicationsPageClass jobId={jobId} />;
}; 