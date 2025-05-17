import React, { Component } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { AuthContext } from '../providers/AuthProvider';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Label } from '../components/ui/Label';
import { FileDropInput } from '../components/ui/FileDropInput';
import { Spinner } from '../components/ui/Spinner';
import { toast } from '../components/ui/toast-utils';

interface JobApplicationProps {
  jobId: string;
}

interface JobApplicationState {
  isLoading: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
  error: string | null;
  job: any;
  formData: {
    coverLetter: string;
    resumeFile: File | null;
    additionalInfo: string;
    contactEmail: string;
    contactPhone: string;
  };
  validation: {
    coverLetter: string | null;
    resumeFile: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
  };
}

class JobApplicationPageComponent extends Component<JobApplicationProps, JobApplicationState> {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  constructor(props: JobApplicationProps) {
    super(props);
    this.state = {
      isLoading: true,
      isSubmitting: false,
      isSubmitted: false,
      error: null,
      job: null,
      formData: {
        coverLetter: '',
        resumeFile: null,
        additionalInfo: '',
        contactEmail: '',
        contactPhone: ''
      },
      validation: {
        coverLetter: null,
        resumeFile: null,
        contactEmail: null,
        contactPhone: null
      }
    };
  }

  async componentDidMount() {
    const { jobId } = this.props;
    
    // Check if user is authenticated
    if (!this.context.session) {
      toast({
        title: "Authentication Required",
        description: "Please login to apply for this job",
        variant: "destructive"
      });
      this.setState({ error: 'Authentication required' });
      return;
    }

    // Set email from user profile if available
    if (this.context.user) {
      this.setState(prevState => ({
        formData: {
          ...prevState.formData,
          contactEmail: this.context.user?.email || ''
        }
      }));
    }
    
    try {
      // Fetch job details
      const response = await fetch(`/api/jobs/${jobId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch job details');
      }
      
      const jobData = await response.json();
      this.setState({
        isLoading: false,
        job: jobData
      });
    } catch (error) {
      console.error('Error fetching job:', error);
      this.setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load job details'
      });
    }
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: value
      }
    }));
  };

  handleFileChange = (file: File | null) => {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        resumeFile: file
      },
      validation: {
        ...prevState.validation,
        resumeFile: null
      }
    }));
  };

  validateForm = () => {
    const { formData } = this.state;
    const validation: JobApplicationState['validation'] = {
      coverLetter: null,
      resumeFile: null,
      contactEmail: null,
      contactPhone: null
    };
    
    let isValid = true;

    if (!formData.coverLetter.trim()) {
      validation.coverLetter = 'Cover letter is required';
      isValid = false;
    }

    if (!formData.resumeFile) {
      validation.resumeFile = 'Resume file is required';
      isValid = false;
    }

    if (!formData.contactEmail.trim()) {
      validation.contactEmail = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      validation.contactEmail = 'Invalid email format';
      isValid = false;
    }

    if (!formData.contactPhone.trim()) {
      validation.contactPhone = 'Phone number is required';
      isValid = false;
    }

    this.setState({ validation });
    return isValid;
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }
    
    this.setState({ isSubmitting: true });
    
    try {
      const { formData, job } = this.state;
      const { jobId } = this.props;
      
      // Create form data for file upload
      const submitData = new FormData();
      submitData.append('jobId', jobId);
      submitData.append('coverLetter', formData.coverLetter);
      submitData.append('additionalInfo', formData.additionalInfo);
      submitData.append('contactEmail', formData.contactEmail);
      submitData.append('contactPhone', formData.contactPhone);
      
      if (formData.resumeFile) {
        submitData.append('resume', formData.resumeFile);
      }
      
      // Submit application
      const response = await fetch('/api/job-applications', {
        method: 'POST',
        body: submitData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit application');
      }
      
      this.setState({ 
        isSubmitting: false,
        isSubmitted: true
      });
      
      toast({
        title: "Application Submitted!",
        description: "Your application has been successfully submitted.",
        variant: "success"
      });
    } catch (error) {
      console.error('Submission error:', error);
      this.setState({
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'Failed to submit application'
      });
      
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : 'Failed to submit application',
        variant: "destructive"
      });
    }
  };

  render() {
    const { isLoading, isSubmitting, isSubmitted, error, job, formData, validation } = this.state;
    
    if (error === 'Authentication required') {
      return <Navigate to="/auth/login" state={{ returnTo: `/opportunities/apply/${this.props.jobId}` }} />;
    }
    
    if (isLoading) {
      return (
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center min-h-[50vh]">
            <Spinner size="lg" />
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="container mx-auto py-8 px-4">
          <Card className="p-6 max-w-3xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Job</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.href = '/opportunities'}>
                Back to Opportunities
              </Button>
            </div>
          </Card>
        </div>
      );
    }
    
    if (isSubmitted) {
      return (
        <div className="container mx-auto py-8 px-4">
          <Card className="p-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="rounded-full bg-green-100 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Application Submitted!</h2>
              <p className="text-gray-600 mb-6">
                Your application for <span className="font-semibold">{job?.title}</span> has been successfully submitted.
                The employer will review your application and contact you if they're interested.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => window.location.href = '/opportunities'}>
                  Browse More Opportunities
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/track'}>
                  Track Your Applications
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }
    
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-6 max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Apply for {job?.title}</h1>
            <p className="text-gray-600">at {job?.company}</p>
          </div>
          
          <form onSubmit={this.handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter</Label>
              <Textarea 
                id="coverLetter"
                name="coverLetter"
                placeholder="Introduce yourself and explain why you're a good fit for this position..."
                rows={6}
                value={formData.coverLetter}
                onChange={this.handleInputChange}
                className={validation.coverLetter ? "border-red-500" : ""}
              />
              {validation.coverLetter && (
                <p className="text-red-500 text-sm">{validation.coverLetter}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Resume</Label>
              <FileDropInput 
                onChange={this.handleFileChange}
                currentFile={formData.resumeFile}
                acceptedFileTypes={['.pdf', '.doc', '.docx']}
                maxSizeMB={5}
              />
              {validation.resumeFile && (
                <p className="text-red-500 text-sm">{validation.resumeFile}</p>
              )}
              <p className="text-sm text-gray-500">
                Accepted formats: PDF, DOC, DOCX. Max size: 5MB
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email Address</Label>
              <Input 
                id="contactEmail"
                name="contactEmail"
                type="email"
                placeholder="your@email.com"
                value={formData.contactEmail}
                onChange={this.handleInputChange}
                className={validation.contactEmail ? "border-red-500" : ""}
              />
              {validation.contactEmail && (
                <p className="text-red-500 text-sm">{validation.contactEmail}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone Number</Label>
              <Input 
                id="contactPhone"
                name="contactPhone"
                type="tel"
                placeholder="Your phone number"
                value={formData.contactPhone}
                onChange={this.handleInputChange}
                className={validation.contactPhone ? "border-red-500" : ""}
              />
              {validation.contactPhone && (
                <p className="text-red-500 text-sm">{validation.contactPhone}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
              <Textarea 
                id="additionalInfo"
                name="additionalInfo"
                placeholder="Any additional details you'd like to share..."
                rows={3}
                value={formData.additionalInfo}
                onChange={this.handleInputChange}
              />
            </div>
            
            <div className="pt-4 flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2" />
                    Submitting...
                  </>
                ) : "Submit Application"}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }
}

// Wrapper to get URL parameters from React Router
export const JobApplicationPage = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <Navigate to="/opportunities" />;
  }
  
  return <JobApplicationPageComponent jobId={id} />;
}; 