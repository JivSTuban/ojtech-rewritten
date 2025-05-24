import React, { Component, createRef, RefObject } from "react";
import TinderCard from "react-tinder-card";
import { Loader2, Check, X, Briefcase, MapPin, Calendar, Undo2, DollarSign, Info, HelpCircle, ChevronRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { JobCard } from "../components/jobs/JobCard";
import { Button } from "../components/ui/Button";
import jobApplicationService from "../lib/api/jobApplicationService";

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
  viewed: boolean;
}

// Mock data for jobs - will be used as fallback if API fails
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
    match_score: 92,
    viewed: false
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
    match_score: 88,
    viewed: false
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
    match_score: 75,
    viewed: false
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
    match_score: 50,
    viewed: false
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
    match_score: 85,
    viewed: false
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
    match_score: 35,
    viewed: false
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
      // For now we'll just set isProcessing to false
      // This would be replaced with a real API call in the future
      this.setState({ isProcessingCV: false });
    } catch (error) {
      console.error("Error checking CV processing status:", error);
      this.setState({ isProcessingCV: false });
    }
  };
  
  // Fetch jobs for the current user using the API
  fetchJobs = async () => {
    this.setState({ loading: true, error: null });
    
    try {
      // Call the job matching API to get matched jobs
      const matchedJobsData = await jobApplicationService.getStudentJobMatches();
      
      if (matchedJobsData && Array.isArray(matchedJobsData)) {
        // Track seen job IDs to prevent duplicates
        const seenIds = new Set<string>();
        
        // Map API response to our JobWithMatchScore interface
        const matchedJobs: JobWithMatchScore[] = matchedJobsData
          .filter(match => !match.viewed) // Filter out viewed jobs
          .map((match: any) => {
            // Handle the nested structure from the API response
            const job = match.job || {};
            const employer = job.employer || {};
            
            // Ensure unique job ID
            let jobId = job.id;
            if (seenIds.has(jobId)) {
              jobId = `${jobId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            }
            seenIds.add(jobId);
            
            return {
              id: jobId,
              employer_id: employer.id,
              title: job.title,
              description: job.description,
              company_name: employer.companyName,
              company_logo_url: employer.logoUrl,
              location: job.location,
              job_type: job.employmentType,
              salary_range: job.minSalary && job.maxSalary ? 
                `${job.currency || '$'}${job.minSalary.toLocaleString()} - ${job.currency || '$'}${job.maxSalary.toLocaleString()}` : 
                null,
              required_skills: job.requiredSkills ? job.requiredSkills.split(',') : [],
              preferred_skills: null,
              application_deadline: null,
              created_at: job.postedAt || new Date().toISOString(),
              updated_at: null,
              status: "active",
              is_active: true,
              match_score: match.matchScore,
              viewed: match.viewed
            };
          });
        
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
        // Fallback to mock data if API response is not as expected
        console.warn("API response format unexpected, using mock data");
        this.setState({
          jobs: MOCK_JOBS,
          currentIndex: MOCK_JOBS.length - 1,
          loading: false
        });
        
        // Initialize refs for mock data
        this.childRefs = Array(MOCK_JOBS.length)
          .fill(0)
          .map(() => createRef<any>());
      }
    } catch (err) {
      console.error("Fetch jobs error:", err);
      // Fallback to mock data on error
      console.warn("Error fetching jobs, using mock data");
      this.setState({
        jobs: MOCK_JOBS,
        currentIndex: MOCK_JOBS.length - 1,
        loading: false
      });
      
      // Initialize refs for mock data
      this.childRefs = Array(MOCK_JOBS.length)
        .fill(0)
        .map(() => createRef<any>());
    }
  };
  
  // Find jobs using simple search
  findJobs = async () => {
    this.setState({ loading: true, error: null });
    
    try {
      // Call the simple find jobs API
      const jobsData = await jobApplicationService.findJobs();
      
      if (jobsData && Array.isArray(jobsData)) {
        // Map API response to our JobWithMatchScore interface
        const mappedJobs: JobWithMatchScore[] = jobsData.map((job: any) => {
          const employer = job.employer || {};
          
          return {
            id: job.id,
            employer_id: employer.id || '',
            title: job.title || 'Untitled Position',
            description: job.description || null,
            company_name: employer.companyName || null,
            company_logo_url: employer.logoUrl || null,
            location: job.location || null,
            job_type: job.employmentType || null,
            salary_range: job.minSalary && job.maxSalary ? 
              `${job.currency || '$'}${job.minSalary.toLocaleString()} - ${job.currency || '$'}${job.maxSalary.toLocaleString()}` : 
              null,
            required_skills: job.requiredSkills ? job.requiredSkills.split(',') : [],
            preferred_skills: null,
            application_deadline: null,
            created_at: job.postedAt || new Date().toISOString(),
            updated_at: null,
            status: "active",
            is_active: true,
            match_score: null,
            viewed: false
          };
        });
        
        // Set jobs and update current index
        this.setState({
          jobs: mappedJobs,
          currentIndex: mappedJobs.length - 1,
          loading: false
        });
        
        // Initialize refs
        this.childRefs = Array(mappedJobs.length)
          .fill(0)
          .map(() => createRef<any>());
      } else {
        // Fallback to mock data if API response is not as expected
        console.warn("API response format unexpected, using mock data");
        this.setState({
          jobs: MOCK_JOBS,
          currentIndex: MOCK_JOBS.length - 1,
          loading: false
        });
        
        // Initialize refs for mock data
        this.childRefs = Array(MOCK_JOBS.length)
          .fill(0)
          .map(() => createRef<any>());
      }
    } catch (err) {
      console.error("Find jobs error:", err);
      // Fallback to mock data on error
      console.warn("Error finding jobs, using mock data");
      this.setState({
        jobs: MOCK_JOBS,
        currentIndex: MOCK_JOBS.length - 1,
        loading: false
      });
      
      // Initialize refs for mock data
      this.childRefs = Array(MOCK_JOBS.length)
        .fill(0)
        .map(() => createRef<any>());
    }
  };
  
  // Apply for a job using the API
  applyForJob = async (jobId: string) => {
    try {
      // This uses the endpoint /api/applications/apply/{jobID} as defined in jobApplicationService
      const response = await jobApplicationService.applyForJob(jobId, {});
      console.log("Job application submitted successfully:", response);
      return { success: true, data: { letterGenerated: true } };
    } catch (error) {
      console.error("Error applying for job:", error);
      return { success: false, error: "Failed to apply for job" };
    }
  };
  
  // Decline a job
  declineJob = async (jobId: string) => {
    try {
      // This would be replaced with a real API call in the future
      console.log(`Declined job ${jobId}`);
      return { success: true, data: {} };
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
  undoSwipe = async () => {
    const { lastRemovedJob } = this.state;
    if (!lastRemovedJob) return;
    
    // Re-add the job to the state and update the index
    this.setState(prevState => {
      const newJobs = [...prevState.jobs];
      // Reset the viewed status and ensure unique ID by adding timestamp
      const jobToRestore = {
        ...lastRemovedJob.job, 
        viewed: false,
        id: `${lastRemovedJob.job.id}-${Date.now()}`
      };
      // Add the job back to the stack
      newJobs.splice(prevState.currentIndex + 1, 0, jobToRestore);
      
      return {
        jobs: newJobs,
        currentIndex: prevState.currentIndex + 1,
        lastRemovedJob: null
      };
    });
    
    // Try to reset the viewed status on the server
    try {
      // This would need a new API endpoint to unmark a job as viewed
      // For now, we just update the UI state
      console.log("Would reset viewed status for job:", lastRemovedJob.job.id);
    } catch (error) {
      console.error("Error resetting viewed status:", error);
    }
    
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
        <h1 className="text-4xl font-bold mb-6 text-center">New Job Matches</h1>
        <p className="text-gray-600 mb-2 text-center">Swipe right to apply, left to pass.</p>
        
        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Button onClick={this.fetchJobs}>
            Find Matched Jobs
          </Button>
          <Button onClick={this.findJobs} variant="outline">
            Find More Jobs
          </Button>
        </div>
        
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
            <h2 className="text-2xl font-semibold mb-2">No New Job Matches</h2>
            <p className="text-gray-600 mb-6">
              You've viewed all available job matches. Check back later for new opportunities.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Matches
            </Button>
          </div>
        ) : (
          <div className="relative h-[480px] w-full max-w-md">
            {jobs.map((job, index) => (
              <div className="absolute" key={`${job.id}-${index}`}>
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
                          {job.match_score != null && <span className="text-white">{job.match_score.toFixed(2)}% </span>}
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
                              key={`${skill}-${i}`}
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
      </main>
    );
  }
} 