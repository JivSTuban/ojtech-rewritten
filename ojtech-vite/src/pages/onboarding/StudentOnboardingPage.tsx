import React, { Component, ChangeEvent, FormEvent, createRef } from 'react';
import { Navigate } from 'react-router-dom';
import profileService from '../../lib/api/profileService';
import { AuthContext } from '../../providers/AuthProvider';
import { toast } from '../../components/ui/toast-utils';

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
    // const { user } = this.context || {};
    
    // if (!user) {
    //   this.setState({ redirectTo: '/login' });
    //   return;
    // }

    try {
      this.setState({ isLoading: true, error: null });
      
      // Show a toast that we're loading the form
      toast.default({
        title: "Loading Profile Data",
        description: "Please wait while we prepare your onboarding form."
      });
      
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
            cvFilename: profileData.cvFilename,
            hasCompletedOnboarding: profileData.hasCompletedOnboarding
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
          toast.success({
            title: "Profile Loaded",
            description: "Your profile is already complete - you can make updates here."
          });
        }
      }
    } catch (err: any) {
      console.error("Error in fetchProfile:", err);
      
      let errorMsg = "Failed to load profile data. Please try again.";
      
      if (err.response) {
        if (err.response.status === 404) {
          // This is expected for new users, no need to show error
          console.log("No profile found - this is normal for new users");
          toast.default({
            title: "Let's Get Started",
            description: "Please complete your student profile to continue."
          });
        } else {
          errorMsg = err.response.data?.message || errorMsg;
          toast.destructive({
            title: "Error Loading Profile",
            description: errorMsg
          });
          this.setState({ error: errorMsg });
        }
      } else if (err.request) {
        errorMsg = "No response from server. Please check your connection.";
        toast.destructive({
          title: "Connection Error",
          description: errorMsg
        });
        this.setState({ error: errorMsg });
      } else {
        toast.destructive({
          title: "Error",
          description: errorMsg
        });
        this.setState({ error: errorMsg });
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
      // Show a loading toast
      toast.default({
        title: "Saving Your Profile",
        description: "Please wait while we save your information."
      });
      
      await profileService.completeStudentOnboarding(this.state.formData);
      
      if (this.state.cvFile) {
        await profileService.uploadStudentCv(this.state.cvFile);
      }
      
      // Show success toast
      toast.success({
        title: "Onboarding Complete",
        description: "Your student profile has been saved successfully."
      });
      
      this.setState({ redirectTo: '/profile' });
    } catch (err: any) {
      console.error("Error in handleSubmit:", err);
      
      let errorMsg = "Onboarding failed. Please try again.";
      
      if (err.response) {
        errorMsg = err.response.data?.message || errorMsg;
        toast.destructive({
          title: "Error Saving Profile",
          description: errorMsg
        });
      } else if (err.request) {
        errorMsg = "No response from server. Please check your connection.";
        toast.destructive({
          title: "Connection Error",
          description: errorMsg
        });
      } else {
        toast.destructive({
          title: "Error",
          description: errorMsg
        });
      }
      
      this.setState({ error: errorMsg });
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

  // if (!user) {
  //     return <Navigate to="/login" />;
  // }

  if (isLoading && !formData.firstName) { // Show full page loading only on initial load
    return <div className="min-h-screen flex items-center justify-center"><p>Loading profile...</p></div>;
  }

  return (
    <div className="min-h-screen  py-8 px-4">
      <div className="max-w-3xl mx-auto bg-black/90 backdrop-blur-sm p-8 rounded-lg shadow-xl border border-gray-800">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 -mx-8 -mt-8 px-8 py-6 mb-8 border-b border-gray-800">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Complete Your Profile
          </h2>
          <p className="text-gray-400 mt-2">
            Tell us about yourself to help connect you with the best opportunities.
          </p>
        </div>
          <form onSubmit={this.handleSubmit} className="space-y-8">
            <div className="bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Personal Information
              </h3>
          
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={formData.firstName}
                    onChange={this.handleChange}
                    required
                    className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-md px-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={this.handleChange}
                    required
                    className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-md px-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Your last name"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Contact Information
              </h3>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={this.handleChange}
                  required
                  className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-md px-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Your phone number"
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Educational Background
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="university" className="block text-sm font-medium text-gray-300 mb-2">
                      University/School <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="university"
                      id="university"
                      value={formData.university}
                      onChange={this.handleChange}
                      required
                      className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-md px-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="Your university or school"
                    />
                  </div>
                  <div>
                    <label htmlFor="major" className="block text-sm font-medium text-gray-300 mb-2">
                      Major/Course <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="major"
                      id="major"
                      value={formData.major}
                      onChange={this.handleChange}
                      required
                      className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-md px-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="Your field of study"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-300 mb-2">
                    Expected Graduation Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="graduationYear"
                    id="graduationYear"
                    value={formData.graduationYear || ''}
                    onChange={this.handleChange}
                    required
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 6}
                    className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-md px-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder={`${new Date().getFullYear()} - ${new Date().getFullYear() + 6}`}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                About You
              </h3>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                  Bio <span className="text-red-500">*</span>
                  <span className="text-gray-500 text-xs ml-2">(Tell us about yourself, your interests, and career goals)</span>
                </label>
                <textarea
                  name="bio"
                  id="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={this.handleChange}
                  required
                  className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-md px-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                  placeholder="Share your story, interests, and what drives you..."
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Skills & Expertise
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-300 mb-2">
                    Skills <span className="text-red-500">*</span>
                    <span className="text-gray-500 text-xs ml-2">(Separate with commas)</span>
                  </label>
                  <input
                    type="text"
                    name="skills"
                    id="skills"
                    value={skillsInput}
                    onChange={this.handleSkillsChange}
                    required
                    className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-md px-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="e.g. JavaScript, React, Node.js"
                  />
                </div>

                {formData.skills && formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Resume/CV
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="cvFile" className="block text-sm font-medium text-gray-300 mb-2">
                    Upload CV <span className="text-red-500">*</span>
                    <span className="text-gray-500 text-xs ml-2">(PDF format preferred)</span>
                  </label>
                  <input
                    type="file"
                    name="cvFile"
                    id="cvFile"
                    onChange={this.handleCvFileChange}
                    accept=".pdf,.doc,.docx"
                    className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-md px-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30"
                  />
                </div>

                {formData.cvUrl && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Current CV:</span>
                    <a
                      href={formData.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
                    >
                      {formData.cvFilename || 'View CV'}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Professional Links
                <span className="text-gray-500 text-sm font-normal ml-2">(Optional)</span>
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      name="githubUrl"
                      id="githubUrl"
                      value={formData.githubUrl}
                      onChange={this.handleChange}
                      className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-md pl-10 pr-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="https://github.com/yourusername"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <span>@</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    LinkedIn
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      name="linkedinUrl"
                      id="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={this.handleChange}
                      className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-md pl-10 pr-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <span>in/</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                    </svg>
                    Portfolio Website
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      name="portfolioUrl"
                      id="portfolioUrl"
                      value={formData.portfolioUrl}
                      onChange={this.handleChange}
                      className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-md pl-10 pr-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="https://yourportfolio.com"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <span>🌐</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 animate-shake">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-red-500">Error Saving Profile</h4>
                    <p className="text-sm text-red-400 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  px-6 py-2.5 rounded-lg font-medium text-white
                  transition-all duration-300 shadow-lg
                  ${isLoading 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-900/20'
                  }
                `}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  formData.hasCompletedOnboarding ? 'Update Profile' : 'Complete Onboarding'
                )}
              </button>
            </div>
        </form>
      </div>
    </div>
  );
  }
}
