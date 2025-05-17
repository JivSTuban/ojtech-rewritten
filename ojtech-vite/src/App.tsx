import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/providers/ToastContext';
import { Toaster } from '@/components/ui/Toaster';
import { Navbar } from '@/components/Navbar';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { HomePage } from '@/pages/HomePage';
import { OpportunitiesPage } from '@/pages/OpportunitiesPage';
import { JobDetailPageWrapper } from '@/pages/JobDetailPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { StudentOnboardingPage } from '@/pages/onboarding/StudentOnboardingPage';
import { EmployerOnboardingPage } from '@/pages/onboarding/EmployerOnboardingPage';
import { EmployerJobsPage } from '@/pages/employer/EmployerJobsPage';
import { JobFormPage } from '@/pages/employer/JobFormPage';
import { useAuth } from '@/providers/AuthProvider';
import './index.css';

// Layout component with navigation
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && user && !user.hasCompletedOnboarding) {
      const isOnboardingRoute = location.pathname.startsWith('/onboarding');
      const isProfileRoute = location.pathname === '/profile';

      if (user.roles.includes('ROLE_STUDENT') && location.pathname !== '/onboarding/student' && !isOnboardingRoute && !isProfileRoute) {
        navigate('/onboarding/student', { replace: true });
      } else if (user.roles.includes('ROLE_EMPLOYER') && location.pathname !== '/onboarding/employer' && !isOnboardingRoute && !isProfileRoute) {
        navigate('/onboarding/employer', { replace: true });
      }
    }
  }, [user, isLoading, navigate, location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

// Simple Placeholder for JobApplicationsPage
const JobApplicationsPagePlaceholder: React.FC = () => (
    <div>
        <h2 className="text-xl font-semibold">Job Applications</h2>
        <p>Applications for this job will be listed here. (To be implemented)</p>
        <Link to="/employer/jobs" className="text-indigo-600 hover:underline mt-4 inline-block">Back to My Jobs</Link>
    </div>
);

// App component
export const App: React.FC = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ToastProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/onboarding/student" element={<StudentOnboardingPage />} />
              <Route path="/onboarding/employer" element={<EmployerOnboardingPage />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['ROLE_EMPLOYER']} />}>
              <Route path="/employer/jobs" element={<EmployerJobsPage />} />
              <Route path="/employer/jobs/create" element={<JobFormPage />} />
              <Route path="/employer/jobs/edit/:jobId" element={<JobFormPage />} />
              <Route path="/employer/jobs/applications/:jobId" element={<JobApplicationsPagePlaceholder />} />
            </Route>
            
            <Route path="/opportunities" element={<OpportunitiesPage />} />
            <Route path="/opportunities/:id" element={<JobDetailPageWrapper />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
        <Toaster /> 
      </ToastProvider>
    </ThemeProvider>
  );
};
