import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../providers/AuthProvider';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { CompanyInfoForm } from '../components/employer/onboarding/CompanyInfoForm';
import { ContactDetailsForm } from '../components/employer/onboarding/ContactDetailsForm';
import { LogoUpload } from '../components/employer/onboarding/LogoUpload';
import { ReviewForm } from '../components/employer/onboarding/ReviewForm';
import { OnboardingCheckLayout } from '../components/layouts/OnboardingCheckLayout';
import { toast } from '../components/ui/toast-utils';
import { profileService } from '../lib/api/apiClient';

interface FormData {
  companyName: string;
  industry: string;
  companySize: string;
  description: string;
  website: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  logo: File | null;
  logoUrl: string;
}

interface EmployerOnboardingPageState {
  currentStep: number;
  formData: FormData;
  isLoading: boolean;
  isCompleted: boolean;
  error: string | null;
  onboardingStatus: {
    companyInfo: boolean;
    contactDetails: boolean;
    logo: boolean;
    review: boolean;
  };
}

export class EmployerOnboardingPage extends Component<{}, EmployerOnboardingPageState> {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  constructor(props: {}) {
    super(props);
    this.state = {
      currentStep: 0,
      formData: {
        companyName: '',
        industry: '',
        companySize: '',
        description: '',
        website: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        logo: null,
        logoUrl: ''
      },
      isLoading: false,
      isCompleted: false,
      error: null,
      onboardingStatus: {
        companyInfo: false,
        contactDetails: false,
        logo: false,
        review: false
      }
    };
  }

