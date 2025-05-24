import React, { Component, ChangeEvent, createRef } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { AuthContext } from '../providers/AuthProvider';
import { Loader2, Upload, Download, Github, Linkedin, Globe, Pencil, Code, FileUp, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import cvGeneratorService from '../lib/api/cvGeneratorService';
import EducationEditModal from '../components/profile/EducationEditModal';
import { useToast } from '../components/ui/use-toast';
import { ToastContext } from '../providers/ToastContext';
import { ToastProps } from '../components/ui/use-toast';
import { toast } from '../components/ui/toast-utils';

// Add type definitions at the top of the file
interface User {
  id: string;
  roles: string[];
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  fetchUserProfile?: () => Promise<void>;
  // Add other context properties as needed
}

interface ProfilePageProps {
  // Add any props if needed
}

interface ProfilePageState {
  studentProfile: any | null;
  employerProfile: any | null;
  isEditingEducation: boolean;
  isEditingExperience: boolean;
  isEditingCertification: boolean;
  isEditingSkills: boolean;
  isEditingBio: boolean;
  loading: boolean;
  currentTab: string;
  skills: string[];
  isEducationModalOpen: boolean;
}

// New data structure interfaces
interface WorkExperience {
  id?: string;
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

interface Certification {
  id?: string;
  name: string;
  issuer: string;
  dateReceived?: string;
  expiryDate?: string;
  credentialUrl?: string;
}

interface GitHubProject {
  name: string;
  url: string;
  description?: string;
  technologies?: string[];
  stars?: number;
  forks?: number;
}

// Student profile data structure
interface StudentProfileData {
  id?: number;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  location?: string;
  address?: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  bio?: string;
  skills?: string[];
  cvUrl?: string;
  cvFilename?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  hasCompletedOnboarding?: boolean;
  experiences?: WorkExperience[];
  certifications?: Certification[];
  githubProjects?: GitHubProject[];
}

// Employer profile data structure
interface EmployerProfileData {
  id?: number;
  companyName: string;
  companySize?: string;
  industry?: string;
  companyWebsite?: string;
  companyDescription?: string;
  companyLogoUrl?: string;
  companyAddress?: string;
  contactPersonName?: string;
  contactPersonPosition?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  verified?: boolean;
  hasCompletedOnboarding?: boolean;
}

// Component to display student profile
const StudentProfileDisplay: React.FC<{ profile: StudentProfileData, email: string, username: string }> = ({ profile, email, username }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold">{profile.firstName} {profile.lastName} ({username})</h3>
    <p><strong>Email:</strong> {email}</p>
    {profile.phoneNumber && <p><strong>Phone:</strong> {profile.phoneNumber}</p>}
    {profile.location && (
      <p className="flex items-center gap-2">
        <strong>Location:</strong>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {profile.location}
        </span>
      </p>
    )}
    {profile.address && (
      <p className="flex items-center gap-2">
        <strong>Address:</strong>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {profile.address}
        </span>
      </p>
    )}
    
    {/* Education Section */}
    <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
      <h4 className="text-lg font-medium mb-2">Education</h4>
    {profile.university && <p><strong>University:</strong> {profile.university}</p>}
    {profile.major && <p><strong>Major:</strong> {profile.major}</p>}
    {profile.graduationYear && <p><strong>Graduation Year:</strong> {profile.graduationYear}</p>}
    </div>
    
    {/* Bio Section */}
    {profile.bio && (
      <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium mb-2">About Me</h4>
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <p className="italic">{profile.bio}</p>
        </div>
      </div>
    )}
    
    {/* Skills Section */}
    {profile.skills && profile.skills.length > 0 && (
      <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium mb-2">Skills</h4>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill: string, index: number) => (
            <span 
              key={index}
              className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    )}
    
    {/* Work Experience Section */}
    {profile.experiences && profile.experiences.length > 0 && (
      <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium mb-2">Work Experience</h4>
        {profile.experiences.map((exp: WorkExperience, index: number) => (
          <div key={index} className="work-item mb-4">
            <h5 className="font-medium">{exp.title}</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {exp.company} • {exp.location}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {exp.startDate} - {exp.endDate || 'Present'}
            </p>
            <p className="mt-2">{exp.description}</p>
          </div>
        ))}
      </div>
    )}
    
    {/* Certifications Section */}
    {profile.certifications && profile.certifications.length > 0 && (
      <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium mb-2">Certifications</h4>
        {profile.certifications.map((cert: Certification, index: number) => (
          <div key={index} className="certification-item mb-4">
            <h5 className="font-medium">{cert.name}</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {cert.issuer}
              {cert.dateReceived && ` • ${new Date(cert.dateReceived).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`}
            </p>
            {cert.credentialUrl && (
              <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
                View Credential
              </a>
            )}
          </div>
        ))}
      </div>
    )}
    
    {/* GitHub Projects */}
    {profile.githubProjects && profile.githubProjects.length > 0 && (
      <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium mb-2">Projects</h4>
        {profile.githubProjects.map((project: GitHubProject, index: number) => (
          <div key={index} className="project-item mb-4">
            <h5 className="font-medium">
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                {project.name}
              </a>
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{project.description}</p>
            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {project.technologies.map((tech: string, techIndex: number) => (
                  <span key={techIndex} className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )}
    
    {/* Links */}
    <div className="flex space-x-4 mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
      {profile.githubUrl && (
        <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center">
          <Github className="h-4 w-4 mr-1" /> GitHub
        </a>
      )}
      {profile.linkedinUrl && (
        <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center">
          <Linkedin className="h-4 w-4 mr-1" /> LinkedIn
        </a>
      )}
      {profile.portfolioUrl && (
        <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center">
          <Globe className="h-4 w-4 mr-1" /> Portfolio
        </a>
      )}
    </div>
    
    <Link to="/onboarding/student" className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-500">Edit Profile</Link>
  </div>
);

// Component to display employer profile
const EmployerProfileDisplay: React.FC<{ profile: EmployerProfileData, email: string, username: string }> = ({ profile, email, username }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold">{profile.companyName} ({username})</h3>
    {profile.companyLogoUrl && <img src={profile.companyLogoUrl} alt={`${profile.companyName} logo`} className="h-24 w-auto rounded my-2" />}
    <p><strong>Contact Email (User):</strong> {email}</p>
    {profile.verified && <p className="text-green-600 dark:text-green-400 font-semibold">Verified Employer</p>}
    {profile.industry && <p><strong>Industry:</strong> {profile.industry}</p>}
    {profile.companySize && <p><strong>Company Size:</strong> {profile.companySize}</p>}
    {profile.companyWebsite && (
      <p>
        <strong>Website:</strong> 
        <a href={profile.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline ml-1">
          {profile.companyWebsite}
        </a>
      </p>
    )}
    {profile.companyDescription && <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded"><p>{profile.companyDescription}</p></div>}
    {profile.companyAddress && <p><strong>Address:</strong> {profile.companyAddress}</p>}
    <h4 className="text-md font-semibold pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">Contact Person</h4>
    {profile.contactPersonName && <p><strong>Name:</strong> {profile.contactPersonName}</p>}
    {profile.contactPersonPosition && <p><strong>Position:</strong> {profile.contactPersonPosition}</p>}
    {profile.contactPersonEmail && <p><strong>Email:</strong> {profile.contactPersonEmail}</p>}
    {profile.contactPersonPhone && <p><strong>Phone:</strong> {profile.contactPersonPhone}</p>}
    <Link to="/onboarding/employer" className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-500">Edit Company Profile</Link>
  </div>
);

// Create a toast wrapper component to use hooks in class component
const withToast = (WrappedComponent: typeof Component) => {
  return function WithToastWrapper(props: any) {
    const { toast } = useToast();
    return <WrappedComponent {...props} toast={toast} />;
  };
};

export class ProfilePage extends Component<ProfilePageProps, ProfilePageState> {
  declare context: AuthContextType;
  static contextType = AuthContext;
  
  private readonly API_BASE_URL: string;
  
  constructor(props: ProfilePageProps) {
    super(props);
    this.API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    
    // Ensure API URL is properly set
    console.log('Profile page using API base URL:', this.API_BASE_URL);
    
    this.state = {
      studentProfile: null,
      employerProfile: null,
      isEditingEducation: false,
      isEditingExperience: false,
      isEditingCertification: false,
      isEditingSkills: false,
      isEditingBio: false,
      loading: true,
      currentTab: 'info',
      skills: [],
      isEducationModalOpen: false
    };
  }
  
  componentDidMount() {
    this.loadUserProfile();
  }
  
  // Get the token from localStorage or context
  getAuthToken = (): string | null => {
    // First try from context
    const { user } = this.context || {};
    if (user?.accessToken) {
      return user.accessToken;
    }
    
    // Then try from localStorage as standalone token
    const token = localStorage.getItem('token');
    if (token) {
      return token;
    }
    
    // Finally, try to parse from the user object in localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData?.accessToken) {
          return userData.accessToken;
        }
      } catch (e) {
        console.error('Error parsing user data from localStorage:', e);
      }
    }
    
    return null;
  };
  
  // Load user profile data
  loadUserProfile = async () => {
    try {
      const { user, fetchUserProfile } = this.context || {};
      
      if (!user) {
        console.log("User not found in context, attempting to refresh");
        // Instead of immediately logging out, try to refresh the user profile
        try {
          // Call the fetchUserProfile method from AuthContext to refresh authentication
          if (fetchUserProfile) {
            await fetchUserProfile();
            // After refreshing, check again
            const refreshedUser = this.context?.user;
            if (!refreshedUser) {
              console.log("Still not authenticated after refresh, redirecting to login");
              window.location.href = '/login';
              return;
            }
          } else {
            window.location.href = '/login';
            return;
          }
        } catch (refreshError) {
          console.error("Failed to refresh user data:", refreshError);
          window.location.href = '/login';
          return;
        }
      }
      
      const token = this.getAuthToken();
      if (!token) {
        console.log("No token found anywhere, redirecting to login");
        window.location.href = '/login';
        return;
      }
      
      // Determine if the user is a student or employer
      const currentUser = user || (this.context && this.context.user);
      const isStudent = currentUser?.roles?.includes('ROLE_STUDENT');
      const isEmployer = currentUser?.roles?.includes('ROLE_EMPLOYER');
      
      if (isStudent) {
        try {
          await this.loadStudentProfile(token);
        } catch (profileError) {
          console.error('Error loading student profile:', profileError);
          // Don't log out immediately for profile errors
          // The profile might not exist yet, but authentication could still be valid
        }
      } else if (isEmployer) {
        try {
          await this.loadEmployerProfile(token);
        } catch (profileError) {
          console.error('Error loading employer profile:', profileError);
          // Don't log out immediately for profile errors
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Don't redirect to login here - just show an error state
    } finally {
      this.setState({ loading: false });
    }
  };
  
  // Load student profile
  loadStudentProfile = async (token: string) => {
    try {
      console.log('Attempting to load student profile data');
      
      // Try student-profiles/me first, which has the most complete data
      const response = await axios.get(`${this.API_BASE_URL}/student-profiles/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data) {
        console.log('Student profile loaded:', response.data);
        console.log('Raw university data:', response.data.university, 'Type:', typeof response.data.university);
        console.log('Raw bio data:', response.data.bio, 'Type:', typeof response.data.bio);
        
        // Check for null or undefined fields
        const fields = ['university', 'major', 'graduationYear', 'bio', 'skills', 'experiences', 'certifications'];
        fields.forEach(field => {
          console.log(`Field ${field}:`, response.data[field], 'Type:', typeof response.data[field]);
        });
        
        // Parse GitHub projects if they come as a string
        let githubProjects = response.data.githubProjects;
        if (typeof githubProjects === 'string') {
          try {
            githubProjects = JSON.parse(githubProjects);
          } catch (e) {
            console.error('Error parsing GitHub projects JSON:', e);
            githubProjects = [];
          }
        }
        
        // Create a properly formatted student profile object with safe defaults
        // Handle the case where bio and university might be in the parent Profile object
        const profileData: StudentProfileData = {
          id: response.data.id || null,
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          phoneNumber: response.data.phoneNumber || '',
          location: response.data.location || '',
          address: response.data.address || '',
          // Special handling for fields that might be inherited from the parent Profile class
          university: response.data.university || '',  
          major: response.data.major || '',
          graduationYear: response.data.graduationYear || null,
          bio: response.data.bio || '',
          linkedinUrl: response.data.linkedinUrl || '',
          githubUrl: response.data.githubUrl || '',
          portfolioUrl: response.data.portfolioUrl || '',
          hasCompletedOnboarding: response.data.hasCompletedOnboarding || false,
          skills: Array.isArray(response.data.skills) ? response.data.skills : [],
          experiences: Array.isArray(response.data.experiences) ? response.data.experiences : [],
          certifications: Array.isArray(response.data.certifications) ? response.data.certifications : [],
          githubProjects: Array.isArray(githubProjects) ? githubProjects : []
        };
        
        console.log('Processed profile data:', profileData);
        
        this.setState({ 
          studentProfile: profileData,
          skills: Array.isArray(response.data.skills) ? response.data.skills : []
        }, () => {
          console.log('State updated with profile:', this.state.studentProfile);
        });
      }
    } catch (error: any) {
      console.error('Error loading student profile (primary):', error);
      
      // If unauthorized (401/403), try to refresh the token and retry
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        try {
          const { fetchUserProfile } = this.context || {};
          if (fetchUserProfile) {
            await fetchUserProfile();
          console.log('Auth context refreshed, retrying profile load');
          } else {
            console.log('No fetchUserProfile method available in context');
          }
          
          // Get the new token and retry
          const newToken = this.getAuthToken();
          if (newToken) {
            const retryResponse = await axios.get(`${this.API_BASE_URL}/student-profiles/me`, {
              headers: {
                'Authorization': `Bearer ${newToken}`
              }
            });
            
            if (retryResponse.data) {
              console.log('Retry profile response:', retryResponse.data);
              console.log('Retry university data:', retryResponse.data.university, 'Type:', typeof retryResponse.data.university);
              console.log('Retry bio data:', retryResponse.data.bio, 'Type:', typeof retryResponse.data.bio);
              
              // Parse GitHub projects if they come as a string
              let githubProjects = retryResponse.data.githubProjects;
              if (typeof githubProjects === 'string') {
                try {
                  githubProjects = JSON.parse(githubProjects);
                } catch (e) {
                  console.error('Error parsing GitHub projects JSON in retry:', e);
                  githubProjects = [];
                }
              }
              
              const profileData: StudentProfileData = {
                id: retryResponse.data.id || null,
                firstName: retryResponse.data.firstName || '',
                lastName: retryResponse.data.lastName || '',
                phoneNumber: retryResponse.data.phoneNumber || '',
                location: retryResponse.data.location || '',
                address: retryResponse.data.address || '',
                // Special handling for bio and university which might come from the parent Profile class
                university: retryResponse.data.university || '',
                major: retryResponse.data.major || '',
                graduationYear: retryResponse.data.graduationYear || null,
                bio: retryResponse.data.bio || '',
                linkedinUrl: retryResponse.data.linkedinUrl || '',
                githubUrl: retryResponse.data.githubUrl || '',
                portfolioUrl: retryResponse.data.portfolioUrl || '',
                hasCompletedOnboarding: retryResponse.data.hasCompletedOnboarding || false,
                skills: Array.isArray(retryResponse.data.skills) ? retryResponse.data.skills : [],
                experiences: Array.isArray(retryResponse.data.experiences) ? retryResponse.data.experiences : [],
                certifications: Array.isArray(retryResponse.data.certifications) ? retryResponse.data.certifications : [],
                githubProjects: Array.isArray(githubProjects) ? githubProjects : []
              };
              
              console.log('Processed retry profile data:', profileData);
              
              this.setState({ 
                studentProfile: profileData,
                skills: Array.isArray(retryResponse.data.skills) ? retryResponse.data.skills : []
              }, () => {
                console.log('State updated with retry profile:', this.state.studentProfile);
              });
              return;
            }
          }
        } catch (retryError) {
          console.error('Failed to refresh token and retry:', retryError);
        }
      }
      
      // If 404 errors, try a fallback to the profiles/me endpoint
      if (error.response && error.response.status === 404) {
        try {
          console.log('Student profile not found, trying fallback endpoint');
          const fallbackResponse = await axios.get(`${this.API_BASE_URL}/profiles/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (fallbackResponse.data) {
            console.log('Fallback profile loaded:', fallbackResponse.data);
            console.log('Fallback university data:', fallbackResponse.data.university, 'Type:', typeof fallbackResponse.data.university);
            console.log('Fallback bio data:', fallbackResponse.data.bio, 'Type:', typeof fallbackResponse.data.bio);
            
            // Parse GitHub projects if they come as a string
            let githubProjects = fallbackResponse.data.githubProjects;
            if (typeof githubProjects === 'string') {
              try {
                githubProjects = JSON.parse(githubProjects);
              } catch (e) {
                console.error('Error parsing GitHub projects JSON in fallback:', e);
                githubProjects = [];
              }
            }
            
            // Convert the generic profile data to student profile format with safe defaults
            const profileData: StudentProfileData = {
              id: fallbackResponse.data.id || null,
              firstName: fallbackResponse.data.firstName || '',
              lastName: fallbackResponse.data.lastName || '',
              phoneNumber: fallbackResponse.data.phoneNumber || '',
              location: fallbackResponse.data.location || '',
              address: fallbackResponse.data.address || '',
              // Special handling for bio and university which might be defined directly in the profile
              university: fallbackResponse.data.university || '',
              major: fallbackResponse.data.major || '',
              graduationYear: fallbackResponse.data.graduationYear || null,
              bio: fallbackResponse.data.bio || '',
              linkedinUrl: fallbackResponse.data.linkedinUrl || '',
              githubUrl: fallbackResponse.data.githubUrl || '',
              portfolioUrl: fallbackResponse.data.portfolioUrl || '',
              hasCompletedOnboarding: fallbackResponse.data.hasCompletedOnboarding || false,
              skills: Array.isArray(fallbackResponse.data.skills) ? fallbackResponse.data.skills : [],
              experiences: Array.isArray(fallbackResponse.data.experiences) ? fallbackResponse.data.experiences : [],
              certifications: Array.isArray(fallbackResponse.data.certifications) ? fallbackResponse.data.certifications : [],
              githubProjects: Array.isArray(githubProjects) ? githubProjects : []
            };
            
            console.log('Processed fallback profile data:', profileData);
            
            this.setState({ 
              studentProfile: profileData,
              skills: Array.isArray(fallbackResponse.data.skills) ? fallbackResponse.data.skills : []
            }, () => {
              console.log('State updated with fallback profile:', this.state.studentProfile);
            });
            return;
          }
        } catch (fallbackError) {
          console.error('Fallback profile load also failed:', fallbackError);
          // Set empty profile state
          this.setState({ 
            studentProfile: {
              firstName: '',
              lastName: '',
              university: '',
              major: '',
              bio: '',
              phoneNumber: '',
              skills: [],
              experiences: [],
              certifications: [],
              githubProjects: []
            } 
          }, () => {
            console.log('Set empty profile state:', this.state.studentProfile);
          });
        }
      }
    }
  };
  
  // Load employer profile
  loadEmployerProfile = async (token: string) => {
    try {
      // Use profiles/me endpoint instead of employers/me
      const response = await axios.get(`${this.API_BASE_URL}/profiles/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data) {
        console.log('Employer profile loaded:', response.data);
        this.setState({ employerProfile: response.data });
      }
    } catch (error: any) {
      console.error('Error loading employer profile:', error);
      
      // If unauthorized (401/403), try to refresh the token through context
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        try {
          const { fetchUserProfile } = this.context || {};
          // Attempt to refresh the profile using the context
          if (fetchUserProfile) {
            await fetchUserProfile();
            console.log('Auth context refreshed, retrying profile load');
            
            // Get the new token and retry
            const newToken = this.getAuthToken();
            if (newToken) {
              const retryResponse = await axios.get(`${this.API_BASE_URL}/profiles/me`, {
                headers: {
                  'Authorization': `Bearer ${newToken}`
                }
              });
              
              if (retryResponse.data) {
                this.setState({ employerProfile: retryResponse.data });
                return;
              }
            }
          }
        } catch (retryError) {
          console.error('Failed to refresh token and retry:', retryError);
        }
      }
      
      // For 404 errors, the profile may not exist yet - show empty state
      if (error.response && error.response.status === 404) {
        console.log('Employer profile not found, showing empty state');
        // Set empty profile state
        this.setState({ 
          employerProfile: {
            companyName: ''
          } 
        });
      }
    }
  };
  
  // Handle tab change
  handleTabChange = (value: string) => {
    this.setState({ currentTab: value });
  };
  
  // Open education edit modal
  handleOpenEducationModal = () => {
    this.setState({ isEducationModalOpen: true });
  };
  
  // Close education edit modal
  handleCloseEducationModal = () => {
    this.setState({ isEducationModalOpen: false });
  };
  
  // Refresh profile after education update
  handleEducationSaved = () => {
    const token = this.getAuthToken();
    if (token) {
      this.loadStudentProfile(token);
    }
  };
  
  // Helper method to show toasts
  private showToast = (props: ToastProps) => {
    const toastContext = this.context as unknown as { toast?: (props: ToastProps) => void };
    toastContext.toast?.(props);
  };
  
  render() {
    const { 
      loading, 
      studentProfile, 
      employerProfile, 
      isEducationModalOpen
    } = this.state;
    
    console.log('Render - studentProfile:', studentProfile);
    console.log('Render - bio:', studentProfile?.bio, 'university:', studentProfile?.university);
    
    const { user } = this.context || {};
    
    // Check for user and roles first
    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 dark:text-gray-400">Please log in to view your profile.</p>
          </div>
        </div>
      );
    }
    
    const isStudent = Array.isArray(user.roles) && user.roles.includes('ROLE_STUDENT');
    const isEmployer = Array.isArray(user.roles) && user.roles.includes('ROLE_EMPLOYER');
    
    if (!studentProfile) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Loading Profile...</h2>
            <p className="text-gray-600 dark:text-gray-400">Please wait while we fetch your profile data.</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">User Profile</h1>
        
        {isStudent && (
          <div className="grid md:grid-cols-12 gap-6">
            {/* Left column for tabs */}
            <div className="md:col-span-12">
              <Card className="overflow-hidden bg-gray-900/60 border-gray-800/50">
                <div className="p-6">
                  <div className="space-y-8">
                    {/* Profile header with name and contact */}
                    <div className="bg-gradient-to-br from-gray-900/80 to-black/90 p-6 rounded-lg border border-gray-800/50 shadow-lg">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="space-y-4">
                          <div>
                            <h2 className="text-2xl font-bold text-white">{studentProfile.firstName} {studentProfile.lastName}</h2>
                            <p className="text-gray-400">@{user?.username}</p>
                          </div>

                          {/* Contact Information */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Mail className="h-4 w-4" />
                              <span>{user?.email}</span>
                            </div>
                            {studentProfile.phoneNumber && (
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Phone className="h-4 w-4" />
                                <span>{studentProfile.phoneNumber}</span>
                              </div>
                            )}
                            {studentProfile.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{studentProfile.location}</span>
                              </div>
                            )}
                            {studentProfile.address && (
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span>{studentProfile.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Professional Links */}
                        <div className="flex flex-wrap gap-3">
                          {studentProfile.githubUrl && (
                            <a 
                              href={studentProfile.githubUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="flex items-center gap-2 bg-black text-gray-300 border border-gray-700/30 hover:border-gray-600 rounded-md px-3 py-2 transition-colors"
                            >
                              <Github className="h-4 w-4" />
                              <span className="text-sm">GitHub</span>
                            </a>
                          )}
                          {studentProfile.linkedinUrl && (
                            <a 
                              href={studentProfile.linkedinUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="flex items-center gap-2 bg-black text-gray-300 border border-gray-700/30 hover:border-gray-600 rounded-md px-3 py-2 transition-colors"
                            >
                              <Linkedin className="h-4 w-4" />
                              <span className="text-sm">LinkedIn</span>
                            </a>
                          )}
                          {studentProfile.portfolioUrl && (
                            <a 
                              href={studentProfile.portfolioUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="flex items-center gap-2 bg-black text-gray-300 border border-gray-700/30 hover:border-gray-600 rounded-md px-3 py-2 transition-colors"
                            >
                              <Globe className="h-4 w-4" />
                              <span className="text-sm">Portfolio</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Education section */}
                      <div className="bg-gray-900/80 rounded-lg border border-gray-800/50 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-semibold text-white">Education</h3>
                        </div>
                        {studentProfile.university && studentProfile.university.trim() !== '' ? (
                          <div>
                            <p className="text-lg font-medium text-white">{studentProfile.university}</p>
                            {studentProfile.major && studentProfile.major.trim() !== '' && (
                              <p className="text-gray-400">{studentProfile.major}</p>
                            )}
                            {studentProfile.graduationYear && (
                              <p className="text-gray-500 text-sm mt-1">Graduation: {studentProfile.graduationYear}</p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="text-gray-500 italic">No education information provided</p>
                            <Button
                              variant="link"
                              className="text-indigo-400 hover:text-indigo-300 p-0 h-auto mt-2"
                              onClick={this.handleOpenEducationModal}
                            >
                              <span className="mr-1">Add your education details</span> →
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* Bio section */}
                      <div className="bg-gray-900/80 rounded-lg border border-gray-800/50 p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">About Me</h3>
                        {studentProfile.bio && studentProfile.bio.trim() !== '' ? (
                          <p className="text-gray-400">{studentProfile.bio}</p>
                        ) : (
                          <p className="text-gray-500 italic">No bio provided</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Skills section */}
                    <div className="bg-gray-900/80 rounded-lg border border-gray-800/50 p-6">
                      <h3 className="text-xl font-semibold text-white mb-4">Skills</h3>
                      {studentProfile.skills && studentProfile.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {studentProfile.skills.map((skill: string, index: number) => (
                            <span 
                              key={index}
                              className="bg-black/80 text-gray-300 border border-gray-700/30 px-3 py-1 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No skills provided</p>
                      )}
                    </div>
                    
                    {/* Work Experience section */}
                    {studentProfile.experiences && studentProfile.experiences.length > 0 && (
                      <div className="bg-gray-900/80 rounded-lg border border-gray-800/50 p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Work Experience</h3>
                        <div className="space-y-6">
                          {studentProfile.experiences.map((exp: WorkExperience, index: number) => (
                            <div key={index} className="border-l-2 border-gray-700 pl-4 pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold text-white">{exp.title}</h4>
                                  <p className="text-gray-400">{exp.company}{exp.location ? ` • ${exp.location}` : ''}</p>
                                </div>
                                <div className="text-sm text-gray-500 bg-black/40 px-3 py-1 rounded-full">
                                  {exp.startDate && (
                                    <span>
                                      {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                      {' - '}
                                      {exp.current 
                                        ? 'Present'
                                        : exp.endDate 
                                          ? new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                                          : ''
                                      }
                                    </span>
                                  )}
                                </div>
                              </div>
                              {exp.description && <p className="mt-2 text-gray-400">{exp.description}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* GitHub Projects section */}
                    {studentProfile.githubProjects && studentProfile.githubProjects.length > 0 && (
                      <div className="bg-gray-900/80 rounded-lg border border-gray-800/50 p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Projects</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          {studentProfile.githubProjects.map((project: GitHubProject, index: number) => (
                            <div key={index} className="bg-black/40 rounded-lg p-4 border border-gray-800/30">
                              <h4 className="font-bold text-white">{project.name}</h4>
                              {project.description && (
                                <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                              )}
                              {project.technologies && project.technologies.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {project.technologies.map((tech: string, techIndex: number) => (
                                    <span key={techIndex} className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-xs">
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {project.url && (
                                <a 
                                  href={project.url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="mt-3 inline-flex items-center text-gray-400 hover:text-white text-sm"
                                >
                                  <Github className="h-3.5 w-3.5 mr-1" /> View Project
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Certification section */}
                    {studentProfile.certifications && studentProfile.certifications.length > 0 && (
                      <div className="bg-gray-900/80 rounded-lg border border-gray-800/50 p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Certifications</h3>
                        <div className="space-y-4">
                          {studentProfile.certifications.map((cert: Certification, index: number) => (
                            <div key={index} className="border-l-2 border-gray-700 pl-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold text-white">{cert.name}</h4>
                                  <p className="text-gray-400">{cert.issuer}</p>
                                </div>
                                {cert.dateReceived && (
                                  <span className="text-sm text-gray-500 bg-black/40 px-3 py-1 rounded-full">
                                    {new Date(cert.dateReceived).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-center mt-6">
                      <Link to="/profile/edit">
                        <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                          Edit Skills & Profile Information
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
        
        {isEmployer && (
          <Card className="p-6">
            {employerProfile ? (
              <EmployerProfileDisplay 
                profile={employerProfile} 
                email={user?.email || ''} 
                username={user?.username || ''}
              />
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">Employer profile not found. Please complete your onboarding.</p>
                <Link to="/onboarding/employer">
                  <Button>Complete Onboarding</Button>
                </Link>
              </div>
            )}
          </Card>
        )}
        
        {/* Education Edit Modal */}
        {studentProfile && (
          <EducationEditModal
            isOpen={isEducationModalOpen}
            onClose={this.handleCloseEducationModal}
            onSaved={this.handleEducationSaved}
            initialData={{
              university: studentProfile.university,
              major: studentProfile.major,
              graduationYear: studentProfile.graduationYear
            }}
          />
        )}
      </div>
    );
  }
}

// Wrapper component using the contexts
export function ProfilePageWrapper() {
  return (
    <ToastContext.Consumer>
      {(toastContext) => (
        <AuthContext.Consumer>
          {(authContext) => (
            <ProfilePage />
          )}
        </AuthContext.Consumer>
      )}
    </ToastContext.Consumer>
  );
}

export default ProfilePageWrapper; 