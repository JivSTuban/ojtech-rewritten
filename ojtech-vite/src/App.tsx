import React from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { ThemeProvider } from './providers/ThemeProvider';
import { ToastProvider } from './providers/ToastContext';
import { Toaster } from './components/ui/Toaster';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ProfilePage } from './pages/ProfilePage';
import { HomePage } from './pages/HomePage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { JobApplicationPage } from './pages/JobApplicationPage';
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/ProtectedRoute';
import { StudentOnboardingPage } from './pages/onboarding/StudentOnboardingPage';
import { EmployerOnboardingPage } from './pages/onboarding/EmployerOnboardingPage';
import { EmployerJobsPage } from './pages/employer/EmployerJobsPage';
import { JobFormPage } from './pages/employer/JobFormPage';
import { JobApplicationsPage } from './pages/employer/JobApplicationsPage';
import { useAuth } from './providers/AuthProvider';
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { UsersAdminPage } from "./pages/admin/UsersAdminPage";
import { TrackApplicationsPage } from './pages/TrackApplicationsPage';
import './index.css';

// Main layout with navigation for all non-auth pages
const MainLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Check onboarding status on route change
  React.useEffect(() => {
    if (!isLoading && user && !user.hasCompletedOnboarding) {
      const isOnboardingRoute = location.pathname.startsWith('/onboarding');
      const isProfileRoute = location.pathname === '/profile';
      const isAuthRoute = location.pathname.startsWith('/login') || 
                         location.pathname.startsWith('/register') || 
                         location.pathname.startsWith('/auth');

      if (user?.roles?.includes('ROLE_STUDENT') && 
          location.pathname !== '/onboarding/student' && 
          !isOnboardingRoute && !isProfileRoute && !isAuthRoute) {
        window.location.href = '/onboarding/student';
      } else if (user?.roles?.includes('ROLE_EMPLOYER') && 
                location.pathname !== '/onboarding/employer' && 
                !isOnboardingRoute && !isProfileRoute && !isAuthRoute) {
        window.location.href = '/onboarding/employer';
      }
    }
  }, [user, isLoading, location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className={`flex-grow ${location.pathname !== '/' ? 'container mx-auto px-4 py-8' : ''}`}>
        <Outlet />
      </main>
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
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/opportunities" element={<OpportunitiesPage />} />
            <Route path="/opportunities/:id" element={<JobDetailPage />} />
            
            {/* Protected routes for all authenticated users */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/onboarding/student" element={<StudentOnboardingPage />} />
              <Route path="/onboarding/employer" element={<EmployerOnboardingPage />} />
            </Route>
            
            {/* Employer-specific routes */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_EMPLOYER']} />}>
              <Route path="/employer/jobs" element={<EmployerJobsPage />} />
              <Route path="/employer/jobs/create" element={<JobFormPage />} />
              <Route path="/employer/jobs/edit/:jobId" element={<JobFormPage />} />
              <Route path="/employer/jobs/applications/:jobId" element={<JobApplicationsPage />} />
            </Route>
            
            {/* Student-specific routes */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']} />}>
              <Route path="/opportunities/apply/:id" element={<JobApplicationPage />} />
              <Route path="/track" element={<TrackApplicationsPage />} />
            </Route>
            
            {/* Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<UsersAdminPage />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster /> 
      </ToastProvider>
    </ThemeProvider>
  );
}
