import React, { Component, ChangeEvent, FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import profileService from '@/lib/api/profileService';
import { AuthContext } from '@/providers/AuthProvider';

interface EmployerProfileData {
    companyName?: string;
    companySize?: string;
    industry?: string;
    companyWebsite?: string;
    companyDescription?: string;
    companyAddress?: string;
    contactPersonName?: string;
    contactPersonPosition?: string;
    contactPersonEmail?: string;
    contactPersonPhone?: string;
    companyLogoUrl?: string;
    hasCompletedOnboarding?: boolean;
}

interface EmployerOnboardingState {
  formData: EmployerProfileData;
  logoFile: File | null;
  error: string | null;
  isLoading: boolean;
  redirectTo: string | null;
}

export class EmployerOnboardingPage extends Component<{}, EmployerOnboardingState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  constructor(props: {}) {
    super(props);
    this.state = {
      formData: {
    companyName: '',
    companySize: '',
    industry: '',
    companyWebsite: '',
    companyDescription: '',
    companyAddress: '',
    contactPersonName: '',
    contactPersonPosition: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
      },
      logoFile: null,
      error: null,
      isLoading: false,
      redirectTo: null
    };
  }

  componentDidMount() {
    this.fetchProfile();
  }

  fetchProfile = async () => {
    const { user } = this.context || {};
    
    if (!user) {
      this.setState({ redirectTo: '/login' });
      return;
    }

        try {
      this.setState({ isLoading: true });
          const profileData = await profileService.getCurrentEmployerProfile();
      
          if (profileData) {
        this.setState({
          formData: {
                companyName: profileData.companyName || '',
                companySize: profileData.companySize || '',
                industry: profileData.industry || '',
                companyWebsite: profileData.companyWebsite || '',
                companyDescription: profileData.companyDescription || '',
                companyAddress: profileData.companyAddress || '',
                contactPersonName: profileData.contactPersonName || '',
                contactPersonPosition: profileData.contactPersonPosition || '',
                contactPersonEmail: profileData.contactPersonEmail || '',
                contactPersonPhone: profileData.contactPersonPhone || '',
                companyLogoUrl: profileData.companyLogoUrl || undefined,
            hasCompletedOnboarding: profileData.hasCompletedOnboarding
          }
            });
        
            // if (profileData.hasCompletedOnboarding) {
        //   this.setState({ redirectTo: '/employer/dashboard' });
            // }
          }
        } catch (err: any) {
      if (err.response?.status !== 404) { // Ignore 404 if profile doesn't exist yet
        this.setState({
          error: err.response?.data?.message || 'Failed to load employer profile data.'
        });
            }
        } finally {
      this.setState({ isLoading: false });
      }
    };

  handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: value
      }
    }));
  };

  handleLogoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      this.setState({ logoFile: e.target.files[0] });
    }
  };

  handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    this.setState({ error: null, isLoading: true });
    
    try {
      await profileService.completeEmployerOnboarding(this.state.formData);
      
      if (this.state.logoFile) {
        await profileService.uploadEmployerLogo(this.state.logoFile);
      }
      
      this.setState({ redirectTo: '/employer/jobs' });
    } catch (err: any) {
      this.setState({
        error: err.response?.data?.message || 'Onboarding failed. Please try again.'
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    const { formData, logoFile, error, isLoading, redirectTo } = this.state;
    const { user } = this.context || {};

    if (redirectTo) {
      return <Navigate to={redirectTo} />;
    }

  if (!user) {
      return <Navigate to="/login" />;
  }

  if (isLoading && !formData.companyName) { 
    return <div className="min-h-screen flex items-center justify-center"><p>Loading profile...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">Employer Onboarding</h2>
          <form onSubmit={this.handleSubmit} className="space-y-6">
          
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Company Information</h3>
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
              <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={this.handleChange} required 
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Size</label>
                <select name="companySize" id="companySize" value={formData.companySize} onChange={this.handleChange} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                </select>
            </div>
            <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Industry</label>
                <input type="text" name="industry" id="industry" value={formData.industry} onChange={this.handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Website</label>
              <input type="url" name="companyWebsite" id="companyWebsite" value={formData.companyWebsite} onChange={this.handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div>
            <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Description</label>
              <textarea name="companyDescription" id="companyDescription" rows={4} value={formData.companyDescription} onChange={this.handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
          </div>

          <div>
            <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Address</label>
              <input type="text" name="companyAddress" id="companyAddress" value={formData.companyAddress} onChange={this.handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          
          <div>
            <label htmlFor="logoFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Logo</label>
              <input type="file" name="logoFile" id="logoFile" onChange={this.handleLogoFileChange} accept="image/*"
                   className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-800 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-700"/>
            {formData.companyLogoUrl && <div className="mt-2"><img src={formData.companyLogoUrl} alt="Company Logo" className="h-20 w-auto rounded"/></div>}
          </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">Contact Person</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="contactPersonName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Name</label>
                <input type="text" name="contactPersonName" id="contactPersonName" value={formData.contactPersonName} onChange={this.handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label htmlFor="contactPersonPosition" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Position</label>
                <input type="text" name="contactPersonPosition" id="contactPersonPosition" value={formData.contactPersonPosition} onChange={this.handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>
            
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="contactPersonEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Email</label>
                <input type="email" name="contactPersonEmail" id="contactPersonEmail" value={formData.contactPersonEmail} onChange={this.handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label htmlFor="contactPersonPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Phone</label>
                <input type="tel" name="contactPersonPhone" id="contactPersonPhone" value={formData.contactPersonPhone} onChange={this.handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 dark:bg-red-900/30 dark:border-red-500">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

            <div className="flex justify-end">
              <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {isLoading ? 'Saving...' : formData.hasCompletedOnboarding ? 'Update Profile' : 'Complete Onboarding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  }
} 