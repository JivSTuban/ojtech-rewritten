import React, { Component, createRef, RefObject } from "react";
import TinderCard from "react-tinder-card";
import { Loader2, Check, X, Briefcase, MapPin, Calendar, Undo2, DollarSign, Info, HelpCircle, ChevronRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { JobCard } from "../components/jobs/JobCard";
import { Button } from "../components/ui/Button";
import { createClient } from '@supabase/supabase-js';

// Job types
interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string | null;
  company_name: string | null;
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
}

// Extended job type with match score and company logo
interface JobWithMatchScore extends Job {
  match_score?: number | null;
  company_logo_url?: string | null;
}

// Define the toast interface (simplified for now)
interface Toast {
  title: string;
  description: string;
  variant?: string;
}

interface OpportunitiesPageState {
  jobs: JobWithMatchScore[];
  loading: boolean;
  error: string | null;
  currentIndex: number;
  lastRemovedJob: {
    job: Job;
    direction: "left" | "right";
  } | null;
  expandedJobId: string | null;
  isProcessingCV: boolean;
}

export class OpportunitiesPage extends Component<{}, OpportunitiesPageState> {
  // Create a Supabase client (should be moved to a provider in a real app)
  private supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );
  
  // Refs for controlling cards programmatically
  private childRefs: RefObject<any>[] = [];
  
  constructor(props: {}) {
    super(props);
    this.state = {
      jobs: [],
      loading: true,
      error: null,
      currentIndex: 0,
      lastRemovedJob: null,
      expandedJobId: null,
      isProcessingCV: false
    };
  }
  
  componentDidMount() {
    this.checkCVProcessingStatus();
    this.fetchJobs();
  }
  
  componentDidUpdate(prevProps: {}, prevState: OpportunitiesPageState) {
    // Update refs if jobs array changes
    if (prevState.jobs.length !== this.state.jobs.length) {
      this.childRefs = Array(this.state.jobs.length)
        .fill(0)
        .map(() => createRef<any>());
    }
  }
  
  // Check if CV is currently being processed
  checkCVProcessingStatus = async () => {
    try {
      // Get current user
      const {
        data: { session },
      } = await this.supabase.auth.getSession();

      if (!session?.user?.id) {
        return;
      }

      const userId = session.user.id;

      // Check if user has any CV records
      const { data: cvs, error: cvError } = await this.supabase
        .from("cvs")
        .select("id, skills")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1);

      if (cvError) {
        console.error("Error checking CV status:", cvError);
        return;
      }

      // If no CVs, we're not processing anything
      if (!cvs || cvs.length === 0) {
        this.setState({ isProcessingCV: false });
        return;
      }

      const cv = cvs[0];

      // If skills is null, CV is still being processed
      this.setState({ isProcessingCV: cv.skills === null });

      // Check again after a short delay if still processing
      if (cv.skills === null) {
        setTimeout(this.checkCVProcessingStatus, 10000); // Check again in 10 seconds
      }
    } catch (error) {
      console.error("Error checking CV processing status:", error);
    }
  };
  
  // Fetch jobs for the current user
  fetchJobs = async () => {
    this.setState({ loading: true, error: null });
    
    try {
      // Get current user
      const {
        data: { session },
      } = await this.supabase.auth.getSession();

      if (!session?.user?.id) {
        this.setState({ 
          error: "You must be logged in to view job opportunities.", 
          loading: false 
        });
        return;
      }
      
      // This would be replaced with actual API calls in a real app
      // For now, simulate fetching jobs with mock data
      const mockJobs: JobWithMatchScore[] = [
        {
          id: "1",
          employer_id: "emp1",
          title: "Frontend Developer Intern",
          description: "We're looking for a passionate frontend developer intern to join our team.",
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
        },
        {
          id: "2",
          employer_id: "emp2",
          title: "Backend Developer Intern",
          description: "Join our backend team and work on scalable systems.",
          company_name: "ServerPro",
          company_logo_url: null,
          location: "Hybrid",
          job_type: "Internship",
          salary_range: "$18-22/hr",
          required_skills: ["Node.js", "Express", "MongoDB", "API Development"],
          preferred_skills: null,
          application_deadline: "2023-12-15",
          created_at: new Date().toISOString(),
          updated_at: null,
          status: "open",
          is_active: true,
          match_score: 72
        }
      ];
      
      // Set jobs and update current index
      this.setState({
        jobs: mockJobs,
        currentIndex: mockJobs.length - 1,
        loading: false
      });
      
      // Initialize refs
      this.childRefs = Array(mockJobs.length)
        .fill(0)
        .map(() => createRef<any>());
        
    } catch (err) {
      console.error("Fetch jobs error:", err);
      this.setState({
        error: "An unexpected error occurred while fetching jobs.",
        loading: false
      });
    }
  };
  
  // Mock function for applying to a job
  applyForJob = async (jobId: string) => {
    console.log(`Applied for job ${jobId}`);
    return { success: true };
  };
  
  // Mock function for declining a job
  declineJob = async (jobId: string) => {
    console.log(`Declined job ${jobId}`);
    return { success: true };
  };
  
  // Simple toast function (would be replaced with a real toast component)
  toast = (toast: Toast) => {
    console.log(`TOAST: ${toast.title} - ${toast.description}`);
  };
  
  // Handle card swipe
  handleSwipe = async (direction: string, job: Job) => {
    try {
      if (direction === "right") {
        // Handle apply
        const result = await this.applyForJob(job.id);
        if (result.success) {
          this.toast({
            title: "Application Submitted",
            description: `You've applied for ${job.title}`,
          });
        }
      } else if (direction === "left") {
        // Handle decline
        const result = await this.declineJob(job.id);
        if (result.success) {
          this.toast({
            title: "Job Declined",
            description: `You've declined ${job.title}`,
          });
        }
      }

      // Save the last removed job for potential undo
      this.setState({ 
        lastRemovedJob: { 
          job, 
          direction: direction as "left" | "right" 
        } 
      });
    } catch (err) {
      console.error("Error handling swipe:", err);
      this.toast({
        title: "Error",
        description: "There was a problem processing your action",
        variant: "destructive",
      });
    }
  };
  
  // When a card leaves the screen
  outOfFrame = (jobTitle: string, index: number) => {
    console.log(`${jobTitle} (${index}) left the screen`);
    // Update current index if needed
    if (this.state.currentIndex === index) {
      this.setState({ currentIndex: index - 1 });
    }
  };
  
  // Programmatically trigger a swipe
  swipe = async (dir: "left" | "right") => {
    const { currentIndex, jobs } = this.state;
    if (currentIndex >= 0 && this.childRefs[currentIndex]) {
      await this.childRefs[currentIndex].current?.swipe(dir);
    }
  };
  
  // Undo the last swipe
  undoSwipe = () => {
    const { lastRemovedJob, jobs } = this.state;
    if (lastRemovedJob) {
      // For a real implementation, we would restore the job in the backend
      // and then refetch. Here we just add it back to our array.
      const restoredJobs = [...jobs, lastRemovedJob.job] as JobWithMatchScore[];
      this.setState({
        jobs: restoredJobs,
        currentIndex: restoredJobs.length - 1,
        lastRemovedJob: null,
      });
      
      this.toast({
        title: "Action Undone",
        description: `You've undone your action for ${lastRemovedJob.job.title}`,
      });
    }
  };
  
  // Get color based on match score
  getScoreColor = (score: number | null): string => {
    if (score === null) return "bg-gray-200 text-gray-700";
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };
  
  // Get label based on match score
  getScoreLabel = (score: number | null): string => {
    if (score === null) return "No Match Data";
    if (score >= 80) return "Strong Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Moderate Match";
    return "Low Match";
  };
  
  render() {
    const { jobs, loading, error, currentIndex, lastRemovedJob, isProcessingCV } = this.state;
    
    // Loading state
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-medium text-center mb-2">Loading Job Opportunities</h2>
          <p className="text-center text-gray-600 max-w-md">
            We're finding the best opportunities for you based on your skills and preferences.
          </p>
        </div>
      );
    }
    
    // Error state
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-medium text-center mb-2">Error Loading Jobs</h2>
          <p className="text-center text-gray-600 max-w-md mb-6">{error}</p>
          <Button onClick={this.fetchJobs}>Try Again</Button>
        </div>
      );
    }
    
    // CV processing state
    if (isProcessingCV) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-medium text-center mb-2">Analyzing Your Profile</h2>
          <p className="text-center text-gray-600 max-w-md mb-6">
            We're currently analyzing your resume to find the best job matches. This may take a few minutes.
          </p>
        </div>
      );
    }
    
    // No jobs state
    if (jobs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
          <Info className="w-12 h-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-medium text-center mb-2">No Jobs Found</h2>
          <p className="text-center text-gray-600 max-w-md mb-6">
            We couldn't find any job opportunities matching your profile. Check back later or update your skills.
          </p>
          <Link to="/profile">
            <Button>Update Profile</Button>
          </Link>
        </div>
      );
    }
    
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Discover Opportunities</h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            Swipe right on opportunities you're interested in, or left to pass.
          </p>
        </div>
        
        <div className="relative w-full h-[630px]">
          {/* Cards container */}
          <div className="w-full h-full">
            {jobs.map((job, index) => (
              <div
                key={job.id}
                className="absolute w-full h-full"
                style={{ visibility: index < currentIndex - 1 ? 'hidden' : 'visible' }}
              >
                <JobCard
                  job={job}
                  isActive={index === currentIndex}
                  onSwipe={(direction) => this.handleSwipe(direction, job)}
                  style={{ zIndex: index === currentIndex ? 5 : 0 }}
                />
              </div>
            ))}
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => this.swipe("left")}
              className="w-14 h-14 rounded-full bg-white shadow-md hover:shadow-lg flex items-center justify-center border border-gray-200 transition-all hover:scale-105"
              disabled={currentIndex < 0}
            >
              <X className="w-7 h-7 text-red-500" />
            </button>
            
            <button
              onClick={this.undoSwipe}
              className="w-12 h-12 rounded-full bg-white shadow-md hover:shadow-lg flex items-center justify-center border border-gray-200 transition-all hover:scale-105"
              disabled={!lastRemovedJob}
            >
              <Undo2 className="w-5 h-5 text-gray-600" />
            </button>
            
            <button
              onClick={() => this.swipe("right")}
              className="w-14 h-14 rounded-full bg-white shadow-md hover:shadow-lg flex items-center justify-center border border-gray-200 transition-all hover:scale-105"
              disabled={currentIndex < 0}
            >
              <Check className="w-7 h-7 text-green-500" />
            </button>
          </div>
          
          {/* Info about remaining cards */}
          <div className="text-center mt-4 text-sm text-gray-500">
            {currentIndex + 1} of {jobs.length} opportunities
          </div>
        </div>
      </div>
    );
  }
} 