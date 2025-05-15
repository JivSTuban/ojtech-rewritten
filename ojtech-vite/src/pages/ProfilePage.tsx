import React, { Component, ChangeEvent, createRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { ToastHelper } from '../providers/ToastContext';
import { Loader2, Upload } from 'lucide-react';

// Define interfaces for our component
interface ProfilePageProps {}

interface ProfilePageState {
  loading: boolean;
  uploadLoading: boolean;
  hasResume: boolean;
  currentTab: string;
  resumeUrl: string | null;
  cvData: any | null;
  userId: string | null;
  skills: string[];
}

export class ProfilePage extends Component<ProfilePageProps, ProfilePageState> {
  private supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );
  
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
      userId: null,
      skills: []
    };
  }
  
  componentDidMount() {
    this.checkAuthAndLoadProfile();
  }
  
  // Check if user is authenticated and load profile data
  checkAuthAndLoadProfile = async () => {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (!session) {
        // Redirect to login if not authenticated
        window.location.href = '/auth/login';
        return;
      }
      
      const userId = session.user.id;
      this.setState({ userId });
      
      await this.loadUserProfile(userId);
      await this.loadResumeData(userId);
      
    } catch (error) {
      console.error('Error checking authentication:', error);
    } finally {
      this.setState({ loading: false });
    }
  };
  
  // Load user profile data from Supabase
  loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) throw error;
      
      if (data && data.cv_data) {
        this.setState({ 
          cvData: data.cv_data,
          hasResume: true 
        });
        
        // Extract skills from CV data if available
        if (data.cv_data.skills) {
          this.setState({
            skills: this.processSkills(data.cv_data.skills)
          });
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };
  
  // Load resume data
  loadResumeData = async (userId: string) => {
    try {
      const { data, error } = await this.supabase
        .from('cvs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        this.setState({ 
          hasResume: true,
          resumeUrl: data[0].file_url || null
        });
        
        // Only set CV data if not already set from profile
        if (!this.state.cvData && data[0].skills) {
          this.setState({ 
            cvData: data[0].skills,
            skills: this.processSkills(data[0].skills)
          });
        }
      }
    } catch (error) {
      console.error('Error loading resume data:', error);
    }
  };
  
  // Process and clean up skills from CV data
  processSkills = (cvData: any): string[] => {
    if (!cvData || !cvData.skills || !Array.isArray(cvData.skills)) {
      return [];
    }
    
    // Filter out category labels from skills
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
      
      // Filter out long items
      if (skill.length > 30) {
        return false;
      }
      
      return true;
    });
  };
  
  // Handle file input click
  handleUploadClick = () => {
    // Trigger file input click
    if (this.fileInputRef.current) {
      this.fileInputRef.current.click();
    }
  };
  
  // Handle file selection
  handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !this.state.userId) {
      return;
    }
    
    const file = e.target.files[0];
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      ToastHelper.toast({
        title: "Error",
        description: "Please upload a valid PDF file",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      ToastHelper.toast({
        title: "Error",
        description: "Resume must be less than 10MB",
        variant: "destructive",
      });
      return;
    }
    
    this.setState({ uploadLoading: true });
    
    try {
      // In a real implementation, we would upload to Supabase Storage
      // and then call a server action to parse the CV
      // For now, we'll just simulate uploading
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful upload
      ToastHelper.toast({
        title: "Success",
        description: "Resume uploaded successfully",
      });
      
      // Set has resume to true and reload data
      this.setState({ hasResume: true });
      await this.loadResumeData(this.state.userId);
      
    } catch (error) {
      console.error('Error uploading resume:', error);
      ToastHelper.toast({
        title: "Error",
        description: "Failed to upload resume",
        variant: "destructive",
      });
    } finally {
      this.setState({ uploadLoading: false });
    }
  };
  
  // Handle tab change
  handleTabChange = (value: string) => {
    this.setState({ currentTab: value });
  };
  
  render() {
    const { 
      loading, 
      uploadLoading, 
      hasResume, 
      currentTab, 
      skills,
      cvData
    } = this.state;
    
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[80vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      );
    }
    
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        
        <Tabs
          value={currentTab}
          onValueChange={this.handleTabChange}
          className="w-full"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="info">Profile Info</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              {cvData?.personal_info ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={cvData.personal_info.name || 'N/A'} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={cvData.personal_info.email || 'N/A'} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={cvData.personal_info.phone || 'N/A'} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" value={cvData.personal_info.location || 'N/A'} readOnly />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No personal information available. Upload your resume to see these details.</p>
              )}
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Education</h2>
              {cvData?.education && cvData.education.length > 0 ? (
                <div className="space-y-4">
                  {cvData.education.map((edu: any, index: number) => (
                    <div key={index} className="border-b pb-4 last:border-0">
                      <h3 className="font-medium">{edu.institution || 'Unknown Institution'}</h3>
                      <p className="text-sm">{edu.degree || 'Degree not specified'}</p>
                      <p className="text-sm text-muted-foreground">
                        {edu.start_date || 'Start date unknown'} - {edu.end_date || 'Present'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No education history available. Upload your resume to see these details.</p>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="resume" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Resume Management</h2>
              
              {hasResume ? (
                <div className="space-y-4">
                  <p className="text-green-600 font-medium">Your resume has been uploaded and processed.</p>
                  
                  <div className="flex space-x-4">
                    {this.state.resumeUrl && (
                      <Button variant="outline" onClick={() => window.open(this.state.resumeUrl || '#', '_blank')}>
                        View Resume
                      </Button>
                    )}
                    
                    <Button onClick={this.handleUploadClick} disabled={uploadLoading}>
                      {uploadLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload New Version
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p>Upload your resume to enable AI-powered job matching and skill assessment.</p>
                  
                  <Button onClick={this.handleUploadClick} disabled={uploadLoading}>
                    {uploadLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Resume
                      </>
                    )}
                  </Button>
                </div>
              )}
              
              <input
                type="file"
                ref={this.fileInputRef}
                className="hidden"
                accept=".pdf"
                onChange={this.handleFileChange}
              />
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Resume Tips</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Use a clean, professional format</li>
                <li>Include relevant skills and experience</li>
                <li>Quantify achievements when possible</li>
                <li>Proofread carefully for errors</li>
                <li>Tailor your resume to each job application</li>
                <li>Use action verbs to describe responsibilities</li>
              </ul>
            </Card>
          </TabsContent>
          
          <TabsContent value="skills" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Skills Assessment</h2>
              
              {skills.length > 0 ? (
                <div className="space-y-4">
                  <p className="mb-4">Skills detected from your resume:</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <div 
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No skills detected. Upload your resume to analyze your skill set.
                </p>
              )}
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Job Matching</h2>
              
              {hasResume ? (
                <div className="space-y-4">
                  <p>Find jobs that match your skills and experience.</p>
                  <Button>View Matching Jobs</Button>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Upload your resume to enable job matching functionality.
                </p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
} 