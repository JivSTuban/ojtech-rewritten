import React, { Component, createRef } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { AuthContext } from '../providers/AuthProvider';
import { Loader2, Download, Code, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import cvGeneratorService from '../lib/api/cvGeneratorService';
import { toast } from '../components/ui/toast-utils';
import { ToastContext } from '../providers/ToastContext';
import { ToastProps } from '../components/ui/use-toast';

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

interface ResumeManagementPageProps {
  // Add any props if needed
}

interface ResumeManagementPageState {
  studentProfile: any | null;
  hasResume: boolean;
  cvData: any | null;
  generatedCVHtml: string | null;
  cvPreviewVisible: boolean;
  isGeneratingResume: boolean;
  loading: boolean;
  skills: string[];
  generatingCV: boolean;
  uploadLoading: boolean;
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
  experiences?: any[];
  certifications?: any[];
  githubProjects?: any[];
}

export class ResumeManagementPage extends Component<ResumeManagementPageProps, ResumeManagementPageState> {
  declare context: AuthContextType;
  static contextType = AuthContext;
  
  private readonly API_BASE_URL: string;
  private cvPreviewRef: React.RefObject<HTMLIFrameElement>;
  
  constructor(props: ResumeManagementPageProps) {
    super(props);
    this.API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    this.cvPreviewRef = createRef();
    
    // Ensure API URL is properly set
    console.log('Resume Management page using API base URL:', this.API_BASE_URL);
    
    // Bind methods to this instance
    this.parseResumeContent = this.parseResumeContent.bind(this);
    this.loadResumeData = this.loadResumeData.bind(this);
    this.loadStudentProfile = this.loadStudentProfile.bind(this);
    this.loadUserProfile = this.loadUserProfile.bind(this);
    this.handleGenerateCV = this.handleGenerateCV.bind(this);
    this.handleDownloadCV = this.handleDownloadCV.bind(this);
    this.handleLogResumeData = this.handleLogResumeData.bind(this);
    this.toggleCVPreview = this.toggleCVPreview.bind(this);
    
    this.state = {
      studentProfile: null,
      hasResume: false,
      cvData: null,
      generatedCVHtml: null,
      cvPreviewVisible: false,
      isGeneratingResume: false,
      loading: true,
      skills: [],
      generatingCV: false,
      uploadLoading: false
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
      
      if (isStudent) {
        try {
          await this.loadStudentProfile(token);
          await this.loadResumeData(token);
        } catch (profileError) {
          console.error('Error loading student profile:', profileError);
          // Don't log out immediately for profile errors
          // The profile might not exist yet, but authentication could still be valid
        }
      } else {
        // Not a student, redirect to profile
        window.location.href = '/profile';
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
        const profileData: StudentProfileData = {
          id: response.data.id || null,
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          phoneNumber: response.data.phoneNumber || '',
          location: response.data.location || '',
          address: response.data.address || '',
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
        });
      }
    } catch (error: any) {
      console.error('Error loading student profile (primary):', error);
      
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
            
            this.setState({ 
              studentProfile: profileData,
              skills: Array.isArray(fallbackResponse.data.skills) ? fallbackResponse.data.skills : []
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
          });
        }
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
        
        // First try to find a CV with parsedResume/content
        let cvWithContent = cvs.find((cv: { parsedResume: string }) => cv.parsedResume && cv.parsedResume.length > 0);
        
        // If no CV with content, look for the active one
        let activeCv = cvs.find((cv: { active: boolean }) => cv.active === true);
        
        // If neither found, use the most recent one
        if (!cvWithContent && !activeCv && cvs.length > 0) {
          activeCv = cvs[0]; // Assuming sorted by date
        }
        
        // Prefer CV with content over just active status
        const selectedCv = cvWithContent || activeCv;
        
        if (selectedCv) {
          console.log('Selected CV:', selectedCv.id, 'Active:', selectedCv.active, 'Has content:', !!selectedCv.parsedResume);
          
          this.setState({ 
            hasResume: true,
            cvData: selectedCv
          });
          
          // If this is a generated CV, load its content if it has a parsedResume value
          if (selectedCv.generated && selectedCv.parsedResume) {
            try {
              console.log('Found parsedResume in CV, attempting to parse');
              
              // Use the stored parsedResume if available
              if (selectedCv.parsedResume && typeof selectedCv.parsedResume === 'string') {
                console.log('parsedResume is a string of length:', selectedCv.parsedResume.length);
                
                // Parse the JSON string if needed
                try {
                  let parsedContent = this.parseResumeContent(selectedCv.parsedResume);
                  
                  this.setState({
                    generatedCVHtml: parsedContent,
                    cvPreviewVisible: true
                  });
                  
                  // Update the iframe content if it exists
                  if (this.cvPreviewRef.current) {
                    const iframeDoc = this.cvPreviewRef.current.contentDocument;
                    if (iframeDoc) {
                      iframeDoc.open();
                      iframeDoc.write(parsedContent);
                      iframeDoc.close();
                    }
                  }
                } catch (parseError) {
                  console.error('Error parsing stored resume content:', parseError);
                  // Continue to try API method as fallback
                }
              } else {
                console.log('parsedResume is not a string, falling back to API call');
              }
              
              // If no parsed content yet, try loading it from the API
              if (!this.state.generatedCVHtml) {
                console.log('Getting content from API for CV ID:', selectedCv.id);
                const htmlContent = await cvGeneratorService.getCVContent(selectedCv.id, token);
                
                if (htmlContent) {
                  console.log('Received content from API, length:', htmlContent.length);
                  // Parse the content if needed
                  let parsedContent = this.parseResumeContent(htmlContent);
                  
                  this.setState({
                    generatedCVHtml: parsedContent,
                    cvPreviewVisible: true
                  });
                  
                  // Update the iframe content if it exists
                  if (this.cvPreviewRef.current) {
                    const iframeDoc = this.cvPreviewRef.current.contentDocument;
                    if (iframeDoc) {
                      iframeDoc.open();
                      iframeDoc.write(parsedContent);
                      iframeDoc.close();
                    }
                  }
                } else {
                  console.log('No content returned from API');
                }
              }
            } catch (contentError: any) {
              console.error('Error loading CV content:', contentError);
              if (contentError.response) {
                console.error('API error response:', contentError.response.status, contentError.response.data);
              }
            }
          } else {
            console.log('Selected CV either not generated or has no parsedResume');
          }
        } else {
          console.log('No suitable CV found');
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
      if (error.response) {
        console.error('API error response:', error.response.status, error.response.data);
      }
    }
  };
  
  // Generate CV using Gemini API
  handleGenerateCV = async () => {
    const { studentProfile } = this.state;
    const { user } = this.context || {};
    
    if (!studentProfile) {
      this.showToast({
        title: "Error",
        description: "Please complete your profile information first",
        variant: "destructive"
      });
      return;
    }
    
    this.setState({ generatingCV: true });
    
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Starting CV generation process with token:', token.substring(0, 15) + '...');
      
      // Prepare the profile data for CV generation
      const profileData: Record<string, any> = {
        firstName: studentProfile.firstName || '',
        lastName: studentProfile.lastName || '',
        email: user?.email || '',
        phoneNumber: studentProfile.phoneNumber || '',
        location: studentProfile.location || '',
        address: studentProfile.address || '',
        university: studentProfile.university || '',
        major: studentProfile.major || '',
        graduationYear: studentProfile.graduationYear || '',
        bio: studentProfile.bio || '',
        githubUrl: studentProfile.githubUrl || '',
        linkedinUrl: studentProfile.linkedinUrl || '',
        portfolioUrl: studentProfile.portfolioUrl || '',
        skills: Array.isArray(studentProfile.skills) ? studentProfile.skills : [],
        experiences: Array.isArray(studentProfile.experiences) ? studentProfile.experiences : [],
        certifications: Array.isArray(studentProfile.certifications) ? studentProfile.certifications : [],
        githubProjects: Array.isArray(studentProfile.githubProjects) ? studentProfile.githubProjects : []
      };
      
      // Log the profile data being used for CV generation
      console.log('Resume Generation - Profile Data:', profileData);
      
      // Check if required fields are present
      const requiredFields = ['firstName', 'lastName', 'skills'];
      const missingFields = requiredFields.filter(field => {
        const value = profileData[field];
        return !value || (Array.isArray(value) && value.length === 0);
      });
      
      if (missingFields.length > 0) {
        console.warn('Warning: Missing required fields for CV generation:', missingFields);
        this.showToast({
          title: "Warning",
          description: `Missing some recommended information: ${missingFields.join(', ')}. Your resume might be incomplete.`,
          variant: "default"
        });
      }
      
      // Show in-progress toast
      this.showToast({
        title: "Generating Resume",
        description: "This may take up to 30 seconds. Please wait...",
        variant: "default"
      });
      
      // Call the CV generator service
      console.log('Calling cvGeneratorService.generateCV with profile data');
      const result = await cvGeneratorService.generateCV(profileData);
      
      console.log('CV generation successful, checking response format:', result);
      
      // Get the HTML content from the response
      const { htmlContent, id } = result;
      
      if (!htmlContent) {
        console.error('No HTML content in response:', result);
        throw new Error('Invalid response format: No HTML content received');
      }
      
      // Log successful CV generation
      console.log('Resume successfully generated with HTML content length:', htmlContent.length);
      console.log('Generated CV ID:', id);
      
      // Parse the HTML content if needed
      console.log('Parsing the HTML content');
      const parsedHtmlContent = this.parseResumeContent(htmlContent);
      
      // Basic validation of HTML content
      if (!parsedHtmlContent.includes('<!DOCTYPE html>') && !parsedHtmlContent.includes('<html>')) {
        console.warn('Generated content may not be valid HTML:', parsedHtmlContent.substring(0, 100) + '...');
      }
      
      // Log the parsed resume structure
      console.log('Logging resume structure');
      cvGeneratorService.logResumeStructure(parsedHtmlContent);
      
      // Update state with generated CV
      console.log('Updating state with new CV data');
      this.setState({ 
        generatedCVHtml: parsedHtmlContent,
        cvPreviewVisible: true,
        generatingCV: false,
        cvData: {
          id: id,
          generated: true,
          active: true,
          parsedResume: htmlContent  // Store for future reference
        }
      });
      
      // Update the iframe content if it exists
      if (this.cvPreviewRef.current) {
        console.log('Updating iframe content');
        const iframeDoc = this.cvPreviewRef.current.contentDocument;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(parsedHtmlContent);
          iframeDoc.close();
          console.log('Iframe content updated successfully');
        } else {
          console.warn('Unable to access iframe document');
        }
      } else {
        console.warn('CV preview iframe ref not found');
      }
      
      // Show success toast
      this.showToast({
        title: "Success",
        description: "Your resume has been generated successfully!",
        variant: "default"
      });
      
      // Reload the resume data to get the updated CV list
      this.loadResumeData(token);
    } catch (error: any) {
      console.error('Error generating CV:', error);
      
      // Show a more user-friendly error message
      let errorMessage = 'Failed to generate CV. Please try again later.';
      
      if (error.response) {
        console.error('Server response error:', error.response.status, error.response.data);
        if (error.response.data && typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        if (error.message.includes('Access denied')) {
          errorMessage = 'You do not have permission to generate a CV. Please check your account type.';
        } else if (error.message.includes('Authentication failed')) {
          errorMessage = 'Your session has expired. Please log in again.';
          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else if (error.message.includes('Failed to parse')) {
          errorMessage = 'There was a problem processing the resume data. Please try again.';
        } else if (error.message.includes('Failed to generate resume data')) {
          // Use the specific error message from the backend
          errorMessage = error.message;
        } else {
          errorMessage = error.message;
        }
      }
      
      this.showToast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      this.setState({ generatingCV: false });
    }
  };
  
  // Download the generated CV
  handleDownloadCV = async () => {
    const { generatedCVHtml, studentProfile } = this.state;
    
    if (!generatedCVHtml) {
      this.showToast({
        title: "Error",
        description: "Please generate a CV first",
        variant: "destructive"
      });
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
      
      this.showToast({
        title: "Success",
        description: "Resume downloaded successfully!",
        variant: "default"
      });
    } catch (error) {
      console.error('Error downloading CV:', error);
      this.showToast({
        title: "Error",
        description: "Failed to download CV. Please try again.",
        variant: "destructive"
      });
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
  
  // Handle logging resume data
  handleLogResumeData = () => {
    const { cvData, generatedCVHtml } = this.state;
    
    if (!generatedCVHtml) {
      this.showToast({
        title: "Error",
        description: "Please generate a CV first",
        variant: "destructive"
      });
      return;
    }
    
    console.log('CV Data:', cvData);
    console.log('Generated HTML:', generatedCVHtml);
    
    try {
      if (cvData && cvData.parsedResume) {
        console.log('parsedResume (raw):', cvData.parsedResume.substring(0, 100) + '...');
        
        if (typeof cvData.parsedResume === 'string') {
          try {
            const parsed = JSON.parse(cvData.parsedResume);
            console.log('parsedResume (JSON parsed):', typeof parsed, parsed.substring(0, 100) + '...');
          } catch (e) {
            console.log('Not valid JSON:', e);
          }
        }
      }
    } catch (e) {
      console.error('Error logging resume data:', e);
    }
    
    console.log('Logging raw resume data:');
    cvGeneratorService.logResumeStructure(generatedCVHtml);
    
    this.showToast({
      title: "Resume Data Logged",
      description: "Raw resume data has been logged to the console."
    });
  };
  
  // Helper to parse potentially double or triple-JSON-encoded resume content
  parseResumeContent = (content: string): string => {
    if (!content) return '';
    
    console.log('Parsing resume content, input type:', typeof content);
    if (typeof content === 'string' && content.length > 0) {
      console.log('Input content first 50 chars:', content.substring(0, 50));
    }
    
    try {
      // Handle already parsed objects
      if (typeof content !== 'string') {
        console.log('Content is not a string, returning as is');
        return content;
      }
      
      // If it's already HTML, return as is
      if (content.includes('<!DOCTYPE html>') || content.includes('<html>')) {
        console.log('Content appears to be HTML, returning as is');
        return content;
      }
      
      // Helper function to recursively parse JSON strings
      const recursivelyParse = (jsonString: string, depth = 0): any => {
        if (depth > 5) {
          console.warn('Maximum parsing depth reached, returning current value');
          return jsonString; // Prevent infinite recursion
        }
        
        try {
          // Try to parse the current string
          const parsed = JSON.parse(jsonString);
          
          // If the result is another string that looks like JSON, parse again
          if (typeof parsed === 'string') {
            console.log(`Parsed level ${depth}, got another string, trying again`);
            
            if ((parsed.startsWith('"') && parsed.endsWith('"')) || 
                (parsed.startsWith('{') && parsed.endsWith('}')) || 
                (parsed.startsWith('[') && parsed.endsWith(']'))) {
              return recursivelyParse(parsed, depth + 1);
            }
            
            // If it has HTML tags after parsing, we're done
            if (parsed.includes('<!DOCTYPE html>') || parsed.includes('<html>')) {
              console.log(`Found HTML content after ${depth} parsing levels`);
              return parsed;
            }
          }
          
          // Return the parsed result
          return parsed;
        } catch (e) {
          console.log(`Error parsing at depth ${depth}:`, e);
          // If parsing fails, return the input
          return jsonString;
        }
      };
      
      // Start the recursive parsing
      const result = recursivelyParse(content);
      
      console.log('Resume parsing complete, result type:', typeof result);
      if (typeof result === 'string' && result.length > 0) {
        console.log('Result first 50 chars:', result.substring(0, 50));
      }
      
      return result;
    } catch (e) {
      console.error('Error in main parseResumeContent method:', e);
      return content; // Return original if parsing fails
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
      generatingCV, 
      generatedCVHtml,
      cvPreviewVisible
    } = this.state;
    
    const { user } = this.context || {};
    
    // Check for user and roles first
    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 dark:text-gray-400">Please log in to manage your resume.</p>
            <Link to="/login" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">
              Go to Login
            </Link>
          </div>
        </div>
      );
    }
    
    const isStudent = Array.isArray(user.roles) && user.roles.includes('ROLE_STUDENT');
    
    if (!isStudent) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Student Access Only</h2>
            <p className="text-gray-600 dark:text-gray-400">Only students can access the resume management page.</p>
            <Link to="/profile" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">
              Return to Profile
            </Link>
          </div>
        </div>
      );
    }
    
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Loading Resume Data...</h2>
            <p className="text-gray-600 dark:text-gray-400">Please wait while we fetch your resume data.</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">Resume Management</h1>
          
        </div>
        
        <div className="bg-gradient-to-br from-gray-900/80 to-black/90 p-6 rounded-lg border border-gray-800/50 shadow-lg">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white">Resume Builder</h3>
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
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* CV Preview */}
        {generatedCVHtml && (
          <div className="bg-gray-900/80 rounded-lg border border-gray-800/50 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-800/50">
              <h4 className="font-medium text-white">Resume Preview</h4>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={this.handleLogResumeData}
                  className="text-gray-400 hover:text-white hover:bg-gray-800 flex items-center"
                >
                  <Code className="h-4 w-4 mr-1" />
                  View Raw Data
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={this.toggleCVPreview}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  {cvPreviewVisible ? 'Hide Preview' : 'Show Preview'}
                </Button>
              </div>
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
    );
  }
}

// Wrapper component using the contexts
export function ResumeManagementPageWrapper() {
  return (
    <ToastContext.Consumer>
      {(toastContext) => (
        <AuthContext.Consumer>
          {(authContext) => (
            <ResumeManagementPage />
          )}
        </AuthContext.Consumer>
      )}
    </ToastContext.Consumer>
  );
}

export default ResumeManagementPageWrapper; 