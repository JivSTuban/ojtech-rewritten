import React, { Component, ChangeEvent } from 'react';
import localStorageManager from '../../lib/utils/localStorageManager';
import { toast } from '../ui/toast-utils';

interface StudentProfileData {
  university?: string;
  major?: string;
  graduationYear?: number;
  [key: string]: any;
}

const MAJOR_OPTIONS = [
  'Bachelor of Science in Information Technology',
  'Bachelor of Science in Computer Science',
  'Other'
];

interface EducationStepProps {
  formData: StudentProfileData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface EducationStepState {
  showCustomMajor: boolean;
}

export default class EducationStep extends Component<EducationStepProps, EducationStepState> {
  constructor(props: EducationStepProps) {
    super(props);
    this.state = {
      showCustomMajor: !!(props.formData.major && !MAJOR_OPTIONS.slice(0, -1).includes(props.formData.major))
    };
  }

  componentDidMount() {
    // Load saved education info from localStorage
    const savedEducation = localStorageManager.getStepData<any>('education');
    if (savedEducation) {
      // Check if we need to update any fields
      const updates: Partial<StudentProfileData> = {};
      let needsUpdate = false;

      if (savedEducation.university && !this.props.formData.university) {
        updates.university = savedEducation.university;
        needsUpdate = true;
      }

      if (savedEducation.major && !this.props.formData.major) {
        updates.major = savedEducation.major;
        needsUpdate = true;
      }

      if (savedEducation.graduationYear && !this.props.formData.graduationYear) {
        updates.graduationYear = savedEducation.graduationYear;
        needsUpdate = true;
      }

      // If we have updates, simulate changes for each field
      if (needsUpdate) {
        for (const [key, value] of Object.entries(updates)) {
          const mockEvent = {
            target: {
              name: key,
              value: value
            }
          } as ChangeEvent<HTMLInputElement | HTMLSelectElement>;
          this.props.onChange(mockEvent);
        }

        console.log('Restored education info from localStorage:', updates);
      }
    } else {
      // Set default university if not already set
      if (!this.props.formData.university) {
        const mockEvent = {
          target: {
            name: 'university',
            value: 'Cebu Institute of Technology - University'
          }
        } as ChangeEvent<HTMLInputElement>;
        this.props.onChange(mockEvent);
      }
    }
  }

  handleMajorChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'Other') {
      this.setState({ showCustomMajor: true });
      // Clear the major field to allow custom input
      const mockEvent = {
        target: {
          name: 'major',
          value: ''
        }
      } as ChangeEvent<HTMLInputElement>;
      this.props.onChange(mockEvent);
    } else {
      this.setState({ showCustomMajor: false });
      this.props.onChange(e);
    }
  };

  isValid = (): boolean => {
    const { formData } = this.props;
    const yearValid = formData.graduationYear && formData.graduationYear > 1980 && formData.graduationYear < 3000;
    return !!(formData.university && formData.major && yearValid);
  };

  handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (this.isValid()) {
      // Save education data to localStorage
      localStorageManager.saveStepData('education', {
        university: this.props.formData.university,
        major: this.props.formData.major,
        graduationYear: this.props.formData.graduationYear
      });

      this.props.onNext();
    } else {
      toast.toast({
        title: 'Missing Required Fields',
        description: 'Please fill in all required fields before continuing.',
        variant: 'destructive'
      });
    }
  };

  render() {
    const { formData, onChange, onPrev } = this.props;

    return (
      <div className="space-y-4 sm:space-y-8 max-w-2xl mx-auto">
        <div className="text-center">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
            Educational Background
          </h3>
          <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
            Tell us about your academic journey
          </p>
        </div>

        <div className="bg-gray-900/60 rounded-xl p-3 sm:p-4 md:p-6 backdrop-blur-sm border border-gray-800/50 shadow-xl shadow-black/5">
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5 sm:space-y-2">
                <label htmlFor="university" className="block text-xs sm:text-sm font-medium text-gray-300">
                  University/School <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="university"
                    id="university"
                    value={formData.university || 'Cebu Institute of Technology - University'}
                    onChange={onChange}
                    required
                    readOnly
                    className="w-full pl-9 sm:pl-10 bg-black/80 border border-gray-700 text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300 cursor-not-allowed opacity-75"
                    placeholder="Your university or school"
                  />
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label htmlFor="major" className="block text-xs sm:text-sm font-medium text-gray-300">
                  Major/Course <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  {!this.state.showCustomMajor ? (
                    <select
                      name="major"
                      id="major"
                      value={formData.major || ''}
                      onChange={this.handleMajorChange}
                      required
                      className="w-full pl-9 sm:pl-10 bg-black/80 border border-gray-700 text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300 appearance-none"
                    >
                      <option value="">Select your major/course</option>
                      {MAJOR_OPTIONS.map(major => (
                        <option key={major} value={major}>{major}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="major"
                      id="major"
                      value={formData.major || ''}
                      onChange={onChange}
                      required
                      className="w-full pl-9 sm:pl-10 bg-black/80 border border-gray-700 text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your major/course"
                    />
                  )}
                  {!this.state.showCustomMajor && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  )}
                  {this.state.showCustomMajor && (
                    <button
                      type="button"
                      onClick={() => this.setState({ showCustomMajor: false })}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="graduationYear" className="block text-xs sm:text-sm font-medium text-gray-300">
                Expected Graduation Year <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="number"
                  name="graduationYear"
                  id="graduationYear"
                  value={formData.graduationYear || ''}
                  onChange={onChange}
                  min={1981}
                  max={2999}
                  required
                  className={`w-full pl-9 sm:pl-10 bg-black/80 border ${formData.graduationYear && (formData.graduationYear <= 1980 || formData.graduationYear >= 3000)
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-gray-700 focus:ring-gray-500/50'
                    } text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300`}
                  placeholder="Enter graduation year (1981-2999)"
                />
                {formData.graduationYear && (formData.graduationYear <= 1980 || formData.graduationYear >= 3000) && (
                  <p className="text-red-400 text-xs mt-1 ml-1">
                    Graduation year must be between 1981 and 2999
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 bg-gray-900/40 border border-gray-800/40 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-xs sm:text-sm text-gray-400">
                This information helps employers match you with relevant internship opportunities in your field of study.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 sm:pt-6 gap-2 sm:gap-0">
          <button
            onClick={onPrev}
            className="px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-white border border-gray-600 hover:bg-gray-800 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back
          </button>
          <button
            onClick={this.handleNext}
            disabled={!this.isValid()}
            className={`
              px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-white text-sm sm:text-base
              transition-all duration-300 flex items-center gap-1.5 sm:gap-2
              ${!this.isValid()
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 hover:shadow-lg hover:shadow-black/20'
              }
            `}
          >
            Continue to Skills
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    );
  }
} 