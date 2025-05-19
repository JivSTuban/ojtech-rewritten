import React, { Component, ChangeEvent, FormEvent } from 'react';
import jobService from '@/lib/api/jobService';
import { useNavigate, useParams, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input'; // Assuming Input component
import { Textarea } from '@/components/ui/Textarea'; // Assuming Textarea component
import { Label } from '@/components/ui/Label'; // Assuming Label component
import { Checkbox } from '@/components/ui/Checkbox'; // Assuming Checkbox component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface JobFormData {
  title: string;
  description: string;
  location: string;
  jobType: string;
  salaryRange?: string;
  skillsRequired: string[];
  closingDate?: string; // Store as ISO string or YYYY-MM-DD
  isActive: boolean;
}

interface JobFormPageProps {
  jobId?: string;
  navigate: (path: string) => void;
}

interface JobFormPageState {
  formData: JobFormData;
  skillsInput: string;
  isLoading: boolean;
  error: string | null;
  redirectTo: string | null;
}

class JobFormPageClass extends Component<JobFormPageProps, JobFormPageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  constructor(props: JobFormPageProps) {
    super(props);
    this.state = {
      formData: {
    title: '',
    description: '',
    location: '',
    jobType: 'Full-time', // Default job type
    salaryRange: '',
    skillsRequired: [],
    closingDate: '',
    isActive: true,
      },
      skillsInput: '',
      isLoading: false,
      error: null,
      redirectTo: null
    };
  }

  componentDidMount() {
    const { user } = this.context || {};
    
    if (!user || !user.roles.includes('ROLE_EMPLOYER')) {
      this.setState({ redirectTo: '/login' });
      return;
    }
    
    if (this.props.jobId) {
      this.fetchJobData();
    }
  }

  fetchJobData = async () => {
    const { jobId } = this.props;
    
    if (!jobId) return;
    
    this.setState({ isLoading: true });
    
      try {
        const job = await jobService.getEmployerJobById(jobId);
      
      this.setState({
        formData: {
          title: job.title || '',
          description: job.description || '',
          location: job.location || '',
          jobType: job.jobType || 'Full-time',
          salaryRange: job.salaryRange || '',
          skillsRequired: job.skillsRequired || [],
          closingDate: job.closingDate ? new Date(job.closingDate).toISOString().split('T')[0] : '', // Format for input type=date
          isActive: job.isActive === undefined ? true : job.isActive,
        },
        skillsInput: (job.skillsRequired || []).join(', ')
        });
      } catch (err: any) {
      this.setState({
        error: err.response?.data?.message || 'Failed to load job data.'
      });
      } finally {
      this.setState({ isLoading: false });
      }
  };

  handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
      this.setState(prev => ({
        formData: { ...prev.formData, [name]: checked }
      }));
    } else {
      this.setState(prev => ({
        formData: { ...prev.formData, [name]: value }
      }));
    }
  };

  handleSkillsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const skillsInput = e.target.value;
    const skills = skillsInput.split(',').map(skill => skill.trim()).filter(skill => skill);
    
    this.setState({
      skillsInput,
      formData: {
        ...this.state.formData,
        skillsRequired: skills
      }
    });
  };

  handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    this.setState({ error: null, isLoading: true });

    // Convert closingDate to ISO string if it exists, otherwise null
    const payload = {
      ...this.state.formData,
      closingDate: this.state.formData.closingDate ? new Date(this.state.formData.closingDate).toISOString() : null,
    };

    const isEditMode = Boolean(this.props.jobId);

    try {
      if (isEditMode && this.props.jobId) {
        await jobService.updateJob(this.props.jobId, payload);
      } else {
        await jobService.createJob(payload);
      }
      this.props.navigate('/employer/jobs');
    } catch (err: any) {
      this.setState({
        error: err.response?.data?.message || (isEditMode ? 'Failed to update job.' : 'Failed to create job.')
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    const { formData, skillsInput, isLoading, error, redirectTo } = this.state;
    const isEditMode = Boolean(this.props.jobId);
    
    if (redirectTo) {
      return <Navigate to={redirectTo} />;
    }
  
  if (isLoading && isEditMode) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading job details...</p></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto dark:bg-gray-800">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                    {isEditMode ? 'Edit Job Posting' : 'Create New Job Posting'}
                </CardTitle>
            </CardHeader>
            <CardContent>
            <form onSubmit={this.handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="title" className="dark:text-gray-300">Job Title</Label>
                <Input type="text" name="title" id="title" value={formData.title} onChange={this.handleChange} required 
                               className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                    </div>

                    <div>
                        <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                <Textarea name="description" id="description" rows={5} value={formData.description} onChange={this.handleChange} required 
                                  className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"/>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="location" className="dark:text-gray-300">Location (e.g., City, Remote)</Label>
                  <Input type="text" name="location" id="location" value={formData.location} onChange={this.handleChange} required 
                                   className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"/>
                        </div>
                        <div>
                            <Label htmlFor="jobType" className="dark:text-gray-300">Job Type</Label>
                  <select name="jobType" id="jobType" value={formData.jobType} onChange={this.handleChange} required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Internship">Internship</option>
                                <option value="Contract">Contract</option>
                                <option value="Temporary">Temporary</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="salaryRange" className="dark:text-gray-300">Salary Range (Optional)</Label>
                <Input type="text" name="salaryRange" id="salaryRange" value={formData.salaryRange} onChange={this.handleChange} 
                               className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="e.g., PHP 20,000 - PHP 30,000"/>
                    </div>

                    <div>
                        <Label htmlFor="skillsRequired" className="dark:text-gray-300">Skills Required (comma-separated)</Label>
                <Input type="text" name="skillsRequired" id="skillsRequired" value={skillsInput} onChange={this.handleSkillsChange} required 
                               className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"/>
                    </div>

                    <div>
                        <Label htmlFor="closingDate" className="dark:text-gray-300">Application Closing Date (Optional)</Label>
                <Input type="date" name="closingDate" id="closingDate" value={formData.closingDate} onChange={this.handleChange} 
                               className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"/>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox id="isActive" name="isActive" checked={formData.isActive} 
                                  onCheckedChange={(checkedState) => { 
                          this.setState(prev => ({
                            formData: { ...prev.formData, isActive: Boolean(checkedState) }
                          }));
                                  }}
                                  className="dark:border-gray-600"/>
                        <Label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Job is Active (Visible to applicants)
                        </Label>
                    </div>

                    {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 dark:bg-red-900/30 dark:border-red-500">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <Link to="/employer/jobs">
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={isLoading} variant="default">
                        {isLoading ? (isEditMode ? 'Saving Changes...' : 'Creating Job...') : (isEditMode ? 'Save Changes' : 'Create Job')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
  );
  }
}

// Wrapper component to handle routing props
export const JobFormPage: React.FC = () => {
  const { jobId } = useParams<{ jobId?: string }>();
  const navigate = useNavigate();
  
  return <JobFormPageClass jobId={jobId} navigate={navigate} />;
}; 