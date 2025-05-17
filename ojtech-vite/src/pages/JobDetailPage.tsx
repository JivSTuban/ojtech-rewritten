import React, { useState, useEffect, useCallback } from 'react';
import jobService from '@/lib/api/jobService';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Briefcase, MapPin, CalendarDays, Users, DollarSign, Settings, CheckCircle } from 'lucide-react';

// Base Job interface (could be shared from a types file)
interface Job {
    id: number;
    title: string;
    location: string;
    jobType: string;
    postedDate: string; 
    salaryRange?: string; // Made optional as it is in Job entity
    // isActive: boolean; // isActive is part of JobDetail specific extension here for clarity
    // description: string; // Description is handled in JobDetail
    // skillsRequired: string[]; // Handled in JobDetail
    // employer: any; // Handled in JobDetail with more specificity
}

// Expanded Job interface for detail view
interface JobDetail extends Job {
  description: string; 
  skillsRequired: string[];
  employer: { 
    id: number;
    username: string; 
    employerProfile?: { 
        companyName: string;
        companyLogoUrl?: string;
        companyDescription?: string;
        industry?: string;
        companyWebsite?: string;
    }
  };
  closingDate?: string;
  isActive: boolean;
}

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchJobDetail = useCallback(async () => {
    if (!id) {
      setError('Job ID is missing.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await jobService.getActiveJobById(id);
      setJob(data as JobDetail); // Cast to JobDetail, assuming API returns the full structure
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch job details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJobDetail();
  }, [fetchJobDetail]);

  const handleApply = () => {
    if (!user) {
        navigate('/login', { state: { from: `/opportunities/${id}/apply` } });
        return;
    }
    if (user.roles.includes('ROLE_STUDENT')) {
        navigate(`/opportunities/apply/${id}`); 
    } else {
        alert("Only students can apply for jobs.");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading job details...</p></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500"><p>Error: {error}</p></div>;
  }

  if (!job) {
    return <div className="min-h-screen flex items-center justify-center"><p>Job not found.</p></div>;
  }

  const companyName = job.employer?.employerProfile?.companyName || job.employer?.username || 'A Company';
  const companyLogo = job.employer?.employerProfile?.companyLogoUrl;

  return (
    <div className="container mx-auto px-4 py-8">
        <Link to="/opportunities" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline mb-6">
            <ArrowLeft size={18} className="mr-2" /> Back to Opportunities
        </Link>

        <Card className="dark:bg-gray-800 shadow-xl">
            <CardHeader className="border-b dark:border-gray-700 pb-4">
                <div className="flex flex-col md:flex-row items-start justify-between">
                    <div>
                        <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{job.title}</CardTitle>
                        <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
                           {/* Link to a future company detail page if needed */}
                           {/* <Link to={`/company/${job.employer?.id}`} className="hover:underline">{companyName}</Link> */}
                           {companyName}
                        </CardDescription>
                    </div>
                    {companyLogo && (
                        <img src={companyLogo} alt={`${companyName} logo`} className="w-20 h-20 object-contain rounded-md mt-4 md:mt-0 md:ml-6" />
                    )}
                </div>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center"><MapPin size={16} className="mr-1.5" /> {job.location}</span>
                    <span className="inline-flex items-center"><Briefcase size={16} className="mr-1.5" /> {job.jobType}</span>
                    <span className="inline-flex items-center"><CalendarDays size={16} className="mr-1.5" /> Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                    {job.closingDate && <span className="inline-flex items-center text-orange-600 dark:text-orange-400"><CalendarDays size={16} className="mr-1.5" /> Closes: {new Date(job.closingDate).toLocaleDateString()}</span>}
                    {job.salaryRange && <span className="inline-flex items-center"><DollarSign size={16} className="mr-1.5" /> {job.salaryRange}</span>}
                </div>
            </CardHeader>
            <CardContent className="py-6">
                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Job Description</h3>
                    {/* Using dangerouslySetInnerHTML assumes description is safe HTML or needs sanitization */}
                    <div dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br />') }} /> 
                </div>

                {job.skillsRequired && job.skillsRequired.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Skills Required</h3>
                        <div className="flex flex-wrap gap-2">
                            {job.skillsRequired.map(skill => (
                                <span key={skill} className="px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-full font-medium">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                
                {job.employer?.employerProfile?.companyDescription && (
                    <div className="mt-8 pt-6 border-t dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">About {companyName}</h3>
                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{job.employer.employerProfile.companyDescription}</p>
                        {job.employer.employerProfile.companyWebsite && 
                            <p className="mt-2">
                                <a href={job.employer.employerProfile.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                    Visit company website
                                </a>
                            </p>
                        }
                    </div>
                )}

                <div className="mt-8 text-center">
                    {job.isActive ? (
                        <Button size="lg" onClick={handleApply} className="w-full md:w-auto" disabled={!user?.roles.includes('ROLE_STUDENT') && user !== null}>
                            Apply Now
                        </Button>
                    ) : (
                        <p className="text-red-500 font-semibold">This job posting is no longer active.</p>
                    )}
                     {user && !user.roles.includes('ROLE_STUDENT') && job.isActive &&
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">Only students can apply for jobs.</p> }
                </div>
            </CardContent>
        </Card>
    </div>
  );
};

export const JobDetailPageWrapper: React.FC = () => {
    return <JobDetailPage />;
}; 