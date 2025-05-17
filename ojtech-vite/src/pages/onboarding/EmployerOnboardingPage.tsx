import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import profileService from '@/lib/api/profileService';
import { useNavigate } from 'react-router-dom';

interface EmployerProfileData {
    companyName?: string;
    companySize?: string;
    industry?: string;
    companyWebsite?: string;
    companyDescription?: string;
    companyAddress?: string;
    contactPersonName?: string;
    contactPersonPosition?: string;
    contactPersonEmail?: string;
    contactPersonPhone?: string;
    companyLogoUrl?: string;
    hasCompletedOnboarding?: boolean;
}

export const EmployerOnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<EmployerProfileData>({
    companyName: '',
    companySize: '',
    industry: '',
    companyWebsite: '',
    companyDescription: '',
    companyAddress: '',
    contactPersonName: '',
    contactPersonPosition: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const profileData = await profileService.getCurrentEmployerProfile();
          if (profileData) {
            setFormData({
                companyName: profileData.companyName || '',
                companySize: profileData.companySize || '',
                industry: profileData.industry || '',
                companyWebsite: profileData.companyWebsite || '',
                companyDescription: profileData.companyDescription || '',
                companyAddress: profileData.companyAddress || '',
                contactPersonName: profileData.contactPersonName || '',
                contactPersonPosition: profileData.contactPersonPosition || '',
                contactPersonEmail: profileData.contactPersonEmail || '',
                contactPersonPhone: profileData.contactPersonPhone || '',
                companyLogoUrl: profileData.companyLogoUrl || undefined,
            });
            // if (profileData.hasCompletedOnboarding) {
            //   navigate('/employer/dashboard'); // Or employer profile page
            // }
          }
        } catch (err: any) {
            if(err.response?.status !== 404) {
                setError(err.response?.data?.message || 'Failed to load employer profile data.');
            }
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchProfile();
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await profileService.completeEmployerOnboarding(formData);
      if (logoFile) {
        await profileService.uploadEmployerLogo(logoFile);
      }
      navigate('/employer/jobs'); // Redirect to employer dashboard or jobs page
    } catch (err: any) {
      setError(err.response?.data?.message || 'Onboarding failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (isLoading && !formData.companyName) { 
    return <div className="min-h-screen flex items-center justify-center"><p>Loading profile...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">Employer Onboarding</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Company Information</h3>
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
            <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleChange} required 
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Size</label>
                <select name="companySize" id="companySize" value={formData.companySize} onChange={handleChange} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                </select>
            </div>
            <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Industry</label>
                <input type="text" name="industry" id="industry" value={formData.industry} onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Website</label>
            <input type="url" name="companyWebsite" id="companyWebsite" value={formData.companyWebsite} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div>
            <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Description</label>
            <textarea name="companyDescription" id="companyDescription" rows={4} value={formData.companyDescription} onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
          </div>

          <div>
            <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Address</label>
            <input type="text" name="companyAddress" id="companyAddress" value={formData.companyAddress} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          
          <div>
            <label htmlFor="logoFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Logo</label>
            <input type="file" name="logoFile" id="logoFile" onChange={handleLogoFileChange} accept="image/*"
                   className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-800 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-700"/>
            {formData.companyLogoUrl && <div className="mt-2"><img src={formData.companyLogoUrl} alt="Company Logo" className="h-20 w-auto rounded"/></div>}
          </div>

          <h3 class="text-lg font-semibold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">Contact Person</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="contactPersonName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Name</label>
                <input type="text" name="contactPersonName" id="contactPersonName" value={formData.contactPersonName} onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label htmlFor="contactPersonPosition" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Position</label>
                <input type="text" name="contactPersonPosition" id="contactPersonPosition" value={formData.contactPersonPosition} onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="contactPersonEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Email</label>
                <input type="email" name="contactPersonEmail" id="contactPersonEmail" value={formData.contactPersonEmail} onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label htmlFor="contactPersonPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Phone</label>
                <input type="tel" name="contactPersonPhone" id="contactPersonPhone" value={formData.contactPersonPhone} onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center p-2 bg-red-50 dark:bg-red-900 rounded-md">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:focus:ring-offset-gray-800"
            >
              {isLoading ? 'Saving Profile...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 