import React, { Component } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext, UserRole } from '../../providers/AuthProvider';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectPath?: string;
  requireOnboarding?: boolean;
  isOnboardingPath?: boolean;
}

export class ProtectedRoute extends Component<ProtectedRouteProps> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  static defaultProps = {
    redirectPath: '/auth/login',
    requireOnboarding: true,
    isOnboardingPath: false
  };

  render() {
    const { allowedRoles, redirectPath, requireOnboarding, isOnboardingPath } = this.props;
    const { isAuthenticated, isLoading, userRole, onboardingCompleted } = this.context;

    // If still loading, show nothing
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
        </div>
      );
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      return <Navigate to={redirectPath as string} replace />;
    }

    // If onboarding is required but not completed, redirect to appropriate onboarding page
    // Skip this check if we're already on an onboarding path
    if (requireOnboarding && !onboardingCompleted && !isOnboardingPath) {
      console.log('ProtectedRoute: Redirecting to onboarding path - onboarding not completed');
      
      if (userRole === 'STUDENT') {
        return <Navigate to="/onboarding/student" replace />;
      } else if (userRole === 'EMPLOYER') {
        return <Navigate to="/onboarding/employer" replace />;
      } else if (userRole === 'ADMIN') {
        return <Navigate to="/onboarding/admin" replace />;
      }
    }

    // If authenticated but role check is required
    if (allowedRoles && allowedRoles.length > 0) {
      // If user role is not in the allowed roles list
      if (!userRole || !allowedRoles.includes(userRole)) {
        console.log('ProtectedRoute: Role not allowed, redirecting');
        // Redirect based on role
        if (userRole === 'STUDENT') {
          return <Navigate to="/track" replace />;
        } else if (userRole === 'EMPLOYER') {
          return <Navigate to="/employer/jobs" replace />;
        } else if (userRole === 'ADMIN') {
          return <Navigate to="/admin/dashboard" replace />;
        } else {
          return <Navigate to="/" replace />;
        }
      }
    }

    // If all checks pass, render the child routes
    return <Outlet />;
  }
}

// A route that is only accessible to unauthenticated users
export class PublicOnlyRoute extends Component {
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
export class StudentRoute extends Component<Omit<ProtectedRouteProps, 'allowedRoles'>> {
  render() {
    return <ProtectedRoute {...this.props} allowedRoles={['STUDENT']} />;
  }
}

export class EmployerRoute extends Component<Omit<ProtectedRouteProps, 'allowedRoles'>> {
  render() {
    return <ProtectedRoute {...this.props} allowedRoles={['EMPLOYER']} />;
  }
}

export class AdminRoute extends Component<Omit<ProtectedRouteProps, 'allowedRoles'>> {
  render() {
    return <ProtectedRoute {...this.props} allowedRoles={['ADMIN']} />;
  }
}

// A route that requires any authentication
export class AuthenticatedRoute extends Component<Omit<ProtectedRouteProps, 'allowedRoles'>> {
  render() {
    return <ProtectedRoute {...this.props} />;
  }
}

// A special route for onboarding paths
export class OnboardingRoute extends Component<Omit<ProtectedRouteProps, 'isOnboardingPath'>> {
  render() {
    return <ProtectedRoute {...this.props} isOnboardingPath={true} requireOnboarding={false} />;
  }
} 