import React, { Component, ChangeEvent, FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import profileService from '../../lib/api/profileService';
import { useToast } from '../ui/use-toast';
import { ToastContext } from '../../providers/ToastContext';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    location?: string;
    address?: string;
    bio?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    skills?: string[];
  };
}

interface ProfileEditModalState {
  formData: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    location: string;
    address: string;
    bio: string;
    githubUrl: string;
    linkedinUrl: string;
    portfolioUrl: string;
    skills: string[];
  };
  isSubmitting: boolean;
  skillInput: string;
}

class ProfileEditModalClass extends Component<ProfileEditModalProps, ProfileEditModalState> {
  static contextType = ToastContext;
  declare context: React.ContextType<typeof ToastContext>;

  constructor(props: ProfileEditModalProps) {
    super(props);
    
    // Convert skills string to array if it's a string
    const initialSkills = typeof props.initialData.skills === 'string' 
      ? props.initialData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
      : props.initialData.skills || [];
    
    this.state = {
      formData: {
        firstName: props.initialData.firstName || '',
        lastName: props.initialData.lastName || '',
        phoneNumber: props.initialData.phoneNumber || '',
        location: props.initialData.location || '',
        address: props.initialData.address || '',
        bio: props.initialData.bio || '',
        githubUrl: props.initialData.githubUrl || '',
        linkedinUrl: props.initialData.linkedinUrl || '',
        portfolioUrl: props.initialData.portfolioUrl || '',
        skills: initialSkills,
      },
      isSubmitting: false,
      skillInput: '',
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