import React, { Component, createRef, RefObject } from "react";
import TinderCard from "react-tinder-card";
import { Loader2, Check, X, Briefcase, MapPin, Calendar, Undo2, DollarSign, Info, HelpCircle, ChevronRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { JobCard } from "../components/jobs/JobCard";
import { Button } from "../components/ui/Button";
import axios from 'axios';

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
  match_score: number | null;
  company_logo_url: string | null;
}

// Mock data for jobs
const MOCK_JOBS: JobWithMatchScore[] = [
  {
    id: "1",
    employer_id: "emp1",
    title: "Frontend Developer",
    description: "We are looking for a skilled frontend developer proficient in React, TypeScript, and modern CSS frameworks. You will be responsible for building responsive web applications and maintaining existing projects.",
    company_name: "TechCorp Solutions",
    company_logo_url: "https://placekitten.com/150/150",
    location: "New York, NY (Remote)",
    job_type: "Full-time",
    salary_range: "$90,000 - $120,000",
    required_skills: ["React", "TypeScript", "CSS", "HTML5", "Git"],
    preferred_skills: null,
    application_deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: null,
    status: "active",
    is_active: true,
    match_score: 92
  },
  {
    id: "6",
    employer_id: "symph",
    title: "Software Engineering Intern",
    description: "In Web and Mobile App Development, you will first study the company's tech stack for 2-3 weeks, then collaborate with developers, designers, and project managers to build real-world applications. If you join the QA Technical track, your role focuses on ensuring excellent quality by writing and implementing automated testing for web and mobile apps. Those in Internal Technical Operations will contribute to improving Symph's internal systems by fixing, enhancing, or developing tools that support the company's efficiency.",
    company_name: "Symph",
    company_logo_url: null,
    location: "Cebu IT Park",
    job_type: "Internship",
    salary_range: null,
    required_skills: ["Web Development", "Mobile Development", "QA Testing", "Technical Operations"],
    preferred_skills: null,
    application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: null,
    status: "active",
    is_active: true,
    match_score: 88
  },
  {
    id: "2",
    employer_id: "emp2",
    title: "Backend Engineer",
    description: "Join our talented engineering team to build scalable microservices and RESTful APIs using Java Spring Boot. Experience with cloud platforms and containerization is a plus.",
    company_name: "DataDrive Inc.",
    company_logo_url: "https://placekitten.com/151/151",
    location: "San Francisco, CA",
    job_type: "Full-time",
    salary_range: "$110,000 - $150,000",
    required_skills: ["Java", "Spring Boot", "SQL", "RESTful APIs", "Microservices"],
    preferred_skills: null,
    application_deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: null,
    status: "active",
    is_active: true,
    match_score: 75
  },
  {
    id: "3",
    employer_id: "emp3",
    title: "DevOps Engineer",
    description: "Help us build and maintain our cloud infrastructure using AWS, Terraform, and Kubernetes. You will be responsible for automating deployment pipelines and ensuring system reliability.",
    company_name: "CloudScale Technologies",
    company_logo_url: null,
    location: "Chicago, IL (Hybrid)",
    job_type: "Full-time",
    salary_range: "$100,000 - $135,000",
    required_skills: ["AWS", "Terraform", "Kubernetes", "CI/CD", "Linux"],
    preferred_skills: null,
    application_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: null,
    status: "active",
    is_active: true,
    match_score: 50
  },
  {
    id: "4",
    employer_id: "emp4",
    title: "Full Stack Developer",
    description: "Looking for a versatile developer who can work across our entire stack. You'll build features using React on the frontend and Node.js on the backend.",
    company_name: "OmniTech Solutions",
    company_logo_url: "https://placekitten.com/152/152",
    location: "Remote",
    job_type: "Contract",
    salary_range: "$60-75/hour",
    required_skills: ["React", "Node.js", "MongoDB", "Express", "JavaScript"],
    preferred_skills: null,
    application_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: null,
    status: "active",
    is_active: true,
    match_score: 85
  },
  {
    id: "5",
    employer_id: "emp5",
    title: "Data Scientist",
    description: "Join our analytics team to develop machine learning models and extract insights from large datasets. You will work closely with product teams to implement data-driven solutions.",
    company_name: "Analytix",
    company_logo_url: null,
    location: "Boston, MA",
    job_type: "Full-time",
    salary_range: "$120,000 - $160,000",
    required_skills: ["Python", "Machine Learning", "SQL", "Data Visualization", "Statistics"],
    preferred_skills: null,
    application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: null,
    status: "active",
    is_active: true,
    match_score: 35
  }
];

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
    job: JobWithMatchScore;
    direction: "left" | "right";
  } | null;
  expandedJobId: string | null;
  isProcessingCV: boolean;
}

