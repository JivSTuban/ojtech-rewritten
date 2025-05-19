import React, { Component, ChangeEvent, createRef } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { AuthContext } from '../providers/AuthProvider';
import { Loader2, Upload, Download, Github, Linkedin, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  <div className="space-y-4">
    <h3 className="text-xl font-semibold">{profile.firstName} {profile.lastName} ({username})</h3>
    <p><strong>Email:</strong> {email}</p>
    {profile.phoneNumber && <p><strong>Phone:</strong> {profile.phoneNumber}</p>}
    {profile.university && <p><strong>University:</strong> {profile.university}</p>}
    {profile.major && <p><strong>Major:</strong> {profile.major}</p>}
    {profile.graduationYear && <p><strong>Graduation Year:</strong> {profile.graduationYear}</p>}
    {profile.bio && <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded"><p className="italic">{profile.bio}</p></div>}
    {profile.skills && profile.skills.length > 0 && (
      <div><strong>Skills:</strong> {profile.skills.join(', ')}</div>
    )}
    {profile.cvUrl && (
      <p><strong>CV:</strong> <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{profile.cvFilename || 'Download CV'}</a></p>
    )}
    <div className="flex space-x-4 mt-2">
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
  
  constructor(props: ProfilePageProps) {
    super(props);
    
    this.state = {
      loading: true,
      uploadLoading: false,
      hasResume: false,
      currentTab: 'info',
      resumeUrl: null,
      cvData: null,
      skills: [],
      studentProfile: null,
      employerProfile: null
    };
  }
  
  componentDidMount() {
    this.loadUserProfile();
  }
  
  // Load user profile data
  loadUserProfile = async () => {
    try {
      const { user } = this.context;
      
      if (!user) {
        // Handle not authenticated
        console.log("Not authenticated, redirecting to login");
        localStorage.removeItem('user');
        localStorage.removeItem('user-profile');
        window.location.href = '/login';
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log("No token found, redirecting to login");
        localStorage.removeItem('user');
        localStorage.removeItem('user-profile');
        window.location.href = '/login';
        return;
      }
      
      // Determine if the user is a student or employer
      const isStudent = user.roles?.includes('ROLE_STUDENT');
      const isEmployer = user.roles?.includes('ROLE_EMPLOYER');
      
      if (isStudent) {
        await this.loadStudentProfile(token);
        await this.loadResumeData(token);
      } else if (isEmployer) {
        await this.loadEmployerProfile(token);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      this.setState({ loading: false });
    }
  };
  
  // Load student profile
  loadStudentProfile = async (token: string) => {
    try {
      const response = await axios.get(`${this.API_BASE_URL}/students/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data) {
        this.setState({ studentProfile: response.data });
        
        // Set skills if available
        if (response.data.skills && Array.isArray(response.data.skills)) {
          this.setState({ skills: response.data.skills });
        }
      }
    } catch (error) {
      console.error('Error loading student profile:', error);
    }
  };
  
  // Load employer profile
  loadEmployerProfile = async (token: string) => {
    try {
      const response = await axios.get(`${this.API_BASE_URL}/employers/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data) {
        this.setState({ employerProfile: response.data });
      }
    } catch (error) {
      console.error('Error loading employer profile:', error);
    }
  };
  
  // Load resume data for students
  loadResumeData = async (token: string) => {
    try {
      const response = await axios.get(`${this.API_BASE_URL}/cvs/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.length > 0) {
        const latestCv = response.data[0]; // Assuming sorted by date
        
        this.setState({ 
          hasResume: true,
          resumeUrl: latestCv.fileUrl || null,
          cvData: latestCv.parsedData || null
        });
        
        if (latestCv.parsedData && latestCv.parsedData.skills) {
          this.setState({ skills: this.processSkills(latestCv.parsedData) });
        }
      }
    } catch (error) {
      console.error('Error loading resume data:', error);
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
  
  // Handle upload button click
  handleUploadClick = () => {
    if (this.fileInputRef.current) {
      this.fileInputRef.current.click();
    }
  };
  
  // Handle file upload
  handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    // Validate file is PDF
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }
    
    this.setState({ uploadLoading: true });
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload CV file
      const response = await axios.post(
        `${this.API_BASE_URL}/cvs/upload`, 
        formData, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.status === 200 || response.status === 201) {
        alert('Resume uploaded successfully!');
        
        // Reload user profile after successful upload
        await this.loadUserProfile();
      } else {
        throw new Error('Failed to upload resume');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Failed to upload resume');
    } finally {
      this.setState({ uploadLoading: false });
    }
  };
  
  // Handle tab change
  handleTabChange = (value: string) => {
    this.setState({ currentTab: value });
  };
  
  render() {
    const { loading, uploadLoading, hasResume, currentTab, studentProfile, employerProfile, resumeUrl, skills } = this.state;
    const { user } = this.context || {};
    
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    // Determine user roles
    const isStudent = user?.roles?.includes('ROLE_STUDENT');
    const isEmployer = user?.roles?.includes('ROLE_EMPLOYER');
    
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">User Profile</h1>
        
        {isStudent && (
          <Card className="p-6">
            <Tabs defaultValue={currentTab} onValueChange={this.handleTabChange}>
              <TabsList className="mb-6">
                <TabsTrigger value="info">Profile Info</TabsTrigger>
                <TabsTrigger value="resume">Resume & Skills</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info">
                {studentProfile ? (
                  <StudentProfileDisplay 
                    profile={studentProfile} 
                    email={user?.email || ''} 
                    username={user?.username || ''}
                  />
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">Student profile not found. Please complete your onboarding.</p>
                    <Link to="/onboarding/student">
                      <Button>Complete Onboarding</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="resume">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">Resume Management</h3>
                      <p className="text-gray-500 text-sm mt-1">
                        Upload your resume to help us find the best matches for you
                      </p>
                    </div>
                    
                    {/* File upload */}
                    <div>
                      <Input 
                        type="file" 
                        ref={this.fileInputRef} 
                        className="hidden" 
                        onChange={this.handleFileChange}
                        accept=".pdf" 
                      />
                      <Button 
                        onClick={this.handleUploadClick} 
                        disabled={uploadLoading}
                        className="flex items-center gap-2"
                      >
                        {uploadLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            <span>{hasResume ? 'Update Resume' : 'Upload Resume'}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Resume file info */}
                  {resumeUrl && (
                    <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md">
                          <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">Your Resume</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Last updated: {new Date().toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <a 
                        href={resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        Download
                      </a>
                    </div>
                  )}
                  
                  {/* Skills section */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Extracted Skills</h3>
                    
                    {skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <span 
                            key={index}
                            className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        {hasResume 
                          ? 'No skills were extracted from your resume. Try uploading a more detailed resume.' 
                          : 'Upload your resume to extract skills.'}
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
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