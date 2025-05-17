import React, { useState, useEffect, useCallback } from 'react';
import jobService from '@/lib/api/jobService';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
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

export const JobFormPage: React.FC = () => {
  const { jobId } = useParams<{ jobId?: string }>();
  const isEditMode = Boolean(jobId);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    location: '',
    jobType: 'Full-time', // Default job type
    salaryRange: '',
    skillsRequired: [],
    closingDate: '',
    isActive: true,
  });
  const [skillsInput, setSkillsInput] = useState(''); // For comma-separated input
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobData = useCallback(async () => {
    if (isEditMode && jobId && user) {
      setIsLoading(true);
      try {
        const job = await jobService.getEmployerJobById(jobId);
        setFormData({
          title: job.title || '',
          description: job.description || '',
          location: job.location || '',
          jobType: job.jobType || 'Full-time',
          salaryRange: job.salaryRange || '',
          skillsRequired: job.skillsRequired || [],
          closingDate: job.closingDate ? new Date(job.closingDate).toISOString().split('T')[0] : '', // Format for input type=date
          isActive: job.isActive === undefined ? true : job.isActive,
        });
        setSkillsInput((job.skillsRequired || []).join(', '));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load job data.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [isEditMode, jobId, user]);

  useEffect(() => {
    if (!user || !user.roles.includes('ROLE_EMPLOYER')) {
        navigate('/login');
        return;
    }
    fetchJobData();
  }, [user, navigate, fetchJobData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkillsInput(e.target.value);
    setFormData(prev => ({ ...prev, skillsRequired: e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Convert closingDate to ISO string if it exists, otherwise null
    const payload = {
        ...formData,
        closingDate: formData.closingDate ? new Date(formData.closingDate).toISOString() : null,
    };

    try {
      if (isEditMode && jobId) {
        await jobService.updateJob(jobId, payload);
      } else {
        await jobService.createJob(payload);
      }
      navigate('/employer/jobs');
    } catch (err: any) {
      setError(err.response?.data?.message || (isEditMode ? 'Failed to update job.' : 'Failed to create job.'));
    } finally {
      setIsLoading(false);
    }
  };
  
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
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="title" className="dark:text-gray-300">Job Title</Label>
                        <Input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required 
                               className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                    </div>

                    <div>
                        <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                        <Textarea name="description" id="description" rows={5} value={formData.description} onChange={handleChange} required 
                                  className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"/>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="location" className="dark:text-gray-300">Location (e.g., City, Remote)</Label>
                            <Input type="text" name="location" id="location" value={formData.location} onChange={handleChange} required 
                                   className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"/>
                        </div>
                        <div>
                            <Label htmlFor="jobType" className="dark:text-gray-300">Job Type</Label>
                            <select name="jobType" id="jobType" value={formData.jobType} onChange={handleChange} required
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
                        <Input type="text" name="salaryRange" id="salaryRange" value={formData.salaryRange} onChange={handleChange} 
                               className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="e.g., PHP 20,000 - PHP 30,000"/>
                    </div>

                    <div>
                        <Label htmlFor="skillsRequired" className="dark:text-gray-300">Skills Required (comma-separated)</Label>
                        <Input type="text" name="skillsRequired" id="skillsRequired" value={skillsInput} onChange={handleSkillsChange} required 
                               className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"/>
                    </div>

                    <div>
                        <Label htmlFor="closingDate" className="dark:text-gray-300">Application Closing Date (Optional)</Label>
                        <Input type="date" name="closingDate" id="closingDate" value={formData.closingDate} onChange={handleChange} 
                               className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"/>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox id="isActive" name="isActive" checked={formData.isActive} 
                                  onCheckedChange={(checkedState) => { 
                                    setFormData(prev => ({ ...prev, isActive: Boolean(checkedState) }));
                                  }}
                                  className="dark:border-gray-600"/>
                        <Label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Job is Active (Visible to applicants)
                        </Label>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center p-2 bg-red-50 dark:bg-red-900 rounded-md">
                        {error}
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
}; 