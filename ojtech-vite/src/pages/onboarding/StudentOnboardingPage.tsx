import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import profileService from '@/lib/api/profileService';
import { useNavigate } from 'react-router-dom';

// Define an interface for the student profile data from the backend
interface StudentProfileData {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    university?: string;
    major?: string;
    graduationYear?: number;
    bio?: string;
    skills?: string[]; // Assuming skills are stored as an array of strings
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    cvUrl?: string;
    cvFilename?: string;
    hasCompletedOnboarding?: boolean;
}

export const StudentOnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StudentProfileData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    university: '',
    major: '',
    graduationYear: undefined,
    bio: '',
    skills: [],
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [skillsInput, setSkillsInput] = useState(''); // For handling comma-separated skills input

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const profileData = await profileService.getCurrentStudentProfile();
          if (profileData) {
            setFormData({
              firstName: profileData.firstName || '',
              lastName: profileData.lastName || '',
              phoneNumber: profileData.phoneNumber || '',
              university: profileData.university || '',
              major: profileData.major || '',
              graduationYear: profileData.graduationYear || undefined,
              bio: profileData.bio || '',
              skills: profileData.skills || [],
              githubUrl: profileData.githubUrl || '',
              linkedinUrl: profileData.linkedinUrl || '',
              portfolioUrl: profileData.portfolioUrl || '',
            });
            if (profileData.skills && profileData.skills.length > 0) {
                setSkillsInput(profileData.skills.join(', '));
            }
            if (profileData.hasCompletedOnboarding) {
              // Optionally redirect if onboarding is already complete, or allow updates
              // navigate('/profile'); 
            }
          }
        } catch (err: any) {
          if(err.response?.status !== 404) { // Ignore 404 if profile doesn't exist yet
            setError(err.response?.data?.message || 'Failed to load profile data.');
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
    setFormData(prev => ({ ...prev, [name]: name === 'graduationYear' ? (value ? parseInt(value) : undefined) : value }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkillsInput(e.target.value);
    setFormData(prev => ({ ...prev, skills: e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill) }));
  };

  const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await profileService.completeStudentOnboarding(formData);
      if (cvFile) {
        await profileService.uploadStudentCv(cvFile);
      }
      navigate('/profile'); // Redirect to profile page after successful onboarding
    } catch (err: any) {
      setError(err.response?.data?.message || 'Onboarding failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null; // Or a loading indicator
  }

  if (isLoading && !formData.firstName) { // Show full page loading only on initial load
    return <div className="min-h-screen flex items-center justify-center"><p>Loading profile...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">Student Onboarding</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
              <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} required 
                     className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
              <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} required
                     className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
            <input type="tel" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="university" className="block text-sm font-medium text-gray-700 dark:text-gray-300">University/School</label>
                <input type="text" name="university" id="university" value={formData.university} onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label htmlFor="major" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Major/Course</label>
                <input type="text" name="major" id="major" value={formData.major} onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>
          
          <div>
            <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expected Graduation Year</label>
            <input type="number" name="graduationYear" id="graduationYear" value={formData.graduationYear || ''} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio/About Me</label>
            <textarea name="bio" id="bio" rows={4} value={formData.bio} onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Skills (comma-separated)</label>
            <input type="text" name="skills" id="skills" value={skillsInput} onChange={handleSkillsChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          
          <div>
            <label htmlFor="cvFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload CV (PDF preferred)</label>
            <input type="file" name="cvFile" id="cvFile" onChange={handleCvFileChange} accept=".pdf,.doc,.docx"
                   className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-800 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-700"/>
            {formData.cvUrl && <p className="text-xs text-gray-500 mt-1">Current CV: <a href={formData.cvUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{formData.cvFilename || 'View CV'}</a></p>}
          </div>

          <h3 class="text-lg font-semibold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">Professional Links (Optional)</h3>
          
          <div>
            <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">GitHub URL</label>
            <input type="url" name="githubUrl" id="githubUrl" value={formData.githubUrl} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn URL</label>
            <input type="url" name="linkedinUrl" id="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio URL</label>
            <input type="url" name="portfolioUrl" id="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
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