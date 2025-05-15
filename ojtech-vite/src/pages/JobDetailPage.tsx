import React, { Component } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, MapPin, Calendar, DollarSign, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { createClient } from '@supabase/supabase-js';

// Job type definition
interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string | null;
  company_name: string | null;
  company_logo_url?: string | null;
  location: string | null;
  job_type: string | null;
  salary_range: string | null;
  required_skills: string[];
  preferred_skills: Record<string, any> | null;
  application_deadline: string | null;
  created_at: string;
  updated_at: string | null;
  status: string;
  is_active: boolean;
  match_score?: number | null;
}

// Since we can't use useParams in a class component,
// we'll create a wrapper function component that gets the params and passes them to our class
export function JobDetailPageWrapper() {
  const { id } = useParams<{ id: string }>();
  return <JobDetailPage jobId={id || ''} />;
}

interface JobDetailPageProps {
  jobId: string;
}

interface JobDetailPageState {
  job: Job | null;
  loading: boolean;
  error: string | null;
  isApplying: boolean;
  hasApplied: boolean;
  redirectToLogin: boolean;
}

export class JobDetailPage extends Component<JobDetailPageProps, JobDetailPageState> {
  // Create a Supabase client (should be moved to a provider in a real app)
  private supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );
  
  constructor(props: JobDetailPageProps) {
    super(props);
    this.state = {
      job: null,
      loading: true,
      error: null,
      isApplying: false,
      hasApplied: false,
      redirectToLogin: false
    };
  }
  
  componentDidMount() {
    this.fetchJobDetails();
    this.checkUserSession();
  }
  
  // Check if user is logged in
  checkUserSession = async () => {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session) {
      this.setState({ redirectToLogin: true });
    }
  };
  
  // Fetch job details
  fetchJobDetails = async () => {
    const { jobId } = this.props;
    
    if (!jobId) {
      this.setState({ 
        loading: false, 
        error: "Job ID is required" 
      });
      return;
    }
    
    try {
      // In a real app, this would fetch from the API
      // For now, create a mock job
      const mockJob: Job = {
        id: jobId,
        employer_id: "emp1",
        title: "Frontend Developer Intern",
        description: `
          <p>We're looking for a passionate frontend developer intern to join our team. This is a great opportunity to work with modern technologies and gain real-world experience.</p>
          <p>As a frontend developer intern, you will:</p>
          <ul>
            <li>Work closely with senior developers to implement UI features</li>
            <li>Turn design mockups into functional components</li>
            <li>Debug and fix frontend issues</li>
            <li>Learn best practices for web development</li>
          </ul>
        `,
        company_name: "TechCorp",
        company_logo_url: null,
        location: "Remote",
        job_type: "Internship",
        salary_range: "$15-20/hr",
        required_skills: ["React", "JavaScript", "HTML", "CSS"],
        preferred_skills: null,
        application_deadline: "2023-12-31",
        created_at: new Date().toISOString(),
        updated_at: null,
        status: "open",
        is_active: true,
        match_score: 85
      };
      
      // Simulate network delay
      setTimeout(() => {
        this.setState({
          job: mockJob,
          loading: false
        });
      }, 1000);
      
      // Check if user has already applied
      // In a real app, this would check the applications table
      this.setState({ hasApplied: false });
      
    } catch (error) {
      console.error("Error fetching job details:", error);
      this.setState({
        loading: false,
        error: "Failed to load job details. Please try again."
      });
    }
  };
  
  // Handle job application
  handleApply = async () => {
    const { job } = this.state;
    if (!job) return;
    
    this.setState({ isApplying: true });
    
    try {
      // In a real app, this would submit to the API
      console.log(`Applying for job ${job.id}`);
      
      // Simulate network delay
      setTimeout(() => {
        this.setState({
          isApplying: false,
          hasApplied: true
        });
      }, 1500);
    } catch (error) {
      console.error("Error applying for job:", error);
      this.setState({
        isApplying: false,
        error: "Failed to submit application. Please try again."
      });
    }
  };
  
  render() {
    const { job, loading, error, isApplying, hasApplied, redirectToLogin } = this.state;
    
    if (redirectToLogin) {
      return <Navigate to="/auth/login" replace />;
    }
    
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
          <Link to="/opportunities">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Opportunities
            </Button>
          </Link>
        </div>
      );
    }
    
    if (!job) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 text-yellow-600 p-4 rounded-lg mb-6">
            Job not found
          </div>
          <Link to="/opportunities">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Opportunities
            </Button>
          </Link>
        </div>
      );
    }
    
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/opportunities">
            <Button variant="ghost" className="flex items-center gap-2 pl-1 text-gray-600">
              <ArrowLeft className="w-4 h-4" />
              Back to Opportunities
            </Button>
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  {job.title}
                </h1>
                <p className="text-gray-600">
                  {job.company_name}
                </p>
              </div>
              {job.match_score !== null && (
                <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full font-medium text-sm">
                  {job.match_score}% Match
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                {job.location || "Remote"}
              </div>
              <div className="flex items-center text-gray-600">
                <Briefcase className="w-5 h-5 mr-2 text-gray-500" />
                {job.job_type || "Full-time"}
              </div>
              {job.application_deadline && (
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                  Apply by: {new Date(job.application_deadline).toLocaleDateString()}
                </div>
              )}
              {job.salary_range && (
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-5 h-5 mr-2 text-gray-500" />
                  {job.salary_range}
                </div>
              )}
            </div>
            
            <div className="mt-6">
              {hasApplied ? (
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
                  <span>You've applied for this position</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
              ) : (
                <Button
                  className="w-full sm:w-auto"
                  onClick={this.handleApply}
                  disabled={isApplying}
                >
                  {isApplying ? "Submitting..." : "Apply Now"}
                </Button>
              )}
            </div>
          </div>
          
          {/* Body */}
          <div className="p-6">
            {/* Skills */}
            {job.required_skills && job.required_skills.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Job Description</h2>
              <div 
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: job.description || "No description provided." }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
} 