import React, { Component } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../providers/AuthProvider';
import { Button } from '../components/ui/Button';
import { Loader2, ArrowLeft } from 'lucide-react';

// Interface for the job details
interface Job {
  id: string;
  title: string;
  company_name: string | null;
}

// Props for the application page component
interface JobApplicationPageProps {
  jobId: string;
  navigate: (path: string) => void;
}

// State for the application page
interface JobApplicationPageState {
  job: Job | null;
  loading: boolean;
  error: string | null;
  formData: {
    fullName: string;
    email: string;
    phone: string;
    experience: string;
    coverLetter: string;
  };
  submitting: boolean;
  submitError: string | null;
}

class JobApplicationPageClass extends Component<JobApplicationPageProps, JobApplicationPageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;
  
  // API base URL
  private API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  
  constructor(props: JobApplicationPageProps) {
    super(props);
    this.state = {
      job: null,
      loading: true,
      error: null,
      formData: {
        fullName: '',
        email: '',
        phone: '',
        experience: '',
        coverLetter: ''
      },
      submitting: false,
      submitError: null
    };
  }
  
  componentDidMount() {
    // Check if user is logged in
    const authContext = this.context;
    const { user } = authContext;
    
    // If not authenticated, redirect to login
    if (!user) {
      this.props.navigate('/login');
      return;
    }
    
    // Check if user is a student
    if (!user.roles?.includes('ROLE_STUDENT')) {
      this.setState({
        loading: false,
        error: "Only students can apply for jobs"
      });
      return;
    }
    
    // Prefill form with user data
    if (user) {
      this.setState(prevState => ({
        formData: {
          ...prevState.formData,
          fullName: user?.fullName || '',
          email: user?.email || ''
        }
      }));
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
            title: response.data.title,
            company_name: response.data.companyName
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
  
  handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: value
      }
    }));
  };
  
  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { jobId } = this.props;
    const { formData } = this.state;
    
    this.setState({ submitting: true, submitError: null });
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        this.setState({
          submitError: "You must be logged in to apply",
          submitting: false
        });
        return;
      }
      
      // Send application data to the API
      const response = await axios.post(
        `${this.API_BASE_URL}/job-applications/apply`,
        {
          jobId,
          coverLetter: formData.coverLetter,
          contactPhone: formData.phone,
          yearsOfExperience: Number(formData.experience) || 0
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Navigate to application tracking page
      this.props.navigate('/track');
    } catch (err: any) {
      console.error("Error submitting application:", err);
      this.setState({
        submitError: err.response?.data?.message || "Failed to submit application",
        submitting: false
      });
    }
  };
  
  render() {
    const { job, loading, error, formData, submitting, submitError } = this.state;
    
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
          <Link to="/opportunities" className="absolute top-8 left-8">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </Link>
          <h2 className="text-2xl font-semibold text-red-500 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => this.props.navigate('/opportunities')}>
            Back to Opportunities
          </Button>
        </div>
      );
    }
    
    return (
      <main className="min-h-screen py-8 md:py-12 flex flex-col items-center">
        <div className="container max-w-2xl px-4">
          <div className="mb-6">
            <Link to={`/opportunities/${this.props.jobId}`}>
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Job Details</span>
              </Button>
            </Link>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Apply for Position</h1>
            <p className="text-gray-600 mb-6">
              {job?.title} at {job?.company_name || 'Company'}
            </p>
            
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
                {submitError}
              </div>
            )}
            
            <form onSubmit={this.handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-gray-700 block">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={this.handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={this.handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700 block">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={this.handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="experience" className="text-sm font-medium text-gray-700 block">
                  Years of Experience
                </label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={this.handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="coverLetter" className="text-sm font-medium text-gray-700 block">
                  Cover Letter
                </label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={this.handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us why you're interested in this position and how your experience makes you a good fit..."
                  required
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => this.props.navigate(`/opportunities/${this.props.jobId}`)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    );
  }
}

// Wrapper component to use hooks with class component
export function JobApplicationPage() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const jobId = params.id || '';
  
  return <JobApplicationPageClass jobId={jobId} navigate={navigate} />;
} 