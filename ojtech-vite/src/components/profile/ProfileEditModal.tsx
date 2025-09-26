import React, { Component, ChangeEvent, FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Checkbox } from '../ui/Checkbox';
import { Card, CardContent } from '../ui/Card';
import profileService from '../../lib/api/profileService';
import { ToastContext } from '../../providers/ToastContext';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '../ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import { cn } from '../../lib/utils';

interface GithubProject {
  name: string;
  url: string;
  description: string;
  technologies: string[];
  stars?: number;
  forks?: number;
  lastUpdated?: string;
  readme?: string;
}

interface Experience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  isCurrentPosition?: boolean;
}

interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData: {
    id?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    phoneNumber?: string;
    location?: string;
    address?: string;
    bio?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    skills?: string[];
    university?: string;
    major?: string;
    graduationYear?: number;
    role?: string;
    hasCompletedOnboarding?: boolean;
    githubProjects?: GithubProject[];
    certifications?: Certification[];
    experiences?: Experience[];
  };
}

interface ProfileEditModalState {
  formData: {
    id?: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    phoneNumber: string;
    location: string;
    address: string;
    bio: string;
    githubUrl: string;
    linkedinUrl: string;
    portfolioUrl: string;
    skills: string[];
    university: string;
    major: string;
    graduationYear?: number;
    role?: string;
    hasCompletedOnboarding?: boolean;
    githubProjects: GithubProject[];
    certifications: Certification[];
    experiences: Experience[];
  };
  isSubmitting: boolean;
  skillInput: string;
  newGithubProject: GithubProject;
  newCertification: Certification;
  newExperience: Experience;
  techInput: string;
  activeTab: 'basic' | 'education' | 'projects' | 'certifications' | 'experience';
}

class ProfileEditModalClass extends Component<ProfileEditModalProps, ProfileEditModalState> {
  static contextType = ToastContext;
  declare context: React.ContextType<typeof ToastContext>;

  constructor(props: ProfileEditModalProps) {
    super(props);
    
    // Convert skills string to array if it's a string
    const initialSkills = Array.isArray(props.initialData.skills)
      ? props.initialData.skills
      : typeof props.initialData.skills === 'string'
        ? props.initialData.skills.split(',').map((skill: string) => skill.trim()).filter(Boolean)
        : [];
    
    this.state = {
      formData: {
        id: props.initialData.id,
        firstName: props.initialData.firstName || '',
        lastName: props.initialData.lastName || '',
        fullName: props.initialData.fullName || '',
        phoneNumber: props.initialData.phoneNumber || '',
        location: props.initialData.location || '',
        address: props.initialData.address || '',
        bio: props.initialData.bio || '',
        githubUrl: props.initialData.githubUrl || '',
        linkedinUrl: props.initialData.linkedinUrl || '',
        portfolioUrl: props.initialData.portfolioUrl || '',
        skills: initialSkills,
        university: props.initialData.university || '',
        major: props.initialData.major || '',
        graduationYear: props.initialData.graduationYear,
        role: props.initialData.role || 'STUDENT',
        hasCompletedOnboarding: props.initialData.hasCompletedOnboarding || false,
        githubProjects: props.initialData.githubProjects || [],
        certifications: props.initialData.certifications || [],
        experiences: props.initialData.experiences || [],
      },
      isSubmitting: false,
      skillInput: '',
      techInput: '',
      activeTab: 'basic',
      newGithubProject: {
        name: '',
        url: '',
        description: '',
        technologies: [],
      },
      newCertification: {
        name: '',
        issuer: '',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        credentialUrl: '',
      },
      newExperience: {
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
        isCurrentPosition: false,
      },
    };
  }
  
  handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: value
      }
    }));
  };
  
  handleSkillInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ skillInput: e.target.value });
  };
  
  handleAddSkill = () => {
    const { skillInput, formData } = this.state;
    if (skillInput.trim()) {
      this.setState(prevState => ({
        formData: {
          ...prevState.formData,
          skills: [...prevState.formData.skills, skillInput.trim()]
        },
        skillInput: ''
      }));
    }
  };
  
  handleRemoveSkill = (index: number) => {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        skills: prevState.formData.skills.filter((_, i) => i !== index)
      }
    }));
  };
  
  // GitHub Projects methods
  handleGithubProjectInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      newGithubProject: {
        ...prevState.newGithubProject,
        [name]: value
      }
    }));
  };
  
  handleTechInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ techInput: e.target.value });
  };
  
  handleAddTech = () => {
    const { techInput, newGithubProject } = this.state;
    if (techInput.trim()) {
      this.setState(prevState => ({
        newGithubProject: {
          ...prevState.newGithubProject,
          technologies: [...prevState.newGithubProject.technologies, techInput.trim()]
        },
        techInput: ''
      }));
    }
  };
  
  handleRemoveTech = (index: number) => {
    this.setState(prevState => ({
      newGithubProject: {
        ...prevState.newGithubProject,
        technologies: prevState.newGithubProject.technologies.filter((_, i) => i !== index)
      }
    }));
  };
  
  handleAddGithubProject = () => {
    const { newGithubProject } = this.state;
    if (newGithubProject.name && newGithubProject.url) {
      this.setState(prevState => ({
        formData: {
          ...prevState.formData,
          githubProjects: [...prevState.formData.githubProjects, newGithubProject]
        },
        newGithubProject: {
          name: '',
          url: '',
          description: '',
          technologies: [],
        }
      }));
    }
  };
  
  handleRemoveGithubProject = (index: number) => {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        githubProjects: prevState.formData.githubProjects.filter((_, i) => i !== index)
      }
    }));
  };
  
  // Certification methods
  handleCertificationInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      newCertification: {
        ...prevState.newCertification,
        [name]: value
      }
    }));
  };
  
  handleAddCertification = () => {
    const { newCertification } = this.state;
    if (newCertification.name && newCertification.issuer && newCertification.issueDate) {
      this.setState(prevState => ({
        formData: {
          ...prevState.formData,
          certifications: [...prevState.formData.certifications, newCertification]
        },
        newCertification: {
          name: '',
          issuer: '',
          issueDate: '',
          expiryDate: '',
          credentialId: '',
          credentialUrl: '',
        }
      }));
    }
  };
  
  handleRemoveCertification = (index: number) => {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        certifications: prevState.formData.certifications.filter((_, i) => i !== index)
      }
    }));
  };
  
  // Experience methods
  handleExperienceInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      newExperience: {
        ...prevState.newExperience,
        [name]: value
      }
    }));
  };
  
  handleExperienceCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    this.setState(prevState => ({
      newExperience: {
        ...prevState.newExperience,
        isCurrentPosition: checked,
        endDate: checked ? '' : prevState.newExperience.endDate
      }
    }));
  };
  
  handleAddExperience = () => {
    const { newExperience } = this.state;
    if (newExperience.title && newExperience.company && newExperience.startDate) {
      this.setState(prevState => ({
        formData: {
          ...prevState.formData,
          experiences: [...prevState.formData.experiences, newExperience]
        },
        newExperience: {
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          description: '',
          isCurrentPosition: false,
        }
      }));
    }
  };
  
  handleRemoveExperience = (index: number) => {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        experiences: prevState.formData.experiences.filter((_, i) => i !== index)
      }
    }));
  };
  
  // Tab navigation
  setActiveTab = (tab: 'basic' | 'education' | 'projects' | 'certifications' | 'experience') => {
    this.setState({ activeTab: tab });
  };
  
  handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    this.setState({ isSubmitting: true });
    
    try {
      await profileService.updateProfile(this.state.formData);
      this.context?.toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "default",
      });
      this.props.onSaved();
      this.props.onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      this.context?.toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      this.setState({ isSubmitting: false });
    }
  };
  
  render() {
    const { isOpen, onClose } = this.props;
    const { formData, isSubmitting, skillInput } = this.state;
    
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Profile Information</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={this.handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={this.handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={this.handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={this.handleInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={this.handleInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={this.handleInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={this.handleInputChange}
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input
                id="githubUrl"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={this.handleInputChange}
                placeholder="https://github.com/username"
              />
            </div>
            
            <div>
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={this.handleInputChange}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            
            <div>
              <Label htmlFor="portfolioUrl">Portfolio URL</Label>
              <Input
                id="portfolioUrl"
                name="portfolioUrl"
                value={formData.portfolioUrl}
                onChange={this.handleInputChange}
                placeholder="https://portfolio.com"
              />
            </div>
            
            <div>
              <Label>Skills</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={skillInput}
                  onChange={this.handleSkillInputChange}
                  placeholder="Enter a skill"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), this.handleAddSkill())}
                />
                <Button type="button" onClick={this.handleAddSkill}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => this.handleRemoveSkill(index)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
}

// Wrap the class component with ToastContext
const ProfileEditModal = (props: ProfileEditModalProps) => {
  return (
    <ToastContext.Consumer>
      {(toastContext) => <ProfileEditModalClass {...props} />}
    </ToastContext.Consumer>
  );
};

export default ProfileEditModal; 