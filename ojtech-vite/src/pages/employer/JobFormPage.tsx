import React, { Component, ChangeEvent, FormEvent } from 'react';
import jobService from '@/lib/api/jobService';
import { useNavigate, useParams, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';

interface JobFormData {
  title: string;
  description: string;
  location: string;
  jobType: string;
  minSalary?: string;
  maxSalary?: string;
  skillsRequired: string[];
  skillsPreferred: string[];
  closingDate?: string;
  isActive: boolean;
}

interface JobFormPageProps {
  jobId?: string;
  navigate: (path: string) => void;
}

interface JobFormPageState {
  formData: JobFormData;
  requiredSkillInput: string;
  preferredSkillInput: string;
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
        location: 'Remote',
        jobType: 'Full-time',
        minSalary: '',
        maxSalary: '',
        skillsRequired: [],
        skillsPreferred: [],
        closingDate: '',
        isActive: true,
      },
      requiredSkillInput: '',
      preferredSkillInput: '',
      isLoading: false,
      error: null,
      redirectTo: null
    };
  }

  componentDidMount() {
    // const { user } = this.context || {};
    
    // if (!user || !user.roles.includes('ROLE_EMPLOYER')) {
    //   this.setState({ redirectTo: '/login' });
    //   return;
    // }
    
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
      
      // Parse salary range if available
      let minSalary = '';
      let maxSalary = '';
      if (job.salaryRange) {
        const salaryParts = job.salaryRange.split('-').map((part: string) => part.trim());
        if (salaryParts.length === 2) {
          minSalary = salaryParts[0].replace(/[^\d]/g, '');
          maxSalary = salaryParts[1].replace(/[^\d]/g, '');
        }
      }
      
      this.setState({
        formData: {
          title: job.title || '',
          description: job.description || '',
          location: job.location || 'Remote',
          jobType: job.jobType || 'Full-time',
          minSalary,
          maxSalary,
          skillsRequired: job.skillsRequired || [],
          skillsPreferred: job.skillsPreferred || [],
          closingDate: job.closingDate ? new Date(job.closingDate).toISOString().split('T')[0] : '',
          isActive: job.isActive === undefined ? true : job.isActive,
        },
        requiredSkillInput: (job.skillsRequired || []).join(', '),
        preferredSkillInput: (job.skillsPreferred || []).join(', ')
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

  handleLocationChange = (value: string) => {
    this.setState(prev => ({
      formData: { ...prev.formData, location: value }
    }));
  };

  handleRequiredSkillsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const skillsInput = e.target.value;
    const skills = skillsInput.split(',').map(skill => skill.trim()).filter(skill => skill);
    
    this.setState({
      requiredSkillInput: skillsInput,
      formData: {
        ...this.state.formData,
        skillsRequired: skills
      }
    });
  };

  handlePreferredSkillsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const skillsInput = e.target.value;
    const skills = skillsInput.split(',').map(skill => skill.trim()).filter(skill => skill);
    
    this.setState({
      preferredSkillInput: skillsInput,
      formData: {
        ...this.state.formData,
        skillsPreferred: skills
      }
    });
  };

  addRequiredSkill = () => {
    const { requiredSkillInput, formData } = this.state;
    if (!requiredSkillInput.trim()) return;
    
    const newSkill = requiredSkillInput.trim();
    if (!formData.skillsRequired.includes(newSkill)) {
      this.setState({
        formData: {
          ...formData,
          skillsRequired: [...formData.skillsRequired, newSkill]
        },
        requiredSkillInput: ''
      });
    }
  };

  addPreferredSkill = () => {
    const { preferredSkillInput, formData } = this.state;
    if (!preferredSkillInput.trim()) return;
    
    const newSkill = preferredSkillInput.trim();
    if (!formData.skillsPreferred.includes(newSkill)) {
      this.setState({
        formData: {
          ...formData,
          skillsPreferred: [...formData.skillsPreferred, newSkill]
        },
        preferredSkillInput: ''
      });
    }
  };

  handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    this.setState({ error: null, isLoading: true });

    // Construct salary range from min and max
    const salaryRange = this.state.formData.minSalary || this.state.formData.maxSalary 
      ? `PHP ${this.state.formData.minSalary || '0'} - PHP ${this.state.formData.maxSalary || '0'}`
      : '';

    // Prepare payload
    const payload = {
      ...this.state.formData,
      salaryRange,
      closingDate: this.state.formData.closingDate ? new Date(this.state.formData.closingDate).toISOString() : null,
    };

    // Remove temporary fields not needed in API
    delete (payload as any).minSalary;
    delete (payload as any).maxSalary;

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
    const { formData, requiredSkillInput, preferredSkillInput, isLoading, error, redirectTo } = this.state;
    const isEditMode = Boolean(this.props.jobId);
    
    if (redirectTo) {
      return <Navigate to={redirectTo} />;
    }
  
    if (isLoading && isEditMode) {
      return <div className="min-h-screen flex items-center justify-center"><p>Loading job details...</p></div>;
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-black text-white rounded-md">
          <div className="border-b border-gray-700 p-6">
            <h1 className="text-2xl font-bold">
              {isEditMode ? 'Edit Job' : 'Create New Job'}
            </h1>
            <p className="text-gray-400 mt-2">
              Fill out the form below to create a new job posting. Jobs set to "Active" will be visible to candidates.
            </p>
          </div>

          <form onSubmit={this.handleSubmit} className="p-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Job Details</h2>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title" className="block mb-1">
                    Job Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={this.handleChange}
                    required
                    className="w-full bg-gray-900 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label className="block mb-1">
                    Job Location <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="location-remote" 
                        name="location" 
                        value="Remote"
                        checked={formData.location === "Remote"}
                        onChange={() => this.handleLocationChange("Remote")}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="location-remote">Remote</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="location-office" 
                        name="location" 
                        value="Rubicomm Center Sumlion Road Cebu Business Park, Cebu City"
                        checked={formData.location === "Rubicomm Center Sumlion Road Cebu Business Park, Cebu City"}
                        onChange={() => this.handleLocationChange("Rubicomm Center Sumlion Road Cebu Business Park, Cebu City")}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="location-office">Rubicomm Center Sumlion Road Cebu Business Park, Cebu City</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="jobType" className="block mb-1">
                    Job Type <span className="text-red-500">*</span>
                  </Label>
                  <select
                    name="jobType"
                    id="jobType"
                    value={formData.jobType}
                    onChange={this.handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="minSalary" className="block mb-1">
                      Minimum Salary
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                        PHP
                      </div>
                      <Input
                        type="text"
                        name="minSalary"
                        id="minSalary"
                        value={formData.minSalary}
                        onChange={this.handleChange}
                        className="w-full pl-12 bg-gray-900 border-gray-700 text-white"
                        placeholder="e.g. 20000"
                      />
                    </div>
                    <p className="text-gray-500 text-xs mt-1">Optional - minimum salary offered</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="maxSalary" className="block mb-1">
                      Maximum Salary
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                        PHP
                      </div>
                      <Input
                        type="text"
                        name="maxSalary"
                        id="maxSalary"
                        value={formData.maxSalary}
                        onChange={this.handleChange}
                        className="w-full pl-12 bg-gray-900 border-gray-700 text-white"
                        placeholder="e.g. 30000"
                      />
                    </div>
                    <p className="text-gray-500 text-xs mt-1">Optional - maximum salary offered</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="closingDate" className="block mb-1">
                    Application Deadline
                  </Label>
                  <Input
                    type="date"
                    name="closingDate"
                    id="closingDate"
                    value={formData.closingDate}
                    onChange={this.handleChange}
                    className="w-full bg-gray-900 border-gray-700 text-white"
                  />
                  <p className="text-gray-500 text-xs mt-1">Optional - the last day applications will be accepted</p>
                </div>

                <div>
                  <Label htmlFor="description" className="block mb-1">
                    Job Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    name="description"
                    id="description"
                    rows={8}
                    value={formData.description}
                    onChange={this.handleChange}
                    required
                    className="w-full bg-gray-900 border-gray-700 text-white"
                    placeholder="Describe the job, responsibilities, and requirements..."
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
                Required Skills <span className="text-red-500">*</span>
              </h2>
              <div className="flex">
                <Input
                  type="text"
                  name="requiredSkill"
                  value={requiredSkillInput}
                  onChange={this.handleRequiredSkillsChange}
                  className="flex-1 bg-gray-900 border-gray-700 text-white"
                  placeholder="Add a required skill"
                />
                <Button 
                  type="button" 
                  onClick={this.addRequiredSkill}
                  variant="outline"
                  className="ml-2 border-gray-700"
                >
                  Add
                </Button>
              </div>
              {formData.skillsRequired.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.skillsRequired.map((skill, index) => (
                    <div key={index} className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
                      {skill}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
                Preferred Skills (Optional)
              </h2>
              <div className="flex">
                <Input
                  type="text"
                  name="preferredSkill"
                  value={preferredSkillInput}
                  onChange={this.handlePreferredSkillsChange}
                  className="flex-1 bg-gray-900 border-gray-700 text-white"
                  placeholder="Add a preferred skill"
                />
                <Button 
                  type="button" 
                  onClick={this.addPreferredSkill}
                  variant="outline"
                  className="ml-2 border-gray-700"
                >
                  Add
                </Button>
              </div>
              {formData.skillsPreferred.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.skillsPreferred.map((skill, index) => (
                    <div key={index} className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
                      {skill}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
                Job Status <span className="text-red-500">*</span>
              </h2>
              <select
                name="status"
                id="status"
                value={formData.isActive ? "Open" : "Draft"}
                onChange={(e) => {
                  this.setState(prev => ({
                    formData: { ...prev.formData, isActive: e.target.value === "Open" }
                  }));
                }}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md"
              >
                <option value="Open">Open</option>
                <option value="Draft">Draft</option>
              </select>
              <p className="text-gray-500 text-xs mt-1">
                Draft: Save without publishing. Open: Visible to candidates. Closed: No longer accepting applications.
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-900/30 border-l-4 border-red-500 p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                className="border-gray-700 hover:bg-gray-800"
                onClick={() => this.props.navigate('/employer/jobs')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading 
                  ? (isEditMode ? 'Saving Changes...' : 'Creating Job...') 
                  : (isEditMode ? 'Save Changes' : 'Create Job')}
              </Button>
            </div>
          </form>
        </div>
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