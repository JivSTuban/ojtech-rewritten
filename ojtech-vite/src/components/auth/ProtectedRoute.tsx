import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';

interface ProtectedRouteProps {
  allowedRoles?: string[]; // e.g. ['ROLE_ADMIN', 'ROLE_EMPLOYER']
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading session...</p></div>;
  }

  if (!user) {
    // Preserve the intended location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check roles if specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = user.roles || [];
    const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));
    if (!hasRequiredRole) {
      // Not authorized for this role
      return <Navigate to="/" replace />; // Or an unauthorized page
    }
  }

  // For routes other than onboarding, check if onboarding is complete
  // (Onboarding routes themselves should be accessible if user has correct role but hasn't completed onboarding)
  const isOnboardingRoute = location.pathname.startsWith('/onboarding');
  if (!isOnboardingRoute && !user.hasCompletedOnboarding) {
    // Redirect to appropriate onboarding page based on role
    if (user.roles.includes('ROLE_STUDENT')) {
      return <Navigate to="/onboarding/student" replace />;
    }
    if (user.roles.includes('ROLE_EMPLOYER')) {
      return <Navigate to="/onboarding/employer" replace />;
    }
    // Fallback if role is unclear but onboarding needed (should ideally not happen)
    return <Navigate to="/" replace />; 
  }

  return <Outlet />;
};

// A route that is only accessible to unauthenticated users
export class PublicOnlyRoute extends React.Component {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  render() {
    const { isAuthenticated, isLoading, userRole, onboardingCompleted } = this.context;

    // If still loading, show nothing
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
        </div>
      );
    }

    // If authenticated, redirect based on role and onboarding status
    if (isAuthenticated) {
      // If onboarding is not completed, redirect to the appropriate onboarding page
      if (!onboardingCompleted) {
        if (userRole === 'STUDENT') {
          return <Navigate to="/onboarding/student" replace />;
        } else if (userRole === 'EMPLOYER') {
          return <Navigate to="/onboarding/employer" replace />;
        } else if (userRole === 'ADMIN') {
          return <Navigate to="/onboarding/admin" replace />;
        }
      } else {
        // If onboarding is completed, redirect to the appropriate dashboard
        if (userRole === 'STUDENT') {
          return <Navigate to="/track" replace />;
        } else if (userRole === 'EMPLOYER') {
          return <Navigate to="/employer/jobs" replace />;
        } else if (userRole === 'ADMIN') {
          return <Navigate to="/admin/dashboard" replace />;
        }
      }
    }

    // If not authenticated, show the public route
    return <Outlet />;
  }
}

// Role-specific route components for easier usage
export class StudentRoute extends React.Component<Omit<ProtectedRouteProps, 'allowedRoles'>> {
  render() {
    return <ProtectedRoute {...this.props} allowedRoles={['STUDENT']} />;
  }
}

export class EmployerRoute extends React.Component<Omit<ProtectedRouteProps, 'allowedRoles'>> {
  render() {
    return <ProtectedRoute {...this.props} allowedRoles={['EMPLOYER']} />;
  }
}

export class AdminRoute extends React.Component<Omit<ProtectedRouteProps, 'allowedRoles'>> {
  render() {
    return <ProtectedRoute {...this.props} allowedRoles={['ADMIN']} />;
  }
}

// A route that requires any authentication
export class AuthenticatedRoute extends React.Component<Omit<ProtectedRouteProps, 'allowedRoles'>> {
  render() {
    return <ProtectedRoute {...this.props} />;
  }
}

// A special route for onboarding paths
export class OnboardingRoute extends React.Component<Omit<ProtectedRouteProps, 'isOnboardingPath'>> {
  render() {
    return <ProtectedRoute {...this.props} isOnboardingPath={true} requireOnboarding={false} />;
  }
} 