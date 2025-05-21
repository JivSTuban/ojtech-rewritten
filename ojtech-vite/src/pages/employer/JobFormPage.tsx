import React, { Component, ChangeEvent, FormEvent } from 'react';
import jobService from '@/lib/api/jobService';
import { useNavigate, useParams, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/Command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";

// Tech stack suggestions
const techSuggestions = [
  // Programming Languages
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Ruby", "PHP", "Go", "Rust", "Swift",
  // Frontend
  "React", "Vue.js", "Angular", "Next.js", "Svelte", "HTML", "CSS", "Sass", "Tailwind CSS", "Bootstrap",
  // Backend
  "Node.js", "Express.js", "Django", "Spring Boot", "Laravel", "Ruby on Rails", "ASP.NET", "FastAPI",
  // Database
  "MongoDB", "PostgreSQL", "MySQL", "Redis", "SQLite", "Oracle", "Microsoft SQL Server", "Elasticsearch",
  // Cloud & DevOps
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "Git", "GitHub Actions", "CircleCI",
  // Mobile
  "React Native", "Flutter", "iOS", "Android", "Kotlin", "SwiftUI", "Xamarin",
  // Testing
  "Jest", "Cypress", "Selenium", "JUnit", "PyTest", "Mocha", "Testing Library",
  // Other
  "GraphQL", "REST API", "WebSocket", "Redux", "Vuex", "Machine Learning", "AI", "Blockchain"
];

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
  showSuggestions: boolean;
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
        redirectTo: null,
        showSuggestions: false
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
        requiredSkillInput: '',
        preferredSkillInput: ''
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
    } else if (name === 'minSalary' || name === 'maxSalary') {
      // Only allow numbers for salary fields
      const numericValue = value.replace(/\D/g, '');
      this.setState(prev => ({
        formData: { ...prev.formData, [name]: numericValue }
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
    const value = e.target.value;
    this.setState({
      requiredSkillInput: value,
      showSuggestions: value.length > 0
    });
  };

  handleSuggestionSelect = (suggestion: string) => {
    const { formData } = this.state;
    if (!formData.skillsRequired.includes(suggestion)) {
      this.setState({
        formData: {
          ...formData,
          skillsRequired: [...formData.skillsRequired, suggestion]
        },
        requiredSkillInput: '',
        showSuggestions: false
      });
    }
  };

  handlePreferredSkillsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    this.setState({
      preferredSkillInput: value,
      showSuggestions: value.length > 0
    });
  };

  handlePreferredSkillSelect = (tech: string) => {
    const { formData } = this.state;
    if (!formData.skillsPreferred.includes(tech)) {
      this.setState({
        formData: {
          ...formData,
          skillsPreferred: [...formData.skillsPreferred, tech]
        },
        preferredSkillInput: '',
        showSuggestions: false
      });
    }
  };

  removeRequiredSkill = (skillToRemove: string) => {
    this.setState(prev => ({
      formData: {
        ...prev.formData,
        skillsRequired: prev.formData.skillsRequired.filter(skill => skill !== skillToRemove)
      }
    }));
  };

  removePreferredSkill = (skillToRemove: string) => {
    this.setState(prev => ({
      formData: {
        ...prev.formData,
        skillsPreferred: prev.formData.skillsPreferred.filter(skill => skill !== skillToRemove)
      }
    }));
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

  validateForm = (): { isValid: boolean; error: string | null } => {
    const { formData } = this.state;
    
    // Validate title (3-100 chars, no special characters except -, &, and spaces)
    if (!formData.title.trim() || formData.title.length < 3 || formData.title.length > 100) {
      return {
        isValid: false,
        error: "Job title must be between 3 and 100 characters"
      };
    }
    if (!/^[a-zA-Z0-9\s\-&]+$/.test(formData.title)) {
      return {
        isValid: false,
        error: "Job title can only contain letters, numbers, spaces, hyphens, and &"
      };
    }

    // Validate description (minimum 100 characters)
    if (!formData.description.trim() || formData.description.length < 100) {
      return {
        isValid: false,
        error: "Job description must be at least 100 characters long"
      };
    }

    // Validate salary range
    if (formData.minSalary && formData.maxSalary) {
      const min = parseInt(formData.minSalary);
      const max = parseInt(formData.maxSalary);
      if (min >= max) {
        return {
          isValid: false,
          error: "Minimum salary must be less than maximum salary"
        };
      }
      if (min < 0 || max < 0) {
        return {
          isValid: false,
          error: "Salary values cannot be negative"
        };
      }
    }

    // Validate required skills
    if (formData.skillsRequired.length === 0) {
      return {
        isValid: false,
        error: "At least one required skill must be specified"
      };
    }

    return { isValid: true, error: null };
  };

  handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    this.setState({ error: null });

    // Validate form
    const { isValid, error } = this.validateForm();
    if (!isValid) {
      this.setState({ error });
      return;
    }

    this.setState({ isLoading: true });

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
        <div className="max-w-4xl mx-auto bg-black/90 backdrop-blur-sm text-white rounded-lg shadow-xl border border-gray-800">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-700 p-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {isEditMode ? 'Edit Job Posting' : 'Create New Job Posting'}
            </h1>
            <p className="text-gray-400 mt-3">
              Fill out the form below to create a compelling job posting. Take your time to provide detailed information to attract the right candidates.
            </p>
          </div>

          <form onSubmit={this.handleSubmit} className="p-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Job Details</h2>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title" className="block mb-2 text-base">
                    Job Title <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <Input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={this.handleChange}
                      required
                      className="w-full bg-gray-900/70 border-gray-700 text-white pl-4 h-11 hover:border-gray-600 focus:border-blue-500 transition-colors"
                      placeholder="e.g. Senior React Developer"
                      pattern="^[a-zA-Z0-9\s\-&]+$"
                      maxLength={100}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-gray-400 text-sm">3-100 characters</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="block mb-2">
                    Job Location <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup.Root
                    value={formData.location}
                    onValueChange={this.handleLocationChange}
                    className="gap-4 flex flex-col"
                    aria-label="Job Location"
                  >
                    <div className={`flex items-center space-x-2 p-4 rounded-lg border transition-all ${
                      formData.location === "Remote" 
                        ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10' 
                        : 'border-gray-800 hover:border-gray-700'
                    }`}>
                      <RadioGroup.Item 
                        value="Remote" 
                        id="location-remote" 
                        className="aspect-square h-4 w-4 rounded-full border border-gray-400 cursor-pointer relative
                          before:content-[''] before:block before:w-2 before:h-2 before:rounded-full 
                          before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2
                          before:bg-blue-500 before:scale-0 data-[state=checked]:before:scale-100
                          before:transition-transform hover:border-blue-400"
                      />
                      <Label htmlFor="location-remote" className="font-medium">
                        <div className="flex flex-col">
                          <span>Remote</span>
                          <span className="text-sm text-gray-400">Work from anywhere</span>
                        </div>
                      </Label>
                    </div>
                    <div className={`flex items-center space-x-2 p-4 rounded-lg border transition-all ${
                      formData.location === "Rubicomm Center Sumlion Road Cebu Business Park, Cebu City"
                        ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10' 
                        : 'border-gray-800 hover:border-gray-700'
                    }`}>
                      <RadioGroup.Item 
                        value="Rubicomm Center Sumlion Road Cebu Business Park, Cebu City" 
                        id="location-office"
                        className="aspect-square h-4 w-4 rounded-full border border-gray-400 cursor-pointer relative
                          before:content-[''] before:block before:w-2 before:h-2 before:rounded-full 
                          before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2
                          before:bg-blue-500 before:scale-0 data-[state=checked]:before:scale-100
                          before:transition-transform hover:border-blue-400"
                      />
                      <Label htmlFor="location-office" className="font-medium">
                        <div className="flex flex-col">
                          <span>Office-based</span>
                          <span className="text-sm text-gray-400">
                            Rubicomm Center, Sumlion Road, Cebu Business Park, Cebu City
                          </span>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup.Root>
                </div>

                <div>
                  <Label htmlFor="jobType" className="block mb-2">
                    Job Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    name="jobType"
                    value={formData.jobType}
                    onValueChange={(value: string) => this.handleChange({ target: { name: 'jobType', value } } as any)}
                  >
                    <SelectTrigger 
                      id="jobType"
                      className="w-full bg-gray-900/70 border-gray-700 text-white hover:border-gray-600 focus:border-blue-500 transition-colors"
                    >
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">
                        <span className="flex items-center gap-2">
                          <span>🌟</span> Full-time
                        </span>
                      </SelectItem>
                      <SelectItem value="Part-time">
                        <span className="flex items-center gap-2">
                          <span>⭐</span> Part-time
                        </span>
                      </SelectItem>
                      <SelectItem value="Internship">
                        <span className="flex items-center gap-2">
                          <span>📚</span> Internship
                        </span>
                      </SelectItem>
                      <SelectItem value="Contract">
                        <span className="flex items-center gap-2">
                          <span>📝</span> Contract
                        </span>
                      </SelectItem>
                      <SelectItem value="Temporary">
                        <span className="flex items-center gap-2">
                          <span>⏳</span> Temporary
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                        type="number"
                        name="minSalary"
                        id="minSalary"
                        value={formData.minSalary}
                        onChange={this.handleChange}
                        min="0"
                        className="w-full pl-12 bg-gray-900/70 border-gray-700 text-white hover:border-gray-600 focus:border-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="e.g. 20000"
                        title="Enter minimum salary amount"
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
                        type="number"
                        name="maxSalary"
                        id="maxSalary"
                        value={formData.maxSalary}
                        onChange={this.handleChange}
                        min="0"
                        className="w-full pl-12 bg-gray-900/70 border-gray-700 text-white hover:border-gray-600 focus:border-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="e.g. 30000"
                        title="Enter maximum salary amount"
                      />
                    </div>
                    <p className="text-gray-500 text-xs mt-1">Optional - maximum salary offered</p>
                  </div>
                </div>


                <div>
                  <Label htmlFor="description" className="block mb-1 flex items-center justify-between">
                    <span>Job Description <span className="text-red-500">*</span></span>
                    <span className={`text-sm ${formData.description.length >= 100 ? 'text-green-500' : 'text-gray-500'}`}>
                      {formData.description.length}/100 min characters
                    </span>
                  </Label>
                  <Textarea
                    name="description"
                    id="description"
                    rows={8}
                    value={formData.description}
                    onChange={this.handleChange}
                    required
                    className={`w-full bg-gray-900/70 border-gray-700 text-white hover:border-gray-600 focus:border-blue-500 transition-colors resize-none ${
                      formData.description.length > 0 && formData.description.length < 100
                        ? 'border-yellow-500'
                        : formData.description.length >= 100
                        ? 'border-green-500'
                        : ''
                    }`}
                    placeholder="Describe the role in detail, including:&#13;&#10;• Key responsibilities&#13;&#10;• Required experience&#13;&#10;• Technical requirements&#13;&#10;• Benefits and perks"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">Required Skills</span>
                  <span className="text-red-500 ml-1">*</span>
                </h2>
                <div className="space-y-4">
                  <div className="flex">
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="flex-1 relative">
                            <Input
                              type="text"
                              name="requiredSkill"
                              value={requiredSkillInput}
                              onChange={this.handleRequiredSkillsChange}
                              className="w-full bg-gray-900/70 border-gray-700 text-white hover:border-gray-600 focus:border-blue-500 transition-colors"
                              placeholder="Search or enter a skill"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  this.addRequiredSkill();
                                }
                              }}
                            />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search skills..." />
                            <CommandList>
                              <CommandEmpty>No results found.</CommandEmpty>
                              <CommandGroup heading="Popular Technologies">
                                {techSuggestions
                                  .filter(tech => 
                                    tech.toLowerCase().includes(requiredSkillInput.toLowerCase()) &&
                                    !formData.skillsRequired.includes(tech)
                                  )
                                  .map((tech, index) => (
                                    <CommandItem
                                      key={index}
                                      value={tech}
                                      onSelect={() => this.handleSuggestionSelect(tech)}
                                      className="cursor-pointer flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-blue-500/20 hover:text-blue-400 transition-colors rounded"
                                    >
                                      {tech}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    <Button 
                      type="button" 
                      onClick={this.addRequiredSkill}
                      variant="outline"
                      className="ml-2 border-gray-700 hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 min-h-[100px] border border-gray-800">
                    {formData.skillsRequired.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {formData.skillsRequired.map((skill, index) => (
                          <div 
                            key={index} 
                            className="group bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm border border-blue-500/30 hover:bg-blue-500/30 transition-colors cursor-pointer flex items-center gap-2"
                            onClick={() => this.removeRequiredSkill(skill)}
                            title="Click to remove"
                          >
                            <span>{skill}</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">×</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic">No required skills added yet</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Preferred Skills</span>
                  <span className="text-gray-500 text-sm ml-2">(Optional)</span>
                </h2>
                <div className="space-y-4">
                  <div className="flex">
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="flex-1 relative">
                          <Input
                            type="text"
                            name="preferredSkill"
                            value={preferredSkillInput}
                            onChange={this.handlePreferredSkillsChange}
                            className="w-full bg-gray-900/70 border-gray-700 text-white hover:border-gray-600 focus:border-blue-500 transition-colors"
                            placeholder="Search or enter a skill"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                this.addPreferredSkill();
                              }
                            }}
                          />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search skills..." />
                          <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup heading="Popular Technologies">
                              {techSuggestions
                                .filter(tech => 
                                  tech.toLowerCase().includes(preferredSkillInput.toLowerCase()) &&
                                  !formData.skillsPreferred.includes(tech)
                                )
                                .map((tech, index) => (
                                  <CommandItem
                                    key={index}
                                    value={tech}
                                      onSelect={() => this.handlePreferredSkillSelect(tech)}
                                      className="cursor-pointer flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-purple-500/20 hover:text-purple-400 transition-colors rounded"
                                  >
                                    {tech}
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Button 
                      type="button" 
                      onClick={this.addPreferredSkill}
                      variant="outline"
                      className="ml-2 border-gray-700 hover:bg-purple-500/20 hover:text-purple-400 transition-colors"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 min-h-[100px] border border-gray-800">
                    {formData.skillsPreferred.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {formData.skillsPreferred.map((skill, index) => (
                          <div 
                            key={index} 
                            className="group bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm border border-purple-500/30 hover:bg-purple-500/30 transition-colors cursor-pointer flex items-center gap-2"
                            onClick={() => this.removePreferredSkill(skill)}
                            title="Click to remove"
                          >
                            <span>{skill}</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">×</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic">No preferred skills added yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
                Job Status <span className="text-red-500">*</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    formData.isActive 
                      ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/10' 
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                  onClick={() => {
                    this.setState(prev => ({
                      formData: { ...prev.formData, isActive: true }
                    }));
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${formData.isActive ? 'bg-green-500' : 'bg-gray-700'}`} />
                    <div>
                      <h3 className="font-semibold">Open</h3>
                      <p className="text-sm text-gray-400">Visible to candidates</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    !formData.isActive 
                      ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/10' 
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                  onClick={() => {
                    this.setState(prev => ({
                      formData: { ...prev.formData, isActive: false }
                    }));
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${!formData.isActive ? 'bg-yellow-500' : 'bg-gray-700'}`} />
                    <div>
                      <h3 className="font-semibold">Draft</h3>
                      <p className="text-sm text-gray-400">Save without publishing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div key={error} className="mb-6 bg-red-900/30 border-l-4 border-red-500 p-4 animate-shake">
                <p className="text-red-400 font-medium">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-4 border-t border-gray-800 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                className="border-gray-700 hover:bg-gray-800 min-w-[100px]"
                onClick={() => this.props.navigate('/employer/jobs')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 min-w-[150px] transition-all duration-300 shadow-lg shadow-blue-900/20"
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
