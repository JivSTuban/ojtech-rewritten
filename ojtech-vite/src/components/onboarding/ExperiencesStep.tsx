import React, { Component, ChangeEvent } from 'react';
import localStorageManager from '../../lib/utils/localStorageManager';

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

interface ExperiencesStepProps {
  experiences: WorkExperience[];
  onExperiencesChange: (experiences: WorkExperience[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface ExperiencesStepState {
  experiences: WorkExperience[];
  currentExperience: WorkExperience;
  isEditing: boolean;
  editIndex: number | null;
  formErrors: Record<string, string>;
}

export default class ExperiencesStep extends Component<ExperiencesStepProps, ExperiencesStepState> {
  constructor(props: ExperiencesStepProps) {
    super(props);
    this.state = {
      experiences: props.experiences || [],
      currentExperience: this.getEmptyExperience(),
      isEditing: false,
      editIndex: null,
      formErrors: {}
    };
  }

  componentDidMount() {
    // Load saved experiences from localStorage if available
    const savedExperiences = localStorageManager.getStepData<WorkExperience[]>('experiences');
    if (savedExperiences && savedExperiences.length > 0) {
      this.setState({ experiences: savedExperiences });
      // Update parent component
      this.props.onExperiencesChange(savedExperiences);
    }
  }

  // Creates an empty work experience with a unique ID
  getEmptyExperience = (): WorkExperience => {
    return {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
  };

  // Handle form field changes
  handleExperienceChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    this.setState(prevState => {
      const updatedExperience = {
        ...prevState.currentExperience,
        [name]: value
      };

      const newErrors = {
        ...prevState.formErrors,
        [name]: this.validateField(name, value, updatedExperience)
      };

      // Re-validate end date if start date changes
      if (name === 'startDate' && updatedExperience.endDate) {
        newErrors.endDate = this.validateField('endDate', updatedExperience.endDate, updatedExperience);
      }

      return {
        currentExperience: updatedExperience,
        formErrors: newErrors
      };
    });
  };

  // Handle checkbox for current position
  handleCurrentChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    this.setState(prevState => ({
      currentExperience: {
        ...prevState.currentExperience,
        current: checked,
        // Clear end date if currently employed
        endDate: checked ? '' : prevState.currentExperience.endDate
      }
    }));
  };

  // Validate individual fields
  validateField = (name: string, value: string, experienceContext?: WorkExperience): string => {
    const exp = experienceContext || this.state.currentExperience;

    switch (name) {
      case 'title':
        return value.trim() === '' ? 'Job title is required' : '';
      case 'company':
        return value.trim() === '' ? 'Company name is required' : '';
      case 'startDate':
        if (value.trim() === '') return 'Start date is required';
        if (new Date(value) > new Date()) return 'Start date cannot be in the future';
        return '';
      case 'endDate':
        // End date is only required if not currently employed
        if (!exp.current && value.trim() === '') {
          return 'End date is required unless currently employed';
        }
        // Validate that end date is after start date
        if (value && exp.startDate) {
          const startDate = new Date(exp.startDate);
          const endDate = new Date(value);
          if (endDate <= startDate) {
            return 'End date must be after the start date';
          }
          if (endDate > new Date()) {
            return 'End date cannot be in the future';
          }
        }
        return '';
      case 'description':
        return value.trim() === '' ? 'Job description is required' : '';
      default:
        return '';
    }
  };

  // Validate the entire form
  validateForm = (): boolean => {
    const { title, company, startDate, endDate, current, description } = this.state.currentExperience;
    const errors: Record<string, string> = {};

    errors.title = this.validateField('title', title);
    errors.company = this.validateField('company', company);
    errors.startDate = this.validateField('startDate', startDate);

    // Only validate end date if not currently employed
    if (!current) {
      errors.endDate = this.validateField('endDate', endDate || '');
    }

    errors.description = this.validateField('description', description);

    this.setState({ formErrors: errors });

    // Check if we have any errors
    return !Object.values(errors).some(error => error !== '');
  };

  // Add a new work experience
  handleAddExperience = () => {
    if (!this.validateForm()) {
      return;
    }

    const { experiences, currentExperience, isEditing, editIndex } = this.state;
    let updatedExperiences: WorkExperience[];

    if (isEditing && editIndex !== null) {
      // Update existing experience
      updatedExperiences = [...experiences];
      updatedExperiences[editIndex] = currentExperience;
    } else {
      // Add new experience
      updatedExperiences = [...experiences, currentExperience];
    }

    this.setState({
      experiences: updatedExperiences,
      currentExperience: this.getEmptyExperience(),
      isEditing: false,
      editIndex: null,
      formErrors: {}
    });

    // Update parent component
    this.props.onExperiencesChange(updatedExperiences);

    // Save to localStorage
    localStorageManager.saveStepData('experiences', updatedExperiences);
  };

  // Edit an existing work experience
  handleEditExperience = (index: number) => {
    this.setState({
      currentExperience: { ...this.state.experiences[index] },
      isEditing: true,
      editIndex: index,
      formErrors: {}
    });
  };

  // Delete a work experience
  handleDeleteExperience = (index: number) => {
    const updatedExperiences = [...this.state.experiences];
    updatedExperiences.splice(index, 1);

    this.setState({ experiences: updatedExperiences });

    // Update parent component
    this.props.onExperiencesChange(updatedExperiences);

    // Save to localStorage
    localStorageManager.saveStepData('experiences', updatedExperiences);
  };

  // Cancel the current edit
  handleCancelEdit = () => {
    this.setState({
      currentExperience: this.getEmptyExperience(),
      isEditing: false,
      editIndex: null,
      formErrors: {}
    });
  };

  // Move to next step
  handleNext = () => {
    // Save experiences to localStorage
    localStorageManager.saveStepData('experiences', this.state.experiences);
    this.props.onNext();
  };

  // Format date for display
  formatDate = (dateString: string): string => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      });
    } catch (error) {
      return dateString;
    }
  };

  render() {
    const { experiences, currentExperience, isEditing, formErrors } = this.state;
    const { onPrev } = this.props;
    const today = new Date().toISOString().split('T')[0];

    return (
      <div className="space-y-4 sm:space-y-8 max-w-2xl mx-auto">
        <div className="text-center">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
            Work Experience
          </h3>
          <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
            Add your professional work history
          </p>
        </div>

        <div className="bg-gray-900/60 rounded-xl p-3 sm:p-4 md:p-6 backdrop-blur-sm border border-gray-800/50 shadow-xl shadow-black/5">
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="title" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={currentExperience.title}
                  onChange={this.handleExperienceChange}
                  className={`w-full bg-black/80 border ${formErrors.title ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300`}
                  placeholder="e.g., Software Engineer Intern"
                />
                {formErrors.title && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{formErrors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="company" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={currentExperience.company}
                  onChange={this.handleExperienceChange}
                  className={`w-full bg-black/80 border ${formErrors.company ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300`}
                  placeholder="e.g., Tech Solutions Inc."
                />
                {formErrors.company && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{formErrors.company}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                Location <span className="text-gray-500 text-[10px] sm:text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={currentExperience.location || ''}
                onChange={this.handleExperienceChange}
                className="w-full bg-black/80 border border-gray-700 text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300"
                placeholder="e.g., Remote"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="startDate" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={currentExperience.startDate}
                  onChange={this.handleExperienceChange}
                  max={today}
                  className={`w-full bg-black/80 border ${formErrors.startDate ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300`}
                />
                {formErrors.startDate && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{formErrors.startDate}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between">
                  <label htmlFor="endDate" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                    End Date
                  </label>
                </div>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={currentExperience.endDate || ''}
                  onChange={this.handleExperienceChange}
                  disabled={currentExperience.current}
                  min={currentExperience.startDate || undefined}
                  max={today}
                  className={`w-full bg-black/80 border ${formErrors.endDate ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300 ${currentExperience.current ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                {formErrors.endDate && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{formErrors.endDate}</p>
                )}

                <div className="flex items-center mt-1.5 sm:mt-2">
                  <input
                    type="checkbox"
                    id="current"
                    name="current"
                    checked={currentExperience.current}
                    onChange={this.handleCurrentChange}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-black border-gray-700 rounded focus:ring-gray-600 text-gray-600 focus:ring-offset-gray-900"
                  />
                  <label htmlFor="current" className="ml-1.5 sm:ml-2 text-xs sm:text-sm text-gray-400">
                    I currently work here
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                Job Description
              </label>
              <textarea
                id="description"
                name="description"
                value={currentExperience.description}
                onChange={this.handleExperienceChange}
                rows={4}
                className={`w-full bg-black/80 border ${formErrors.description ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300`}
                placeholder="Describe your responsibilities and achievements"
              />
              {formErrors.description && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-1">{formErrors.description}</p>
              )}
            </div>

            <div className="flex justify-end mt-3 sm:mt-4 space-x-2 sm:space-x-3">
              {isEditing && (
                <button
                  onClick={this.handleCancelEdit}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-white bg-gray-800 hover:bg-gray-700 transition-all duration-300 text-sm sm:text-base"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={this.handleAddExperience}
                className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg font-medium text-white bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 transition-all duration-300 text-sm sm:text-base"
              >
                {isEditing ? 'Update' : 'Add Experience'}
              </button>
            </div>
          </div>
        </div>

        {experiences.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-base sm:text-lg font-medium text-white">
              Your Work Experience
            </h4>

            <div className="space-y-2 sm:space-y-3">
              {experiences.map((exp, index) => (
                <div
                  key={exp.id}
                  className="bg-gray-900/40 rounded-lg p-3 sm:p-4 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300"
                >
                  <div className="flex justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h5 className="text-white font-medium text-sm sm:text-base">{exp.title}</h5>
                      <p className="text-gray-400 text-xs sm:text-sm">{exp.company}</p>
                      {exp.location && (
                        <p className="text-gray-500 text-xs sm:text-sm">{exp.location}</p>
                      )}
                      <div className="flex items-center mt-1 text-xs sm:text-sm text-gray-500">
                        <span>{this.formatDate(exp.startDate)} - {exp.current ? 'Present' : this.formatDate(exp.endDate || '')}</span>
                      </div>
                      <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2 whitespace-pre-wrap line-clamp-3">{exp.description}</p>
                    </div>

                    <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                      <button
                        onClick={() => this.handleEditExperience(index)}
                        className="text-gray-400 hover:text-gray-300 transition-colors p-1"
                        title="Edit experience"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => this.handleDeleteExperience(index)}
                        className="text-gray-400 hover:text-red-400 transition-colors p-1"
                        title="Delete experience"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-900/30 border border-gray-800/30 rounded-xl p-4 sm:p-6 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center mb-2 sm:mb-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h5 className="text-gray-300 font-medium text-sm sm:text-base">No work experience added yet</h5>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Add your internship or job experiences to demonstrate your professional background</p>
          </div>
        )}

        <div className="flex justify-between pt-4 sm:pt-6 gap-2 sm:gap-0">
          <button
            onClick={onPrev}
            className="px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-white border border-gray-700/50 hover:bg-gray-900/30 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back
          </button>
          <button
            onClick={this.handleNext}
            className="px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-white bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 hover:shadow-lg hover:shadow-black/20 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
          >
            <span className="hidden sm:inline">Continue to Contact</span>
            <span className="sm:hidden">Continue</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    );
  }
} 