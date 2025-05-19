import React, { Component } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate, NavigateFunction, useLocation, Location } from 'react-router-dom';
import { AuthContext } from '../providers/AuthProvider';
import { Button } from '../components/ui/Button';
import { Loader2, MapPin, Briefcase, DollarSign, ArrowLeft, Calendar } from 'lucide-react';

// Base Job interface
interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string | null;
  company_name: string | null;
  company_logo_url: string | null;
  location: string | null;
  job_type: string | null;
  salary_range: string | null;
  required_skills: string[] | null;
  application_deadline: string | null;
  created_at: string;
  updated_at: string | null;
  status: string;
  is_active: boolean;
  match_score?: number | null;
}

// Props for the JobDetailPage component
interface JobDetailPageProps {
  jobId?: string;
  navigate: NavigateFunction;
  location: Location;
}

// State for the JobDetailPage component
interface JobDetailPageState {
  job: Job | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  userRole: string | null;
}

// Helper function to get match score color
const getScoreColor = (score: number | null): string => {
  if (score === null || score === undefined) return "text-gray-400";
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-blue-500";
  if (score >= 40) return "text-yellow-500";
  return "text-red-500";
};

// Helper function to get human-readable match score label
const getScoreLabel = (score: number | null): string => {
  if (score === null || score === undefined) return "No match data";
  if (score >= 80) return "Strong Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Potential Match";
  return "Low Match";
};

class JobDetailPageClass extends Component<JobDetailPageProps, JobDetailPageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;
  
  // API base URL
  private API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  
  constructor(props: JobDetailPageProps) {
    super(props);
    this.state = {
      job: null,
      loading: true,
      error: null,
      isAuthenticated: false,
      userRole: null
    };
  }
  
  componentDidMount() {
    // Check authentication status
    if (this.context?.user) {
      this.setState({
        isAuthenticated: true,
        userRole: this.context.user.roles?.[0] || null
      });
    }
    
    this.fetchJobDetails();
  }
  
  fetchJobDetails = async () => {
    const { jobId } = this.props;
    if (!jobId) {
      this.setState({
        error: "Job ID is missing",
        loading: false
      });
      return;
    }
    
    this.setState({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await axios.get(`${this.API_BASE_URL}/jobs/${jobId}`, {
        headers
      });
      
      if (response.data) {
        this.setState({
          job: {
            id: response.data.id,
            employer_id: response.data.employerId,
            title: response.data.title,
            description: response.data.description,
            company_name: response.data.companyName,
            company_logo_url: response.data.companyLogoUrl,
            location: response.data.location,
            job_type: response.data.jobType,
            salary_range: response.data.salaryRange,
            required_skills: Array.isArray(response.data.requiredSkills) ? response.data.requiredSkills : [],
            application_deadline: response.data.applicationDeadline,
            created_at: response.data.createdAt,
            updated_at: response.data.updatedAt,
            status: response.data.status,
            is_active: response.data.isActive,
            match_score: response.data.matchScore
          },
          loading: false
        });
      } else {
        this.setState({
          error: "Job not found",
          loading: false
        });
      }
    } catch (err) {
      console.error("Fetch job details error:", err);
      this.setState({
        error: "Failed to load job details",
        loading: false
      });
    }
  };
  
  handleApplyClick = async () => {
    const { job } = this.state;
    const { navigate } = this.props;
    const { isAuthenticated, userRole } = this.state;
    
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { returnUrl: `/opportunities/${job?.id}` } });
      return;
    }
    
    if (!job) return;
    
    // Get the context safely
    const authContext = this.context;
    if (!authContext) {
      console.error("Auth context is undefined");
      return;
    }
    
    const { user } = authContext;
    
    if (!user) {
      // Redirect to login page
      navigate('/login', { state: { returnUrl: `/opportunities/${job?.id}` } });
      return;
    }
    
    // Check if user is a student
    if (user.roles && user.roles.includes('ROLE_STUDENT')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${this.API_BASE_URL}/job-applications/apply`,
          { jobId: job.id },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Redirect to applications tracking page
        navigate('/track');
      } catch (err) {
        console.error("Error applying for job:", err);
        // Show error notification
      }
    } else {
      // Show message that only students can apply
      console.error("Only students can apply for jobs");
    }
  };
  
  render() {
    const { job, loading, error } = this.state;
    
    if (loading) {
      return (
        <div className="container max-w-4xl mx-auto py-8 px-4 min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="mt-4 text-lg">Loading job details...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-red-600 text-xl font-semibold mb-2">Error Loading Job</h2>
            <p className="text-red-800">{error}</p>
            <Link to="/opportunities">
              <Button className="mt-4" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Opportunities
            </Button>
          </Link>
          </div>
        </div>
      );
    }

    if (!job) {
    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
            <h2 className="text-amber-600 text-xl font-semibold mb-2">Job Not Found</h2>
            <p className="text-amber-800">The job you're looking for doesn't exist or has been removed.</p>
            <Link to="/opportunities">
              <Button className="mt-4" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Opportunities
              </Button>
            </Link>
          </div>
        </div>
      );
    }
    
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link to="/opportunities">
            <Button variant="ghost" className="pl-0 hover:pl-0 hover:bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Opportunities
            </Button>
          </Link>
                </div>
                
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {/* Header Section */}
          <div className="p-6 border-b">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold">{job.title}</h1>
                <p className="text-lg text-gray-600 mt-1">{job.company_name}</p>
                </div>
                
              {job.match_score !== undefined && job.match_score !== null && (
                <div className="bg-gray-50 px-3 py-2 rounded-lg border text-center min-w-[100px]">
                  <span className={`text-2xl font-bold ${getScoreColor(job.match_score)}`}>
                      {job.match_score}%
                    </span>
                  <p className="text-xs text-gray-500">{getScoreLabel(job.match_score)}</p>
                  </div>
                )}
            </div>
            
            <div className="flex flex-wrap gap-y-2 text-gray-600">
                {job.location && (
                <div className="flex items-center mr-6">
                  <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                  <span>{job.location}</span>
                  </div>
                )}
                
                {job.job_type && (
                <div className="flex items-center mr-6">
                  <Briefcase className="h-4 w-4 mr-1 text-gray-400" />
                  <span>{job.job_type}</span>
                  </div>
                )}
                
                {job.salary_range && (
                <div className="flex items-center mr-6">
                  <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                  <span>{job.salary_range}</span>
                    </div>
              )}
              
              {job.application_deadline && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                  <span>Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
            <div className="mt-4">
              <Button 
                className="w-full sm:w-auto" 
                size="lg"
                onClick={this.handleApplyClick}
              >
                Apply Now
              </Button>
            </div>
          </div>
          
          {/* Description Section */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">About this position</h2>
            <div className="prose max-w-none">
              {job.description ? (
                <div dangerouslySetInnerHTML={{ __html: job.description }} />
              ) : (
                <p className="text-gray-500">No description provided.</p>
              )}
                </div>
              </div>
              
          {/* Skills Section */}
          {job.required_skills && job.required_skills.length > 0 && (
            <div className="p-6 border-t">
              <h2 className="text-xl font-semibold mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill, index) => (
                      <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Apply Button */}
          <div className="p-6 border-t bg-gray-50">
                <Button 
              className="w-full sm:w-auto" 
                  size="lg"
                  onClick={this.handleApplyClick}
                >
              Apply Now
                </Button>
              </div>
            </div>
          </div>
    );
  }
}

// React Router v6 wrapper using hooks
export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <JobDetailPageClass 
      jobId={id} 
      navigate={navigate}
      location={location}
    />
  );
} 