  async componentDidMount() {
    // Check if user is authenticated
    if (!this.context.isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to continue with employer onboarding",
        variant: "destructive"
      });
      this.setState({ error: 'Authentication required' });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 1000);
      return;
    }

    // Check if user has the employer role
    if (this.context.userRole !== 'EMPLOYER') {
      toast({
        title: "Access Denied",
        description: "Only employer accounts can access this page",
        variant: "destructive"
      });
      this.setState({ error: 'Access denied' });
      
      // Redirect to appropriate onboarding based on role
      setTimeout(() => {
        if (this.context.userRole === 'STUDENT') {
          window.location.href = '/onboarding/student';
        } else if (this.context.userRole === 'ADMIN') {
          window.location.href = '/onboarding/admin';
        } else {
          window.location.href = '/';
        }
      }, 1000);
      return;
    }

    try {
      // Check if onboarding is already completed
      if (this.context.onboardingCompleted) {
        console.log('Onboarding already completed, redirecting to employer dashboard');
        this.setState({ isCompleted: true });
        
        // Redirect to employer dashboard
        setTimeout(() => {
          window.location.href = '/employer/jobs';
        }, 500);
        return;
      }
      
      // Fetch current profile data if available
      try {
        const profileData = await profileService.getProfile();
        
        if (profileData) {
          // If onboarding is already completed, redirect to employer dashboard
          if (profileData.onboardingCompleted) {
            this.setState({ isCompleted: true });
            
            // Update context if needed
            if (!this.context.onboardingCompleted) {
              await this.context.updateOnboardingStatus(true);
            }
            
            // Redirect to employer dashboard
            setTimeout(() => {
              window.location.href = '/employer/jobs';
            }, 500);
            return;
          }
          
          // Pre-fill form data if partial onboarding exists
          const formData = {
            ...this.state.formData,
            companyName: profileData.companyName || '',
            industry: profileData.industry || '',
            companySize: profileData.companySize || '',
            description: profileData.description || '',
            website: profileData.website || '',
            contactName: profileData.contactName || this.context.user?.fullName || '',
            contactEmail: profileData.contactEmail || this.context.user?.email || '',
            contactPhone: profileData.contactPhone || '',
            address: profileData.address || '',
            city: profileData.city || '',
            state: profileData.state || '',
            zipCode: profileData.zipCode || '',
            country: profileData.country || '',
            logoUrl: profileData.logoUrl || ''
          };
          
          // Determine which steps are completed
          const onboardingStatus = {
            companyInfo: !!profileData.companyName && !!profileData.industry,
            contactDetails: !!profileData.contactName && !!profileData.contactEmail,
            logo: !!profileData.logoUrl,
            review: false
          };
          
          this.setState({
            formData,
            onboardingStatus,
            currentStep: this.getInitialStep(onboardingStatus)
          });
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        // Continue with new onboarding if there was an error fetching existing data
      }
    } catch (error) {
      console.error('Error in component initialization:', error);
    }
  }

  getInitialStep = (onboardingStatus: EmployerOnboardingPageState['onboardingStatus']) => {
    if (onboardingStatus.review) return 3;
    if (onboardingStatus.logo) return 2;
    if (onboardingStatus.contactDetails) return 1;
    return 0;
  };

  handleNextStep = () => {
    this.setState(prevState => ({
      currentStep: prevState.currentStep + 1
    }));
  };

  handlePrevStep = () => {
    this.setState(prevState => ({
      currentStep: prevState.currentStep - 1
    }));
  };

  handleCompanyInfoSubmit = async (data: Partial<FormData>) => {
    // Update form data
    this.setState(prevState => ({
      formData: { ...prevState.formData, ...data },
      isLoading: true
    }));
    
    try {
      // Save to API using the profile service
      await profileService.updateProfile(data);
      
      // Mark step as completed
      this.setState(prevState => ({
        isLoading: false,
        onboardingStatus: {
          ...prevState.onboardingStatus,
          companyInfo: true
        }
      }));
      
      // Proceed to next step
      this.handleNextStep();
    } catch (error) {
      console.error('Error saving company info:', error);
      this.setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to save company information'
      });
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to save company information',
        variant: "destructive"
      });
    }
  };

  handleContactDetailsSubmit = async (data: Partial<FormData>) => {
    // Update form data
    this.setState(prevState => ({
      formData: { ...prevState.formData, ...data },
      isLoading: true
    }));
    
    try {
      // Save to API using the profile service
      await profileService.updateProfile(data);
      
      // Mark step as completed
      this.setState(prevState => ({
        isLoading: false,
        onboardingStatus: {
          ...prevState.onboardingStatus,
          contactDetails: true
        }
      }));
      
      // Proceed to next step
      this.handleNextStep();
    } catch (error) {
      console.error('Error saving contact details:', error);
      this.setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to save contact details'
      });
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to save contact details',
        variant: "destructive"
      });
    }
  };

  handleLogoUpload = async (file: File | null, logoUrl: string) => {
    this.setState({ isLoading: true });
    
    try {
      // Update state with logo URL if provided
      if (logoUrl) {
        this.setState(prevState => ({
          formData: { ...prevState.formData, logoUrl },
          isLoading: false,
          onboardingStatus: {
            ...prevState.onboardingStatus,
            logo: true
          }
        }));
        this.handleNextStep();
        return;
      }
      
      // Skip API upload if no file (handle later with form submission)
      if (!file) {
        this.setState(prevState => ({
          isLoading: false,
          onboardingStatus: {
            ...prevState.onboardingStatus,
            logo: true
          }
        }));
        this.handleNextStep();
        return;
      }
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('logo', file);
      
      // Upload logo to API
      const response = await fetch('/api/employer/profile/logo-upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload company logo');
      }
      
      const data = await response.json();
      
      this.setState(prevState => ({
        formData: { ...prevState.formData, logoUrl: data.logoUrl },
        isLoading: false,
        onboardingStatus: {
          ...prevState.onboardingStatus,
          logo: true
        }
      }));
      
      // Proceed to next step
      this.handleNextStep();
    } catch (error) {
      console.error('Error uploading logo:', error);
      this.setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to upload company logo'
      });
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to upload company logo',
        variant: "destructive"
      });
    }
  };

  handleFinalSubmit = async () => {
    this.setState({ isLoading: true });
    
    try {
      // Submit final data and mark onboarding as complete
      await profileService.updateProfile({
        ...this.state.formData,
        onboardingCompleted: true
      });
      
      // Update the auth context to reflect completed onboarding
      await this.context.updateOnboardingStatus(true);
      
      this.setState({
        isLoading: false,
        isCompleted: true,
        onboardingStatus: {
          companyInfo: true,
          contactDetails: true,
          logo: true,
          review: true
        }
      });
      
      toast({
        title: "Onboarding Complete",
        description: "Your employer account is now ready to use!",
      });
      
      // Redirect will happen based on isCompleted state
    } catch (error) {
      console.error('Error completing onboarding:', error);
      this.setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to complete onboarding'
      });
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to complete onboarding',
        variant: "destructive"
      });
    }
  };

  renderStepContent = () => {
    const { currentStep, formData, isLoading } = this.state;
    
    switch (currentStep) {
      case 0:
        return (
          <CompanyInfoForm
            initialData={formData}
            onSubmit={this.handleCompanyInfoSubmit}
            isLoading={isLoading}
          />
        );
        
      case 1:
        return (
          <ContactDetailsForm
            initialData={formData}
            onSubmit={this.handleContactDetailsSubmit}
            onBack={this.handlePrevStep}
            isLoading={isLoading}
          />
        );
        
      case 2:
        return (
          <LogoUpload
            initialLogo={formData.logoUrl}
            onSubmit={this.handleLogoUpload}
            onBack={this.handlePrevStep}
            isLoading={isLoading}
          />
        );
        
      case 3:
        return (
          <ReviewForm
            formData={formData}
            onSubmit={this.handleFinalSubmit}
            onBack={this.handlePrevStep}
            isLoading={isLoading}
          />
        );
        
      default:
        return null;
    }
  };

  render() {
    const { error, isCompleted, currentStep } = this.state;
    
    if (error === 'Authentication required') {
      return <Navigate to="/auth/login" state={{ returnTo: '/onboarding/employer' }} />;
    }
    
    if (error === 'Access denied') {
      return <Navigate to="/profile" />;
    }
    
    if (isCompleted) {
      return <Navigate to="/employer/jobs" />;
    }
    
    const steps = [
      { id: 'company-info', title: 'Company Info' },
      { id: 'contact-details', title: 'Contact Details' },
      { id: 'logo', title: 'Company Logo' },
      { id: 'review', title: 'Review & Submit' }
    ];
    
    return (
      <OnboardingCheckLayout>
        <div className="container mx-auto py-8 px-4">
          <Card className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Employer Account Setup</h1>
            
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                {steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index <= currentStep ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-sm mt-2">{step.title}</span>
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 ${
                        index < currentStep ? 'bg-gray-600' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            
            {this.renderStepContent()}
          </Card>
        </div>
      </OnboardingCheckLayout>
    );
  }
} 