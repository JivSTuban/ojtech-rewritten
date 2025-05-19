import React, { Component, ChangeEvent, FormEvent, createRef } from 'react';
import { Navigate } from 'react-router-dom';
import profileService from '@/lib/api/profileService';
import { AuthContext } from '@/providers/AuthProvider';

// Define an interface for the student profile data from the backend
interface StudentProfileData {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    university?: string;
    major?: string;
    graduationYear?: number;
    bio?: string;
    skills?: string[]; // Assuming skills are stored as an array of strings
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    cvUrl?: string;
    cvFilename?: string;
    hasCompletedOnboarding?: boolean;
}

interface StudentOnboardingState {
  formData: StudentProfileData;
  cvFile: File | null;
  error: string | null;
  isLoading: boolean;
  skillsInput: string;
  redirectTo: string | null;
}

export class StudentOnboardingPage extends Component<{}, StudentOnboardingState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  constructor(props: {}) {
    super(props);
    this.state = {
      formData: {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    university: '',
    major: '',
    graduationYear: undefined,
    bio: '',
    skills: [],
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
      },
      cvFile: null,
      error: null,
      isLoading: false,
      skillsInput: '',
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
          const profileData = await profileService.getCurrentStudentProfile();
      
          if (profileData) {
        this.setState({
          formData: {
              firstName: profileData.firstName || '',
              lastName: profileData.lastName || '',
              phoneNumber: profileData.phoneNumber || '',
              university: profileData.university || '',
              major: profileData.major || '',
              graduationYear: profileData.graduationYear || undefined,
              bio: profileData.bio || '',
              skills: profileData.skills || [],
              githubUrl: profileData.githubUrl || '',
              linkedinUrl: profileData.linkedinUrl || '',
              portfolioUrl: profileData.portfolioUrl || '',
            cvUrl: profileData.cvUrl,
            cvFilename: profileData.cvFilename
          },
            });

            if (profileData.skills && profileData.skills.length > 0) {
          this.setState({
            skillsInput: profileData.skills.join(', ')
          });
            }
        
            if (profileData.hasCompletedOnboarding) {
              // Optionally redirect if onboarding is already complete, or allow updates
          // this.setState({ redirectTo: '/profile' });
            }
          }
        } catch (err: any) {
      if (err.response?.status !== 404) { // Ignore 404 if profile doesn't exist yet
        this.setState({
          error: err.response?.data?.message || 'Failed to load profile data.'
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
        [name]: name === 'graduationYear' ? (value ? parseInt(value) : undefined) : value
      }
    }));
  };

  handleSkillsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const skillsInput = e.target.value;
    const skills = skillsInput.split(',').map(skill => skill.trim()).filter(skill => skill);
    
    this.setState({
      skillsInput,
      formData: {
        ...this.state.formData,
        skills
      }
    });
  };

  handleCvFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      this.setState({ cvFile: e.target.files[0] });
    }
  };

  handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    this.setState({ error: null, isLoading: true });
    
    try {
      await profileService.completeStudentOnboarding(this.state.formData);
      
      if (this.state.cvFile) {
        await profileService.uploadStudentCv(this.state.cvFile);
      }
      
      this.setState({ redirectTo: '/profile' });
    } catch (err: any) {
      this.setState({
        error: err.response?.data?.message || 'Onboarding failed. Please try again.'
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    const { formData, cvFile, error, isLoading, skillsInput, redirectTo } = this.state;
    const { user } = this.context || {};

    if (redirectTo) {
      return <Navigate to={redirectTo} />;
    }

  if (!user) {
      return <Navigate to="/login" />;
  }

  if (isLoading && !formData.firstName) { // Show full page loading only on initial load
    return <div className="min-h-screen flex items-center justify-center"><p>Loading profile...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">Student Onboarding</h2>
          <form onSubmit={this.handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={this.handleChange} required 
                     className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={this.handleChange} required
                     className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
              <input type="tel" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={this.handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="university" className="block text-sm font-medium text-gray-700 dark:text-gray-300">University/School</label>
                  <input type="text" name="university" id="university" value={formData.university} onChange={this.handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label htmlFor="major" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Major/Course</label>
                  <input type="text" name="major" id="major" value={formData.major} onChange={this.handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>
          
          <div>
            <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expected Graduation Year</label>
              <input type="number" name="graduationYear" id="graduationYear" value={formData.graduationYear || ''} onChange={this.handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio/About Me</label>
              <textarea name="bio" id="bio" rows={4} value={formData.bio} onChange={this.handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Skills (comma-separated)</label>
              <input type="text" name="skills" id="skills" value={skillsInput} onChange={this.handleSkillsChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          
          <div>
            <label htmlFor="cvFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload CV (PDF preferred)</label>
              <input type="file" name="cvFile" id="cvFile" onChange={this.handleCvFileChange} accept=".pdf,.doc,.docx"
                   className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-800 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-700"/>
            {formData.cvUrl && <p className="text-xs text-gray-500 mt-1">Current CV: <a href={formData.cvUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{formData.cvFilename || 'View CV'}</a></p>}
          </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">Professional Links (Optional)</h3>
          
          <div>
            <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">GitHub URL</label>
              <input type="url" name="githubUrl" id="githubUrl" value={formData.githubUrl} onChange={this.handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn URL</label>
              <input type="url" name="linkedinUrl" id="linkedinUrl" value={formData.linkedinUrl} onChange={this.handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
              <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio/Website URL</label>
              <input type="url" name="portfolioUrl" id="portfolioUrl" value={formData.portfolioUrl} onChange={this.handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
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