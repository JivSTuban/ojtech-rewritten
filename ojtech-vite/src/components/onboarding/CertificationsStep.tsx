import React, { Component, ChangeEvent } from 'react';
import localStorageManager from '../../lib/utils/localStorageManager';

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialUrl?: string;
}

interface CertificationsStepProps {
  certifications: Certification[];
  onCertificationsChange: (certifications: Certification[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface CertificationsStepState {
  certifications: Certification[];
  currentCertification: Certification;
  isEditing: boolean;
  editIndex: number | null;
  formErrors: Record<string, string>;
}

export default class CertificationsStep extends Component<CertificationsStepProps, CertificationsStepState> {
  constructor(props: CertificationsStepProps) {
    super(props);
    this.state = {
      certifications: props.certifications || [],
      currentCertification: this.getEmptyCertification(),
      isEditing: false,
      editIndex: null,
      formErrors: {}
    };
  }

  componentDidMount() {
    // Load saved certifications from localStorage if available
    const savedCertifications = localStorageManager.getStepData<Certification[]>('certifications');
    if (savedCertifications && savedCertifications.length > 0) {
      this.setState({ certifications: savedCertifications });
      // Update parent component
      this.props.onCertificationsChange(savedCertifications);
    }
  }

  // Creates an empty certification with a unique ID
  getEmptyCertification = (): Certification => {
    return {
      id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      issuer: '',
      date: '',
      expiryDate: '',
      credentialUrl: ''
    };
  };

  // Handle form field changes
  handleCertificationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    this.setState(prevState => {
      const updatedCertification = {
        ...prevState.currentCertification,
        [name]: value
      };

      const newErrors = {
        ...prevState.formErrors,
        [name]: this.validateField(name, value, updatedCertification)
      };

      // Re-validate expiry date if issue date changes
      if (name === 'date' && updatedCertification.expiryDate) {
        newErrors.expiryDate = this.validateField('expiryDate', updatedCertification.expiryDate, updatedCertification);
      }

      return {
        currentCertification: updatedCertification,
        formErrors: newErrors
      };
    });
  };

  // Validate individual fields
  validateField = (name: string, value: string, certificationContext?: Certification): string => {
    const cert = certificationContext || this.state.currentCertification;

    switch (name) {
      case 'name':
        return value.trim() === '' ? 'Certification name is required' : '';
      case 'issuer':
        return value.trim() === '' ? 'Issuer is required' : '';
      case 'date':
        if (value.trim() === '') return 'Date received is required';
        if (new Date(value) > new Date()) return 'Date received cannot be in the future';
        return '';
      case 'expiryDate':
        if (value && cert.date) {
          const dateReceived = new Date(cert.date);
          const expiryDate = new Date(value);
          if (expiryDate <= dateReceived) {
            return 'Expiry date must be after the date received';
          }
        }
        return '';
      case 'credentialUrl':
        if (value && !value.startsWith('http')) {
          return 'URL must start with http:// or https://';
        }
        return '';
      default:
        return '';
    }
  };

  // Validate the entire form
  validateForm = (): boolean => {
    const { name, issuer, date, expiryDate, credentialUrl } = this.state.currentCertification;
    const errors: Record<string, string> = {};

    errors.name = this.validateField('name', name);
    errors.issuer = this.validateField('issuer', issuer);
    errors.date = this.validateField('date', date);

    if (expiryDate) {
      errors.expiryDate = this.validateField('expiryDate', expiryDate);
    }

    if (credentialUrl) {
      errors.credentialUrl = this.validateField('credentialUrl', credentialUrl);
    }

    this.setState({ formErrors: errors });

    // Check if we have any errors
    return !Object.values(errors).some(error => error !== '');
  };

  // Add a new certification
  handleAddCertification = () => {
    if (!this.validateForm()) {
      return;
    }

    const { certifications, currentCertification, isEditing, editIndex } = this.state;
    let updatedCertifications: Certification[];

    if (isEditing && editIndex !== null) {
      // Update existing certification
      updatedCertifications = [...certifications];
      updatedCertifications[editIndex] = currentCertification;
    } else {
      // Add new certification
      updatedCertifications = [...certifications, currentCertification];
    }

    this.setState({
      certifications: updatedCertifications,
      currentCertification: this.getEmptyCertification(),
      isEditing: false,
      editIndex: null,
      formErrors: {}
    });

    // Update parent component
    this.props.onCertificationsChange(updatedCertifications);

    // Save to localStorage
    localStorageManager.saveStepData('certifications', updatedCertifications);
  };

  // Edit an existing certification
  handleEditCertification = (index: number) => {
    this.setState({
      currentCertification: { ...this.state.certifications[index] },
      isEditing: true,
      editIndex: index,
      formErrors: {}
    });
  };

  // Delete a certification
  handleDeleteCertification = (index: number) => {
    const updatedCertifications = [...this.state.certifications];
    updatedCertifications.splice(index, 1);

    this.setState({ certifications: updatedCertifications });

    // Update parent component
    this.props.onCertificationsChange(updatedCertifications);

    // Save to localStorage
    localStorageManager.saveStepData('certifications', updatedCertifications);
  };

  // Cancel the current edit
  handleCancelEdit = () => {
    this.setState({
      currentCertification: this.getEmptyCertification(),
      isEditing: false,
      editIndex: null,
      formErrors: {}
    });
  };

  // Move to next step
  handleNext = () => {
    // Save certifications to localStorage
    localStorageManager.saveStepData('certifications', this.state.certifications);
    this.props.onNext();
  };

  render() {
    const { certifications, currentCertification, isEditing, formErrors } = this.state;
    const { onPrev } = this.props;
    const today = new Date().toISOString().split('T')[0];

    return (
      <div className="space-y-4 sm:space-y-8 max-w-2xl mx-auto">
        <div className="text-center">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
            Certifications
          </h3>
          <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
            Add certifications to showcase your professional qualifications
          </p>
        </div>

        <div className="bg-gray-900/60 rounded-xl p-3 sm:p-4 md:p-6 backdrop-blur-sm border border-gray-800/50 shadow-xl shadow-black/5">
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                  Certification Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={currentCertification.name}
                  onChange={this.handleCertificationChange}
                  className={`w-full bg-black/80 border ${formErrors.name ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300`}
                  placeholder="e.g., AWS Certified"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="issuer" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                  Issuing Organization
                </label>
                <input
                  type="text"
                  id="issuer"
                  name="issuer"
                  value={currentCertification.issuer}
                  onChange={this.handleCertificationChange}
                  className={`w-full bg-black/80 border ${formErrors.issuer ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300`}
                  placeholder="e.g., Amazon Web Services"
                />
                {formErrors.issuer && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{formErrors.issuer}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="date" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                  Date Received
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={currentCertification.date}
                  onChange={this.handleCertificationChange}
                  max={today}
                  className={`w-full bg-black/80 border ${formErrors.date ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300`}
                />
                {formErrors.date && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{formErrors.date}</p>
                )}
              </div>

              <div>
                <label htmlFor="expiryDate" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                  Expiry Date <span className="text-gray-500 text-[10px] sm:text-xs">(Optional)</span>
                </label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={currentCertification.expiryDate || ''}
                  onChange={this.handleCertificationChange}
                  min={currentCertification.date || undefined}
                  className={`w-full bg-black/80 border ${formErrors.expiryDate ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300`}
                />
                {formErrors.expiryDate && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{formErrors.expiryDate}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="credentialUrl" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                Credential URL <span className="text-gray-500 text-[10px] sm:text-xs">(Optional)</span>
              </label>
              <input
                type="url"
                id="credentialUrl"
                name="credentialUrl"
                value={currentCertification.credentialUrl || ''}
                onChange={this.handleCertificationChange}
                className={`w-full bg-black/80 border ${formErrors.credentialUrl ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300`}
                placeholder="https://www.credential.net/id"
              />
              {formErrors.credentialUrl && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-1">{formErrors.credentialUrl}</p>
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
                onClick={this.handleAddCertification}
                className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg font-medium text-white bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 transition-all duration-300 text-sm sm:text-base"
              >
                {isEditing ? 'Update' : 'Add Certification'}
              </button>
            </div>
          </div>
        </div>

        {certifications.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-base sm:text-lg font-medium text-white">
              Your Certifications
            </h4>

            <div className="space-y-2 sm:space-y-3">
              {certifications.map((cert, index) => (
                <div
                  key={cert.id}
                  className="bg-gray-900/40 rounded-lg p-3 sm:p-4 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300"
                >
                  <div className="flex justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h5 className="text-white font-medium text-sm sm:text-base truncate">{cert.name}</h5>
                      <p className="text-gray-400 text-xs sm:text-sm truncate">{cert.issuer}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center mt-1 text-xs sm:text-sm text-gray-500 gap-0.5 sm:gap-3">
                        <span>Issued: {new Date(cert.date).toLocaleDateString()}</span>
                        {cert.expiryDate && (
                          <span>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm text-gray-400 hover:text-gray-300 mt-1 sm:mt-2 inline-block hover:underline truncate max-w-full"
                        >
                          View Credential
                        </a>
                      )}
                    </div>

                    <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                      <button
                        onClick={() => this.handleEditCertification(index)}
                        className="text-gray-400 hover:text-gray-300 transition-colors p-1"
                        title="Edit certification"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => this.handleDeleteCertification(index)}
                        className="text-gray-400 hover:text-red-400 transition-colors p-1"
                        title="Delete certification"
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
            <h5 className="text-gray-300 font-medium text-sm sm:text-base">No certifications added yet</h5>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Add your professional certifications to stand out to employers</p>
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
            <span className="hidden sm:inline">Continue to Experience</span>
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