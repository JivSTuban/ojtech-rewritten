import React, { Component, ChangeEvent, createRef } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { AuthContext } from '../providers/AuthProvider';
import { Loader2, Upload, Download, Github, Linkedin, Globe, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import cvGeneratorService from '../lib/api/cvGeneratorService';

// Define interfaces for our component
interface ProfilePageProps {}

interface ProfilePageState {
  loading: boolean;
  uploadLoading: boolean;
  hasResume: boolean;
  currentTab: string;
  resumeUrl: string | null;
  cvData: any | null;
  skills: string[];
  studentProfile: StudentProfileData | null;
  employerProfile: EmployerProfileData | null;
  generatingCV: boolean;
  generatedCVHtml: string | null;
  cvPreviewVisible: boolean;
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
          {profile.skills.map((skill, index) => (
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
        {profile.experiences.map((exp, index) => (
          <div key={index} className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="font-semibold">{exp.title}</h5>
                <p>{exp.company}{exp.location ? ` • ${exp.location}` : ''}</p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
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
            {exp.description && <p className="mt-2 text-sm">{exp.description}</p>}
          </div>
        ))}
      </div>
    )}
    
    {/* Certifications Section */}
    {profile.certifications && profile.certifications.length > 0 && (
      <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium mb-2">Certifications</h4>
        {profile.certifications.map((cert, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between">
              <h5 className="font-semibold">{cert.name}</h5>
              {cert.dateReceived && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(cert.dateReceived).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </span>
              )}
            </div>
            <p className="text-sm">{cert.issuer}</p>
            {cert.credentialUrl && (
              <a 
                href={cert.credentialUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
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
        <h4 className="text-lg font-medium mb-2">GitHub Projects</h4>
        {profile.githubProjects.map((project, index) => (
          <div key={index} className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="flex justify-between items-start">
              <h5 className="font-semibold">{project.name}</h5>
              {project.stars > 0 && (
                <div className="flex items-center text-sm">
                  <span>★</span>
                  <span className="ml-1">{project.stars}</span>
                </div>
              )}
            </div>
            <p className="text-sm mt-1">{project.description}</p>
            {project.technologies && project.technologies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {project.technologies.map((tech, techIndex) => (
                  <span 
                    key={techIndex}
                    className="bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded text-xs"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
            <a 
              href={project.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              View Project
            </a>
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

export class ProfilePageClass extends Component<ProfilePageProps, ProfilePageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;
  
  // API base URL
  private API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  
  private fileInputRef = createRef<HTMLInputElement>();
  private cvPreviewRef = createRef<HTMLIFrameElement>();
  
  constructor(props: ProfilePageProps) {
    super(props);
    
    // Ensure API URL is properly set
    console.log('Profile page using API base URL:', this.API_BASE_URL);
    
    this.state = {
      loading: true,
      uploadLoading: false,
      hasResume: false,
      currentTab: 'info',
      resumeUrl: null,
      cvData: null,
      skills: [],
      studentProfile: null,
      employerProfile: null,
      generatingCV: false,
      generatedCVHtml: null,
      cvPreviewVisible: false
    };
  }
  
  componentDidMount() {
    this.loadUserProfile();
  }
  
  // Get the token from localStorage or context
  getAuthToken = (): string | null => {
    // First try from context
    const { user } = this.context;
    if (user && user.accessToken) {
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
        if (userData && userData.accessToken) {
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
      const { user, fetchUserProfile } = this.context;
      
      if (!user) {
        console.log("User not found in context, attempting to refresh");
        // Instead of immediately logging out, try to refresh the user profile
        try {
          // Call the fetchUserProfile method from AuthContext to refresh authentication
          await fetchUserProfile();
          // After refreshing, check again
          const refreshedUser = this.context.user;
          if (!refreshedUser) {
            console.log("Still not authenticated after refresh, redirecting to login");
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
      const currentUser = user || this.context.user;
      const isStudent = currentUser?.roles?.includes('ROLE_STUDENT');
      const isEmployer = currentUser?.roles?.includes('ROLE_EMPLOYER');
      
      if (isStudent) {
        try {
          await this.loadStudentProfile(token);
          await this.loadResumeData(token);
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
          await this.context.fetchUserProfile();
          console.log('Auth context refreshed, retrying profile load');
          
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
          // Attempt to refresh the profile using the context
          await this.context.fetchUserProfile();
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
  
  // Load resume data
  loadResumeData = async (token: string) => {
    try {
      console.log('Attempting to load resume data from API');
      
      // First, get the CVs
      const response = await axios.get(`${this.API_BASE_URL}/cvs/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('CV data response:', response.data);
      
      if (response.data && response.data.length > 0) {
        const cvs = response.data;
        // Find the active CV if any
        let activeCv = cvs.find(cv => cv.active === true);
        
        // If no active CV found, use the most recent one
        if (!activeCv && cvs.length > 0) {
          activeCv = cvs[0]; // Assuming sorted by date
        }
        
        if (activeCv) {
          this.setState({ 
            hasResume: true,
            cvData: activeCv
          });
          
          // If this is a generated CV, load its content
          if (activeCv.generated) {
            try {
              const htmlContent = await cvGeneratorService.getCVContent(activeCv.id, token);
              this.setState({
                generatedCVHtml: htmlContent,
                cvPreviewVisible: true
              });
              
              // Update the iframe content if it exists
              if (this.cvPreviewRef.current) {
                const iframeDoc = this.cvPreviewRef.current.contentDocument;
                if (iframeDoc) {
                  iframeDoc.open();
                  iframeDoc.write(htmlContent);
                  iframeDoc.close();
                }
              }
            } catch (contentError) {
              console.error('Error loading CV content:', contentError);
            }
          }
        } else {
          this.setState({
            hasResume: false,
            cvData: null
          });
        }
      } else {
        console.log('No CVs found for user');
        this.setState({
          hasResume: false,
          cvData: null
        });
      }
    } catch (error: any) {
      console.error('Error loading resume data:', error);
      
      // Show empty state for resumes
      this.setState({
        hasResume: false,
        cvData: null
      });
    }
  };
  
  // Process skills from CV data
  processSkills = (cvData: any): string[] => {
    if (!cvData || !cvData.skills || !Array.isArray(cvData.skills)) {
      return [];
    }
    
    return this.filterSkillCategoryLabels(cvData.skills);
  };
  
  // Filter utility for skills
  filterSkillCategoryLabels = (skills: string[]): string[] => {
    if (!skills || !Array.isArray(skills)) return [];
    
    // Common category labels that should be excluded
    const categoryLabels = [
      "backend development", "frontend development", "full stack", "other skills",
      "soft skills", "data analysis", "mobile development", "web development",
      "cloud services", "devops", "database", "testing", "ui/ux", "ux/ui", 
      "frameworks", "programming languages", "tools", "libraries"
    ];
    
    // Non-technical terms to filter
    const descriptiveTerms = [
      "proficient in", "experienced with", "knowledge of", "familiar with",
      "expertise in", "skilled in", "advanced", "intermediate", "beginner"
    ];
    
    return skills.filter(skill => {
      const lowerSkill = skill.toLowerCase().trim();
      
      // Filter out category labels
      if (categoryLabels.some(label => lowerSkill === label)) {
        return false;
      }
      
      // Filter out descriptive terms
      if (descriptiveTerms.some(term => lowerSkill === term)) {
        return false;
      }
      
      // Filter out too long items
      if (skill.length > 30) {
        return false;
      }
      
      return true;
    });
  };
  
  // Handle tab change
  handleTabChange = (value: string) => {
    this.setState({ currentTab: value });
  };
  
  // Generate CV using Gemini API
  handleGenerateCV = async () => {
    const { studentProfile } = this.state;
    
    if (!studentProfile) {
      alert('Please complete your profile information first');
      return;
    }
    
    this.setState({ generatingCV: true });
    
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Call the CV generator service with the token
      const { htmlContent } = await cvGeneratorService.generateCV({
        ...studentProfile,
        email: this.context.user?.email || ''
      }, token);
      
      // Update state with generated CV
      this.setState({ 
        generatedCVHtml: htmlContent,
        cvPreviewVisible: true,
        generatingCV: false
      });
      
      // Update the iframe content if it exists
      if (this.cvPreviewRef.current) {
        const iframeDoc = this.cvPreviewRef.current.contentDocument;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(htmlContent);
          iframeDoc.close();
        }
      }
    } catch (error) {
      console.error('Error generating CV:', error);
      alert('Failed to generate CV. Please try again later.');
      this.setState({ generatingCV: false });
    }
  };
  
  // Download the generated CV
  handleDownloadCV = async () => {
    const { generatedCVHtml, studentProfile } = this.state;
    
    if (!generatedCVHtml) {
      alert('Please generate a CV first');
      return;
    }
    
    try {
      // Set download button to loading state
      this.setState({ uploadLoading: true });
      
      // Create a PDF from the HTML content
      const blob = await cvGeneratorService.convertCVToPDF(generatedCVHtml);
      
      // Generate a filename based on the student's name
      const firstName = studentProfile?.firstName || '';
      const lastName = studentProfile?.lastName || '';
      const filename = `${firstName}_${lastName}_Resume.pdf`.replace(/\s+/g, '_');
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading CV:', error);
      alert('Failed to download CV. Please try again.');
    } finally {
      this.setState({ uploadLoading: false });
    }
  };
  
  // Toggle CV preview visibility
  toggleCVPreview = () => {
    this.setState(prevState => ({ 
      cvPreviewVisible: !prevState.cvPreviewVisible 
    }));
  };
  
  render() {
    const { 
      loading, 
      studentProfile, 
      employerProfile, 
      currentTab, 
      generatingCV, 
      generatedCVHtml,
      cvPreviewVisible 
    } = this.state;
    
    console.log('Render - studentProfile:', studentProfile);
    console.log('Render - bio:', studentProfile?.bio, 'university:', studentProfile?.university);
    
    const { user } = this.context;
    
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-6 w-full">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading your profile data...</p>
        </div>
      );
    }
    
    if (!user) {
      return (
        <div className="flex flex-col items-center justify-center p-6 w-full space-y-4">
          <div className="bg-gray-900/80 border border-gray-800/50 p-4 rounded-md text-gray-300 max-w-lg">
            <h3 className="font-semibold mb-2">Session Error</h3>
            <p className="text-sm">Your session might have expired or there was an error loading your profile.</p>
            <div className="mt-4">
              <Button onClick={() => window.location.href = '/login'}>
                Sign In Again
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    const isStudent = user.roles?.includes('ROLE_STUDENT');
    const isEmployer = user.roles?.includes('ROLE_EMPLOYER');
    
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">User Profile</h1>
        
        {isStudent && (
          <div className="grid md:grid-cols-12 gap-6">
            {/* Left column for tabs */}
            <div className="md:col-span-12">
              <Card className="overflow-hidden bg-gray-900/60 border-gray-800/50">
                <Tabs defaultValue={currentTab} onValueChange={this.handleTabChange} className="w-full">
                  <div className="border-b border-gray-800/50">
                    <TabsList className="w-full justify-start rounded-none bg-gray-900/80 p-0">
                      <TabsTrigger 
                        value="info" 
                        className="rounded-none data-[state=active]:bg-gray-800/50 data-[state=active]:border-b-2 data-[state=active]:border-gray-500 py-3 px-6"
                      >
                        Profile Info
                      </TabsTrigger>
                      <TabsTrigger 
                        value="resume" 
                        className="rounded-none data-[state=active]:bg-gray-800/50 data-[state=active]:border-b-2 data-[state=active]:border-gray-500 py-3 px-6"
                      >
                        Resume Management
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <div className="p-6">
                    <TabsContent value="info" className="m-0">
                      {studentProfile ? (
                        <div className="space-y-8">
                          {/* Profile header with name and contact */}
                          <div className="bg-gradient-to-br from-gray-900/80 to-black/90 p-6 rounded-lg border border-gray-800/50 shadow-lg">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div>
                                <h2 className="text-2xl font-bold text-white">{studentProfile.firstName} {studentProfile.lastName}</h2>
                                <p className="text-gray-400">@{user?.username}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                                  <span>{user?.email}</span>
                                  {studentProfile.phoneNumber && (
                                    <span className="flex items-center gap-1">
                                      <span>•</span>
                                      <span>{studentProfile.phoneNumber}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                {studentProfile.githubUrl && (
                                  <a href={studentProfile.githubUrl} target="_blank" rel="noreferrer" className="bg-black text-gray-300 border border-gray-700/30 hover:border-gray-600 rounded-md p-2 transition-colors">
                                    <Github className="h-5 w-5" />
                                  </a>
                                )}
                                {studentProfile.linkedinUrl && (
                                  <a href={studentProfile.linkedinUrl} target="_blank" rel="noreferrer" className="bg-black text-gray-300 border border-gray-700/30 hover:border-gray-600 rounded-md p-2 transition-colors">
                                    <Linkedin className="h-5 w-5" />
                                  </a>
                                )}
                                {studentProfile.portfolioUrl && (
                                  <a href={studentProfile.portfolioUrl} target="_blank" rel="noreferrer" className="bg-black text-gray-300 border border-gray-700/30 hover:border-gray-600 rounded-md p-2 transition-colors">
                                    <Globe className="h-5 w-5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Education section */}
                            <div className="bg-gray-900/80 rounded-lg border border-gray-800/50 p-6">
                              <h3 className="text-xl font-semibold text-white mb-4">Education</h3>
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
                                <p className="text-gray-500 italic">No education information provided</p>
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
                                {studentProfile.skills.map((skill, index) => (
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
                                {studentProfile.experiences.map((exp, index) => (
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
                              <h3 className="text-xl font-semibold text-white mb-4">GitHub Projects</h3>
                              <div className="grid gap-4 md:grid-cols-2">
                                {studentProfile.githubProjects.map((project, index) => (
                                  <div key={index} className="bg-black/40 rounded-lg p-4 border border-gray-800/30">
                                    <h4 className="font-bold text-white">{project.name}</h4>
                                    {project.description && (
                                      <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                                    )}
                                    {project.technologies && project.technologies.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-1">
                                        {project.technologies.map((tech, techIndex) => (
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
                                {studentProfile.certifications.map((cert, index) => (
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
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-gray-500 mb-4">Student profile not found. Please complete your onboarding.</p>
                          <Link to="/onboarding/student">
                            <Button>Complete Onboarding</Button>
                          </Link>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="resume" className="m-0">
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-gray-900/80 to-black/90 p-6 rounded-lg border border-gray-800/50 shadow-lg">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <div>
                              <h3 className="text-2xl font-bold text-white">Resume Management</h3>
                              <p className="text-gray-400 text-sm mt-1">
                                Generate a professional, ATS-optimized resume based on your profile
                              </p>
                              <p className="text-gray-500 text-xs mt-1">
                                Powered by Google Gemini 2.5 AI to create exceptional resumes that stand out
                              </p>
                            </div>
                            
                            {/* CV Generation Button */}
                            <div className="flex gap-2">
                              <Button 
                                onClick={this.handleGenerateCV} 
                                disabled={generatingCV}
                                className="bg-gradient-to-r from-gray-600 to-gray-800 text-white border-0 flex items-center gap-2 hover:from-gray-700 hover:to-gray-900"
                              >
                                {generatingCV ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Generating...</span>
                                  </>
                                ) : (
                                  <>
                                    <FileText className="h-4 w-4" />
                                    <span>{generatedCVHtml ? 'Regenerate Resume' : 'Generate Resume'}</span>
                                  </>
                                )}
                              </Button>
                              
                              {generatedCVHtml && (
                                <Button 
                                  onClick={this.handleDownloadCV}
                                  variant="outline"
                                  disabled={this.state.uploadLoading}
                                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2"
                                >
                                  {this.state.uploadLoading ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      <span>Downloading...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Download className="h-4 w-4" />
                                      <span>Download PDF</span>
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* CV Preview */}
                        {generatedCVHtml && (
                          <div className="bg-gray-900/80 rounded-lg border border-gray-800/50 overflow-hidden">
                            <div className="flex justify-between items-center p-4 border-b border-gray-800/50">
                              <h4 className="font-medium text-white">Resume Preview</h4>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={this.toggleCVPreview}
                                className="text-gray-400 hover:text-white hover:bg-gray-800"
                              >
                                {cvPreviewVisible ? 'Hide Preview' : 'Show Preview'}
                              </Button>
                            </div>
                            
                            {cvPreviewVisible && (
                              <div className="bg-white">
                                <iframe 
                                  ref={this.cvPreviewRef}
                                  className="w-full h-[800px]"
                                  title="Resume Preview"
                                  srcDoc={generatedCVHtml}
                                />
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Instructions for better resume */}
                        {!generatedCVHtml && (
                          <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-white mb-3">Tips for a Great Resume</h4>
                            <ul className="space-y-3 text-gray-400">
                              <li className="flex gap-2">
                                <span className="text-gray-500">•</span>
                                <span>Complete your profile with detailed work experiences and projects</span>
                              </li>
                              <li className="flex gap-2">
                                <span className="text-gray-500">•</span>
                                <span>Quantify your achievements with metrics (e.g. "increased efficiency by 30%")</span>
                              </li>
                              <li className="flex gap-2">
                                <span className="text-gray-500">•</span>
                                <span>Add technical skills relevant to the positions you're applying for</span>
                              </li>
                              <li className="flex gap-2">
                                <span className="text-gray-500">•</span>
                                <span>Include your education details and relevant certifications</span>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
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
      </div>
    );
  }
}

// Wrapper component using the AuthContext hook
export function ProfilePage() {
  return <ProfilePageClass />;
} 