export class OpportunitiesPage extends Component<{}, OpportunitiesPageState> {
  // API base URL
  private API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  
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
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }
      
      // Using mock data, so we'll just set isProcessing to false
      this.setState({ isProcessingCV: false });
      
      // Uncomment the following code when you want to use the real API again
      /*
      const response = await axios.get(`${this.API_BASE_URL}/cvs/me/status`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.isProcessing) {
        this.setState({ isProcessingCV: true });
        // Check again after a short delay if still processing
        setTimeout(this.checkCVProcessingStatus, 10000); // Check again in 10 seconds
      } else {
        this.setState({ isProcessingCV: false });
      }
      */
    } catch (error) {
      console.error("Error checking CV processing status:", error);
      this.setState({ isProcessingCV: false });
    }
  };
  
  // Fetch jobs for the current user (now using mock data)
  fetchJobs = async () => {
    this.setState({ loading: true, error: null });
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use mock data instead of API call
      const matchedJobs = MOCK_JOBS;
      
      // Set jobs and update current index
      this.setState({
        jobs: matchedJobs,
        currentIndex: matchedJobs.length - 1,
        loading: false
      });
      
      // Initialize refs
      this.childRefs = Array(matchedJobs.length)
        .fill(0)
        .map(() => createRef<any>());
      
      // Uncomment the following code when you want to use the real API again
      /*
      const token = localStorage.getItem('token');
      if (!token) {
        this.setState({ 
          error: "You must be logged in to view job opportunities.", 
          loading: false 
        });
        return;
      }
      
      // Call the job matching API to get matched jobs
      const response = await axios.get(`${this.API_BASE_URL}/job-matching/matches`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data) {
        const matchedJobs: JobWithMatchScore[] = response.data.map((job: any) => ({
          id: job.id,
          employer_id: job.employerId,
          title: job.title,
          description: job.description,
          company_name: job.companyName,
          company_logo_url: job.companyLogoUrl,
          location: job.location,
          job_type: job.jobType,
          salary_range: job.salaryRange,
          required_skills: Array.isArray(job.requiredSkills) ? job.requiredSkills : [],
          preferred_skills: job.preferredSkills,
          application_deadline: job.applicationDeadline,
          created_at: job.createdAt,
          updated_at: job.updatedAt,
          status: job.status,
          is_active: job.isActive,
          match_score: job.matchScore
        }));
        
        // Set jobs and update current index
        this.setState({
          jobs: matchedJobs,
          currentIndex: matchedJobs.length - 1,
          loading: false
        });
        
        // Initialize refs
        this.childRefs = Array(matchedJobs.length)
          .fill(0)
          .map(() => createRef<any>());
      } else {
        this.setState({
          error: "No matched jobs found",
          loading: false
        });
      }
      */
    } catch (err) {
      console.error("Fetch jobs error:", err);
      this.setState({
        error: "An unexpected error occurred while fetching jobs.",
        loading: false
      });
    }
  };
  
  // Apply for a job using the Spring Boot API
  applyForJob = async (jobId: string) => {
    try {
      // Using mock data, just return success
      console.log(`Mock API: Applied for job ${jobId}`);
      return { success: true, data: { letterGenerated: true } };
      
      // Uncomment the following code when you want to use the real API again
      /*
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, error: "Authentication required" };
      }
      
      const response = await axios.post(`${this.API_BASE_URL}/job-applications/apply`, 
        { jobId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return { success: true, data: response.data };
      */
    } catch (error) {
      console.error("Error applying for job:", error);
      return { success: false, error: "Failed to apply for job" };
    }
  };
  
  // Decline a job using the Spring Boot API
  declineJob = async (jobId: string) => {
    try {
      // Using mock data, just return success
      console.log(`Mock API: Declined job ${jobId}`);
      return { success: true, data: {} };
      
      // Uncomment the following code when you want to use the real API again
      /*
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, error: "Authentication required" };
      }
      
      const response = await axios.post(`${this.API_BASE_URL}/job-matching/decline`, 
        { jobId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return { success: true, data: response.data };
      */
    } catch (error) {
      console.error("Error declining job:", error);
      return { success: false, error: "Failed to decline job" };
    }
  };
  
  // Simple toast function (would be replaced with a real toast component)
  toast = (toast: Toast) => {
    console.log(`TOAST: ${toast.title} - ${toast.description}`);
    // Here you would use a real toast notification system
  };
  
  // Handle card swipe
  handleSwipe = async (direction: string, job: Job, index: number) => {
    try {
      // Ensure direction is only left or right before processing
      if (direction !== 'left' && direction !== 'right') return;
      
      console.log(`Swiped ${direction} on ${job.title}`);
      this.setState(prevState => ({ 
        currentIndex: index - 1,
        lastRemovedJob: { job: job as JobWithMatchScore, direction: direction as 'left' | 'right' }
      }));
      
      if (direction === 'right') {
        const result = await this.applyForJob(job.id);
        if (result.success) {
          this.toast({
            title: `Applying for ${job.title}...`,
            description: result.data?.letterGenerated 
              ? "Generated recommendation and submitted application."
              : "Application submitted."
          });
        } else {
          this.toast({
            title: "Application Failed",
            description: result.error || "Failed to apply for job",
            variant: "destructive"
          });
        }
      } else {
        const result = await this.declineJob(job.id);
        if (result.success) {
          this.toast({
            title: `Declined ${job.title}`,
            description: "We won't show you this job again."
          });
        } else {
          this.toast({
            title: "Decline Failed",
            description: result.error || "Failed to decline job",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error handling swipe:", error);
      this.toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  
  // Handle when a card goes out of frame
  outOfFrame = (jobTitle: string, index: number) => {
    console.log(`${jobTitle} left the screen at index ${index}`);
    // Consider removing the job from the state here if performance is an issue
  };
  
  // Programmatically swipe a card
  swipe = async (dir: "left" | "right") => {
    const { currentIndex } = this.state;
    if (currentIndex < 0 || currentIndex >= this.state.jobs.length) return; // No more cards
    if (!this.childRefs[currentIndex]?.current) {
      console.warn("Card ref not available for swiping");
      return;
    }
    await this.childRefs[currentIndex].current.swipe(dir); // Swipe the current card
  };
  
  // Implement undo swipe functionality
  undoSwipe = () => {
    const { lastRemovedJob } = this.state;
    if (!lastRemovedJob) return;
    
    // Re-add the job to the state and update the index
    this.setState(prevState => {
      const newJobs = [...prevState.jobs];
      // Add the job back to the stack
      newJobs.splice(prevState.currentIndex + 1, 0, lastRemovedJob.job);
      
      return {
        jobs: newJobs,
        currentIndex: prevState.currentIndex + 1,
        lastRemovedJob: null
      };
    });
    
    this.toast({
      title: "Undo Swipe",
      description: `Brought back ${lastRemovedJob.job.title}. You can now re-decide.`
    });
  };
  
  // Helper function to get match score color
  getScoreColor = (score: number | null): string => {
    if (score === null || score === undefined) return "text-gray-400";
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };
  
  // Helper function to get human-readable match score label
  getScoreLabel = (score: number | null): string => {
    if (score === null || score === undefined) return "No match data";
    if (score >= 80) return "Strong Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Potential Match";
    return "Low Match";
  };
  
  render() {
    const { jobs, loading, error, currentIndex, lastRemovedJob, expandedJobId, isProcessingCV } = this.state;
    
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
          <h2 className="text-2xl font-semibold text-red-500 mb-4">Error Loading Jobs</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      );
    }
    
    return (
      <main className="min-h-screen container mx-auto py-8 flex flex-col items-center relative overflow-hidden">
        <h1 className="text-4xl font-bold mb-6 text-center">Job Opportunities</h1>
        <p className="text-gray-600 mb-2 text-center">Swipe right to apply, left to pass.</p>
        
        {/* CV Processing Warning */}
        {isProcessingCV && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 flex items-center gap-2 max-w-xl">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Your CV is still being processed</p>
              <p className="mt-1">
                Matches may not be fully accurate until processing is complete. Check back soon!
              </p>
            </div>
          </div>
        )}
        
        {/* How matching works tooltip */}
        <div className="mb-8">
          <div className="text-sm text-primary flex items-center gap-1 hover:underline cursor-help">
            <HelpCircle size={14} />
            <span>How matching works</span>
          </div>
          <div className="hidden">
            <h4 className="font-bold mb-2">How Job Matching Works</h4>
            <p className="text-sm text-gray-600 mb-2">
              Our AI-powered system matches your skills and experience with job requirements.
            </p>
            <ul className="text-xs space-y-1 list-disc pl-4">
              <li><span className="text-green-500 font-bold">80%+</span>: Strong match to your skills</li>
              <li><span className="text-blue-500 font-bold">60-79%</span>: Good match with some skill alignment</li>
              <li><span className="text-yellow-500 font-bold">40-59%</span>: Potential match worth exploring</li>
              <li><span className="text-red-500 font-bold">&lt;40%</span>: Limited match but still might be interesting</li>
            </ul>
          </div>
        </div>
        
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-8 text-center max-w-md">
            <Info className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No More Jobs</h2>
            <p className="text-gray-600 mb-6">
              You've gone through all available job matches. Check back later for new opportunities.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Matches
            </Button>
          </div>
        ) : (
          <div className="relative h-[480px] w-full max-w-md">
            {jobs.map((job, index) => (
              <div className="absolute" key={job.id}>
                <TinderCard
                  ref={this.childRefs[index]}
                  className="absolute cursor-grab"
                  onSwipe={(dir) => this.handleSwipe(dir, job, index)}
                  onCardLeftScreen={() => this.outOfFrame(job.title, index)}
                  preventSwipe={["up", "down"]}
                >
                  <div 
                    className={`bg-gray-900 p-6 w-[360px] h-[500px] rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col ${
                      expandedJobId === job.id ? 'max-h-none overflow-y-auto' : ''
                    }`}
                  >
                    {/* Avatar, Company & Location */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        {job.company_logo_url ? (
                          <img
                            src={job.company_logo_url}
                            alt={`${job.company_name} logo`}
                            className="w-10 h-10 object-contain rounded-full"
                          />
                        ) : (
                          <span className="text-lg font-medium text-purple-800">
                            {job.company_name ? job.company_name.charAt(0) : 'A'}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-base">{job.company_name}</h3>
                        <p className="text-sm text-gray-600">{job.location}</p>
                      </div>
                      <div className="ml-auto">
                        <div className={`${this.getScoreColor(job.match_score)} px-2 py-0.5 rounded-full text-xs font-medium bg-opacity-10 bg-current`}>
                          {job.match_score != null && <span className="text-white">{job.match_score}% </span>}
                        </div>
                      </div>
                    </div>

                    {/* Job Title & Subtitle */}
                    <div className="text-center mb-3">
                      <h2 className="text-xl font-medium mb-1">{job.title}</h2>
                      <p className="text-sm text-white-600">
                        {job.job_type || "Subtitle"}
                      </p>
                    </div>

                    {/* Job Description - Limited to 50 chars */}
                    <div className="mb-3">
                      <p className="text-sm text-white-700 leading-relaxed">
                        {job.description 
                          ? (job.description.length > 190 
                             ? job.description.substring(0, 190) + '...' 
                             : job.description)
                          : "No description provided."}
                      </p>
                    </div>

                    {/* Job Details */}
                    <div className="grid grid-cols-1 gap-1.5 mb-3">
                      {job.location && (
                        <div className="flex items-center gap-2 text-xs text-white-700">
                          <MapPin className="w-3 h-3" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      
                      {job.job_type && (
                        <div className="flex items-center gap-2 text-xs text-white-700">
                          <Briefcase className="w-3 h-3" />
                          <span>{job.job_type}</span>
                        </div>
                      )}
                      
                      {job.salary_range && (
                        <div className="flex items-center gap-2 text-xs text-white-700">
                          <DollarSign className="w-3 h-3" />
                          <span>{job.salary_range}</span>
                        </div>
                      )}
                      
                      {job.application_deadline && (
                        <div className="flex items-center gap-2 text-xs text-white-700">
                          <Calendar className="w-3 h-3" />
                          <span>Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Required Skills */}
                    {job.required_skills && job.required_skills.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium mb-1.5">Required Skills:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {job.required_skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  

                    {/* View Details Button */}
                    <div className="mt-auto pt-2">
                      <Link to={`/opportunities/${job.id}`} className="block w-full">
                        <Button variant="outline" className="w-full flex items-center justify-center text-sm">
                          View Full Details
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </TinderCard>
              </div>
            ))}
          </div>
        )}
        
        {/* Swipe controls */}
        {/* {jobs.length > 0 && (
          <div className="flex justify-center gap-4 mt-8">
            <Button
              onClick={() => this.swipe("left")}
              className="h-14 w-14 rounded-full bg-white text-red-500 border border-red-200 shadow-md hover:bg-red-50"
              variant="outline"
            >
              <X className="h-6 w-6" />
            </Button>
            
            <Button
              onClick={this.undoSwipe}
              className="h-14 w-14 rounded-full bg-white text-gray-500 border border-gray-200 shadow-md hover:bg-gray-50"
              variant="outline"
              disabled={!lastRemovedJob}
            >
              <Undo2 className="h-6 w-6" />
            </Button>
            
            <Button
              onClick={() => this.swipe("right")}
              className="h-14 w-14 rounded-full bg-white text-green-500 border border-green-200 shadow-md hover:bg-green-50"
              variant="outline"
            >
              <Check className="h-6 w-6" />
            </Button>
          </div>
        )} */}
      </main>
    );
  }
} 