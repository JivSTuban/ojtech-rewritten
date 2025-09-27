import React from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { ThemeProvider } from './providers/ThemeProvider';
import { ToastProvider, ToastHelper } from './providers/ToastContext';
import { Toaster } from './components/ui/Toaster';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import ProfilePage from './pages/ProfilePage';
import { HomePage } from './pages/HomePage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { JobApplicationPage } from './pages/JobApplicationPage';
import ApplicationDetailsPage from './pages/ApplicationDetailsPage';
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/ProtectedRoute';
import { StudentOnboardingPage } from './pages/onboarding/StudentOnboardingPage';
import { EmployerOnboardingPage } from './pages/onboarding/EmployerOnboardingPage';
import { EmployerJobsPage } from './pages/employer/EmployerJobsPage';
import { JobFormPage } from './pages/employer/JobFormPage';
import { JobApplicationsPage } from './pages/employer/JobApplicationsPage';
import { useAuth } from './providers/AuthProvider';
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminJobsPage } from "./pages/admin/AdminJobsPage";
import { UsersAdminPage } from "./pages/admin/UsersAdminPage";
import { StudentVerificationPage } from "./pages/admin/StudentVerificationPage";
import StudentDetailsPage from "./pages/admin/StudentDetailsPage";
import { TrackApplicationsPage } from './pages/TrackApplicationsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import ResumeManagementPage from './pages/ResumeManagementPage';
import './index.css';

// Main layout with navigation for all non-auth pages
const MainLayout: React.FC = () => {
  const { user, isLoading, fetchUserProfile } = useAuth();
  const location = useLocation();
  const initialLoadRef = React.useRef(false);
  const lastPathRef = React.useRef(location.pathname);
  
  // Create a stable callback reference to avoid dependency issues
  const stableFetchUserProfile = React.useCallback(() => {
    if (!isLoading && user) {
      fetchUserProfile();
    }
  }, [fetchUserProfile, isLoading, user]);

  // Refresh auth context only when the component mounts
  React.useEffect(() => {
    if (!initialLoadRef.current && !isLoading && user) {
      initialLoadRef.current = true;
     
      stableFetchUserProfile();
    }
  }, [isLoading, user, stableFetchUserProfile]);
  
  // Track path changes separately
  React.useEffect(() => {
    // Only refresh on actual path changes, not just re-renders
    if (lastPathRef.current !== location.pathname && !isLoading && user) {
      lastPathRef.current = location.pathname;
      
      
      // Skip profile refresh on certain paths
      const skipRefreshPaths = ['/onboarding/student', '/onboarding/employer'];
      if (!skipRefreshPaths.includes(location.pathname)) {
        stableFetchUserProfile();
      }
    }
  }, [location.pathname, stableFetchUserProfile, isLoading, user]);

  // Check onboarding status on route change
  React.useEffect(() => {
    if (!isLoading && user) {
      // Debug log onboarding status
  

      // Safe paths that should be accessible regardless of onboarding status
      const safePaths = [
        '/profile', 
        '/onboarding', 
        '/login', 
        '/register', 
        '/auth',
        '/privacy',
        '/terms',
        '/'
      ];
      
      // Check if current path is in safe paths
      const isOnSafePath = safePaths.some(path => location.pathname.startsWith(path));
      
      // Only redirect if onboarding isn't complete AND we're not on a safe path
      if (user.hasCompletedOnboarding === false && !isOnSafePath) {
        // User has NOT completed onboarding, redirect to appropriate onboarding page
        if (user?.roles?.includes('ROLE_STUDENT') && 
            location.pathname !== '/onboarding/student') {
          console.log('Redirecting to student onboarding from:', location.pathname);
          window.location.href = '/onboarding/student';
        } else if (user?.roles?.includes('ROLE_EMPLOYER') && 
                  location.pathname !== '/onboarding/employer') {
          console.log('Redirecting to employer onboarding from:', location.pathname);
          window.location.href = '/onboarding/employer';
        }
      } 
      // Only redirect away from onboarding if it's complete AND we're on an onboarding page
      else if (user.hasCompletedOnboarding === true) {
        const isOnboardingRoute = location.pathname.startsWith('/onboarding');
        
        if (isOnboardingRoute) {
          // Redirect to appropriate page based on role
          if (user?.roles?.includes('ROLE_STUDENT')) {
            console.log('Redirecting to track page from onboarding - already completed');
            window.location.href = '/track';
          } else if (user?.roles?.includes('ROLE_EMPLOYER')) {
            console.log('Redirecting to employer jobs from onboarding - already completed');
            window.location.href = '/employer/jobs';
          }
        }
      }
    }
  }, [user, isLoading, location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className={`flex-grow ${location.pathname !== '/' ? 'container mx-auto px-4 py-8' : ''}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Auth layout without navigation for auth pages
const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

// Email verification redirect component
const EmailVerificationRedirect: React.FC = () => {
  const { user } = useAuth();
  
  // Determine where to redirect based on user role
  if (user) {
    if (user.roles?.includes('ROLE_STUDENT')) {
      return <Navigate to="/onboarding/student" replace />;
    } else if (user.roles?.includes('ROLE_EMPLOYER')) {
      return <Navigate to="/onboarding/employer" replace />;
    }
  }
  
  // Default redirect to login if no user is found
  return <Navigate to="/login" replace />;
};

// Main App component
export const App: React.FC = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ToastProvider>
        <ToastHelper />
        <Routes>
          {/* Auth routes without navigation - public only */}
          <Route element={<PublicOnlyRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              {/* Keep verify-email route for backward compatibility, but redirect to appropriate page */}
              <Route path="/verify-email" element={<EmailVerificationRedirect />} />
            </Route>
          </Route>
          
          {/* All non-auth routes with the main layout and navbar */}
          <Route element={<MainLayout />}>
            {/* For Pre Testing mockdata */}
              <Route path="/" element={<HomePage />} />
              <Route path="/opportunities" element={<OpportunitiesPage />} />
              <Route path="/opportunities/:id" element={<JobDetailPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/track" element={<TrackApplicationsPage />} />
              <Route path="/application/:id" element={<ApplicationDetailsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/resume" element={<ResumeManagementPage />} />
              <Route path="/onboarding/student" element={<StudentOnboardingPage />} />
              <Route path="/onboarding/employer" element={<EmployerOnboardingPage />} />
              <Route path="/employer/jobs" element={<EmployerJobsPage />} />
              <Route path="/employer/jobs/create" element={<JobFormPage />} />
              <Route path="/employer/jobs/edit/:jobId" element={<JobFormPage />} />
              <Route path="/employer/jobs/applications/:jobId" element={<JobApplicationsPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/jobs" element={<AdminJobsPage />} />
              <Route path="/admin/users" element={<UsersAdminPage />} />
              <Route path="/admin/students/verification" element={<StudentVerificationPage />} />
              <Route path="/admin/students/:id" element={<StudentDetailsPage />} />
              <Route path="/opportunities/apply/:id" element={<JobApplicationPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </ToastProvider>
    </ThemeProvider>
  );
}
