import React, { Component } from 'react';
import { AuthContext } from '../providers/AuthProvider';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { toast } from '../components/ui/toast-utils';
import { CheckCircle, Circle, Upload, AlertCircle } from 'lucide-react';
import { profileService, resumeService } from '../lib/api/apiClient';
import { OnboardingFeedback } from '../components/survey/OnboardingFeedback';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isComplete: boolean;
  isRequired: boolean;
  component: React.ReactNode;
}

interface StudentOnboardingState {
  currentStep: number;
  steps: OnboardingStep[];
  loading: boolean;
  profileData: {
    fullName: string;
    bio: string;
    skills: string[];
    education: string;
    location: string;
    jobPreferences: string;
  };
  resumeFile: File | null;
  uploadLoading: boolean;
  progress: number;
  showFeedbackSurvey: boolean;
  initialized: boolean;
}

export class StudentOnboardingPage extends Component<{}, StudentOnboardingState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;
  
  fileInputRef = React.createRef<HTMLInputElement>();
  
  constructor(props: {}) {
    super(props);
    
    const initialProfileData = {
      fullName: '',
      bio: '',
      skills: [],
      education: '',
      location: '',
      jobPreferences: ''
    };
    
    // Initialize with placeholder steps
    this.state = {
      currentStep: 0,
      loading: true,
      profileData: initialProfileData,
      resumeFile: null,
      uploadLoading: false,
      progress: 0,
      showFeedbackSurvey: false,
      initialized: false,
      steps: [
        {
          id: 'profile',
          title: 'Complete your profile',
          description: 'Tell employers about yourself',
          isComplete: false,
          isRequired: true,
          component: <div>Loading...</div>
        },
        {
          id: 'resume',
          title: 'Upload your resume',
          description: 'Add your CV for better job matching',
          isComplete: false,
          isRequired: true,
          component: <div>Loading...</div>
        },
        {
          id: 'preferences',
          title: 'Set job preferences',
          description: 'Customize your job search',
          isComplete: false,
          isRequired: true,
          component: <div>Loading...</div>
        },
        {
          id: 'tour',
          title: 'Take a guided tour',
          description: 'Learn how to use the platform',
          isComplete: false,
          isRequired: false,
          component: <div>Loading...</div>
        }
      ]
    };
  }
  
  componentDidMount() {
    // Check authentication with a short delay to ensure context is fully loaded
    setTimeout(() => {
      // Only initialize if we're authenticated
      if (this.context.isAuthenticated) {
        // Check if onboarding is already completed
        if (this.context.onboardingCompleted) {
          console.log('Onboarding already completed, redirecting to student dashboard');
          window.location.href = '/track';
          return;
        }
        
        // Check if user has the appropriate role
        if (this.context.userRole !== 'STUDENT') {
          console.log('User is not a student, redirecting to appropriate onboarding');
          
          if (this.context.userRole === 'EMPLOYER') {
            window.location.href = '/onboarding/employer';
          } else if (this.context.userRole === 'ADMIN') {
            window.location.href = '/onboarding/admin';
          } else {
            window.location.href = '/';
          }
          return;
        }
        
        // Initialize steps with proper components
        this.initializeSteps();
        
        // Load user profile data if available
        this.loadProfileData();
      } else {
        console.log('User not authenticated, skipping initialization');
        this.setState({ loading: false });
        
        // Show a toast indicating authentication is required
        toast({
          title: "Authentication Required",
          description: "Please log in to access this page",
          variant: "destructive"
        });
        
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 1000);
      }
    }, 100); // Short delay to ensure context is initialized
  }
  
  initializeSteps = () => {
    const steps = [
      {
        id: 'profile',
        title: 'Complete your profile',
        description: 'Tell employers about yourself',
        isComplete: false,
        isRequired: true,
        component: this.renderProfileStep()
      },
      {
        id: 'resume',
        title: 'Upload your resume',
        description: 'Add your CV for better job matching',
        isComplete: false,
        isRequired: true,
        component: this.renderResumeStep()
      },
      {
        id: 'preferences',
        title: 'Set job preferences',
        description: 'Customize your job search',
        isComplete: false,
        isRequired: true,
        component: this.renderPreferencesStep()
      },
      {
        id: 'tour',
        title: 'Take a guided tour',
        description: 'Learn how to use the platform',
        isComplete: false,
        isRequired: false,
        component: this.renderTourStep()
      }
    ];
    
    this.setState({ steps, initialized: true });
  }
  
  loadProfileData = async () => {
    try {
      this.setState({ loading: true });
      
      // Check if user is authenticated
      if (!this.context.isAuthenticated) {
        console.log('User not authenticated, skipping profile load');
        this.setState({ loading: false });
        return;
      }
      
      // Attempt to get existing profile data
      const data = await profileService.getProfile();
      
      if (data) {
        // Update profile data with values from API
        this.setState({
          profileData: {
            fullName: data.fullName || this.context.user?.fullName || '',
            bio: data.bio || '',
            skills: data.skills || [],
            education: data.education || '',
            location: data.location || '',
            jobPreferences: data.jobPreferences || ''
          }
        });
        
        // Update step completion status based on loaded data
        const updatedSteps = [...this.state.steps];
        if (data.fullName && data.bio && data.location) {
          updatedSteps[0].isComplete = true;
        }
        
        // Check resume status
        try {
          const resumeData = await resumeService.getResumeData();
          if (resumeData) {
            updatedSteps[1].isComplete = true;
          }
        } catch (error) {
          // Resume not yet uploaded
          console.log('No resume uploaded yet');
        }
        
        if (data.jobPreferences) {
          updatedSteps[2].isComplete = true;
        }
        
        this.setState({ steps: updatedSteps }, this.calculateProgress);
      }
    } catch (error: any) {
      console.error('Error loading profile data:', error);
      
      // If we get a 401 or 403 error, the user might not be authenticated correctly
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to continue",
          variant: "destructive"
        });
        
        // Sign the user out
        this.context.signOut();
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 1500);
      }
    } finally {
      this.setState({ loading: false });
    }
  };
  
  calculateProgress = () => {
    const { steps } = this.state;
    
    // Only consider required steps for progress calculation
    const requiredSteps = steps.filter(step => step.isRequired);
    const completedRequiredSteps = requiredSteps.filter(step => step.isComplete);
    
    const progress = requiredSteps.length > 0 
      ? Math.round((completedRequiredSteps.length / requiredSteps.length) * 100) 
      : 0;
    
    this.setState({ progress });
  };
  
  handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    this.setState(prevState => ({
      profileData: {
        ...prevState.profileData,
        [name]: value
      }
    }));
  };
  
  handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size and type
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Resume file must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      if (file.type !== 'application/pdf') {
        toast({
          title: "Error",
          description: "Only PDF files are accepted",
          variant: "destructive"
        });
        return;
      }
      
      this.setState({ resumeFile: file });
    }
  };
  
  triggerFileInput = () => {
    if (this.fileInputRef.current) {
      this.fileInputRef.current.click();
    }
  };
  
  saveProfile = async () => {
    try {
      this.setState({ loading: true });
      
      const { profileData } = this.state;
      
      // Validate required fields
      if (!profileData.fullName || !profileData.bio || !profileData.location) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      
      // Save profile data
      await profileService.updateProfile(profileData);
      
      // Mark profile step as complete
      const updatedSteps = [...this.state.steps];
      updatedSteps[0].isComplete = true;
      
      this.setState({ steps: updatedSteps }, this.calculateProgress);
      
      toast({
        title: "Success",
        description: "Profile information saved successfully"
      });
      
      // Navigate to next step
      this.goToNextStep();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile information",
        variant: "destructive"
      });
    } finally {
      this.setState({ loading: false });
    }
  };
  
  uploadResume = async () => {
    const { resumeFile } = this.state;
    
    if (!resumeFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }
    
    try {
      this.setState({ uploadLoading: true });
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('resume', resumeFile);
      
      // Upload resume
      await resumeService.uploadResume(formData);
      
      // Mark resume step as complete
      const updatedSteps = [...this.state.steps];
      updatedSteps[1].isComplete = true;
      
      this.setState({ 
        steps: updatedSteps,
        resumeFile: null
      }, this.calculateProgress);
      
      toast({
        title: "Success",
        description: "Resume uploaded successfully"
      });
      
      // Navigate to next step
      this.goToNextStep();
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Error",
        description: "Failed to upload resume",
        variant: "destructive"
      });
    } finally {
      this.setState({ uploadLoading: false });
    }
  };
  
  savePreferences = async () => {
    try {
      this.setState({ loading: true });
      
      const { profileData } = this.state;
      
      // Validate required field
      if (!profileData.jobPreferences) {
        toast({
          title: "Error",
          description: "Please fill in your job preferences",
          variant: "destructive"
        });
        return;
      }
      
      // Save profile data with job preferences
      await profileService.updateProfile(profileData);
      
      // Mark preferences step as complete
      const updatedSteps = [...this.state.steps];
      updatedSteps[2].isComplete = true;
      
      this.setState({ steps: updatedSteps }, this.calculateProgress);
      
      toast({
        title: "Success",
        description: "Job preferences saved successfully"
      });
      
      // Navigate to next step
      this.goToNextStep();
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save job preferences",
        variant: "destructive"
      });
    } finally {
      this.setState({ loading: false });
    }
  };
  
  completeTour = () => {
    // Mark tour step as complete
    const updatedSteps = [...this.state.steps];
    updatedSteps[3].isComplete = true;
    
    this.setState({ steps: updatedSteps }, this.calculateProgress);
    
    toast({
      title: "Success",
      description: "Tour completed"
    });
  };
  
  completeOnboarding = async () => {
    try {
      this.setState({ loading: true });
      
      // Check if all required steps are complete
      const requiredSteps = this.state.steps.filter(step => step.isRequired);
      const allRequiredComplete = requiredSteps.every(step => step.isComplete);
      
      if (!allRequiredComplete) {
        toast({
          title: "Error",
          description: "Please complete all required steps before continuing",
          variant: "destructive"
        });
        return;
      }
      
      // Update onboarding status both locally and in the context
      try {
        // Use the context method to update onboarding status
        await this.context.updateOnboardingStatus(true);
        
        toast({
          title: "Congratulations!",
          description: "You've completed the onboarding process"
        });
        
        // Show feedback survey instead of redirecting
        this.setState({ showFeedbackSurvey: true, loading: false });
      } catch (error) {
        console.error('Error updating onboarding status in context:', error);
        
        // Fallback to direct API call if context method fails
        await profileService.updateProfile({
          ...this.state.profileData,
          onboardingCompleted: true
        });
        
        // Update local state and show survey
        this.setState({ 
          showFeedbackSurvey: true, 
          loading: false 
        });
        
        toast({
          title: "Congratulations!",
          description: "You've completed the onboarding process"
        });
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding",
        variant: "destructive"
      });
      this.setState({ loading: false });
    }
  };
  
  handleFeedbackClose = () => {
    this.setState({ showFeedbackSurvey: false });
    
    // Redirect to track page after closing the survey
    window.location.href = '/track';
  };
  
  goToStep = (stepIndex: number) => {
    this.setState({ currentStep: stepIndex });
  };
  
  goToNextStep = () => {
    const { currentStep, steps } = this.state;
    if (currentStep < steps.length - 1) {
      this.setState({ currentStep: currentStep + 1 });
    }
  };
  
  goToPreviousStep = () => {
    const { currentStep } = this.state;
    if (currentStep > 0) {
      this.setState({ currentStep: currentStep - 1 });
    }
  };
  
  renderProfileStep() {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
          <Input 
            id="fullName" 
            name="fullName" 
            placeholder="John Doe"
            value={this.state.profileData.fullName}
            onChange={this.handleInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio">Bio <span className="text-red-500">*</span></Label>
          <Textarea 
            id="bio" 
            name="bio"
            placeholder="Tell us about yourself and your career goals..."
            value={this.state.profileData.bio}
            onChange={this.handleInputChange}
            className="min-h-[100px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
          <Input 
            id="location" 
            name="location" 
            placeholder="City, Country"
            value={this.state.profileData.location}
            onChange={this.handleInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="education">Education</Label>
          <Input 
            id="education" 
            name="education" 
            placeholder="University, Degree"
            value={this.state.profileData.education}
            onChange={this.handleInputChange}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button 
            onClick={this.saveProfile}
            disabled={this.state.loading}
          >
            {this.state.loading ? "Saving..." : "Save & Continue"}
          </Button>
        </div>
      </div>
    );
  }
  
  renderResumeStep() {
    return (
      <div className="space-y-4">
        <div className="p-6 border-2 border-dashed rounded-lg text-center">
          <input
            ref={this.fileInputRef}
            type="file"
            accept=".pdf"
            onChange={this.handleFileSelect}
            className="hidden"
          />
          
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          
          <h3 className="mt-2 text-sm font-semibold">Upload your resume (PDF)</h3>
          <p className="mt-1 text-xs text-gray-500">Drag and drop or click to browse</p>
          
          {this.state.resumeFile ? (
            <div className="mt-4 p-2 bg-gray-100 rounded text-sm flex justify-between items-center">
              <span>{this.state.resumeFile.name}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => this.setState({ resumeFile: null })}
              >
                Remove
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={this.triggerFileInput}
            >
              Select File
            </Button>
          )}
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Why upload your resume?</h4>
              <ul className="mt-1 text-xs text-blue-700 list-disc list-inside space-y-1">
                <li>Get matched with jobs that fit your experience</li>
                <li>Stand out to employers with your complete profile</li>
                <li>Apply to jobs faster with pre-filled information</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={this.goToPreviousStep}
          >
            Back
          </Button>
          
          <Button 
            onClick={this.uploadResume}
            disabled={!this.state.resumeFile || this.state.uploadLoading}
          >
            {this.state.uploadLoading ? "Uploading..." : "Upload & Continue"}
          </Button>
        </div>
      </div>
    );
  }
  
  renderPreferencesStep() {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="jobPreferences">
            Job Preferences <span className="text-red-500">*</span>
          </Label>
          <Textarea 
            id="jobPreferences" 
            name="jobPreferences"
            placeholder="Describe your ideal job, industry, and preferred work arrangement (remote, hybrid, onsite)..."
            value={this.state.profileData.jobPreferences}
            onChange={this.handleInputChange}
            className="min-h-[150px]"
          />
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={this.goToPreviousStep}
          >
            Back
          </Button>
          
          <Button 
            onClick={this.savePreferences}
            disabled={this.state.loading}
          >
            {this.state.loading ? "Saving..." : "Save & Continue"}
          </Button>
        </div>
      </div>
    );
  }
  
  renderTourStep() {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-lg border">
          <div className="p-4">
            <h3 className="text-lg font-medium">Platform Tour</h3>
            <p className="text-sm text-gray-500 mt-1">
              Learn how to use our platform to find and apply for jobs.
            </p>
          </div>
          
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <div className="text-center p-4">
              <h4 className="font-medium">Tour Video</h4>
              <p className="text-sm text-gray-500">
                Video content would be displayed here
              </p>
            </div>
          </div>
          
          <div className="p-4 border-t bg-gray-50">
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Finding job opportunities</span>
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Applying to jobs</span>
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Tracking your applications</span>
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Updating your profile</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={this.goToPreviousStep}
          >
            Back
          </Button>
          
          <Button onClick={this.completeTour}>
            Complete Tour
          </Button>
        </div>
      </div>
    );
  }
  
  render() {
    const { currentStep, steps, progress, showFeedbackSurvey, loading, initialized } = this.state;
    
    // Show loading state while initializing
    if (loading && !initialized) {
      return (
        <div className="container mx-auto py-8 px-4 h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-2">Loading your profile...</p>
          </div>
        </div>
      );
    }
    
    const currentStepData = steps[currentStep];
    const allRequiredComplete = steps
      .filter(step => step.isRequired)
      .every(step => step.isComplete);
    
    return (
      <div className="container mx-auto py-8 px-4">
        {showFeedbackSurvey && (
          <OnboardingFeedback onClose={this.handleFeedbackClose} />
        )}
        
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Welcome to OJTech</h1>
            <p className="text-gray-500">Complete your profile to get started finding opportunities</p>
          </div>
          
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Onboarding Progress</span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Steps sidebar */}
            <div className="w-full md:w-1/3">
              <Card className="p-4">
                <h2 className="font-semibold mb-4">Steps</h2>
                <ul className="space-y-3">
                  {steps.map((step, index) => (
                    <li key={step.id}>
                      <button
                        onClick={() => this.goToStep(index)}
                        className={`w-full flex items-center p-2 rounded-md transition-colors ${
                          currentStep === index ? 'bg-primary/10 text-primary' : ''
                        }`}
                      >
                        {step.isComplete ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400 mr-2" />
                        )}
                        <div className="text-left">
                          <span className="font-medium block text-sm">{step.title}</span>
                          <span className="text-xs text-gray-500">{step.description}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
                
                {/* Complete onboarding button */}
                <div className="mt-6">
                  <Button 
                    className="w-full"
                    disabled={!allRequiredComplete || this.state.loading}
                    onClick={this.completeOnboarding}
                  >
                    {this.state.loading ? "Processing..." : "Complete Onboarding"}
                  </Button>
                  {!allRequiredComplete && (
                    <p className="text-xs text-amber-600 mt-2">
                      Complete all required steps to continue
                    </p>
                  )}
                </div>
              </Card>
            </div>
            
            {/* Current step content */}
            <div className="w-full md:w-2/3">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">{currentStepData.title}</h2>
                <p className="text-gray-500 mb-6">{currentStepData.description}</p>
                
                {steps[currentStep].component}
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }
} 