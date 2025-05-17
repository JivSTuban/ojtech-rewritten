import React, { Component } from 'react';
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";
import { Loader2 } from "lucide-react";

interface OnboardingCheckLayoutProps {
  children: React.ReactNode;
}

interface OnboardingCheckLayoutState {
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmployer: boolean;
  isCompleted: boolean;
  error: string | null;
}

export class OnboardingCheckLayout extends Component<OnboardingCheckLayoutProps, OnboardingCheckLayoutState> {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;
  
  constructor(props: OnboardingCheckLayoutProps) {
    super(props);
    this.state = {
      isLoading: true,
      isAuthenticated: false,
      isEmployer: false,
      isCompleted: false,
      error: null
    };
  }

  async componentDidMount() {
    await this.checkAuth();
  }

  async checkAuth() {
    try {
      // Check if user is authenticated
      if (!this.context.session) {
        this.setState({ 
          isLoading: false, 
          isAuthenticated: false,
          error: 'Authentication required'
        });
        return;
      }

      // Check if user has the employer role
      const isEmployer = this.context.user?.user_metadata?.role === 'employer';
      if (!isEmployer) {
        this.setState({ 
          isLoading: false, 
          isAuthenticated: true,
          isEmployer: false,
          error: 'Access denied'
        });
        return;
      }

      // Check if onboarding is already completed
      try {
        const response = await fetch('/api/employer/onboarding/status', {
          headers: {
            'Authorization': `Bearer ${this.context.session?.access_token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          this.setState({
            isLoading: false,
            isAuthenticated: true,
            isEmployer: true,
            isCompleted: data.isCompleted
          });
        } else {
          // If API error, assume not completed
          this.setState({
            isLoading: false,
            isAuthenticated: true,
            isEmployer: true,
            isCompleted: false
          });
        }
      } catch (error) {
        // Handle fetch error
        console.error('Error checking onboarding status:', error);
        this.setState({
          isLoading: false,
          isAuthenticated: true,
          isEmployer: true,
          isCompleted: false,
          error: 'Failed to check onboarding status'
        });
      }
    } catch (error) {
      // Global error handling
      console.error('Error in authentication check:', error);
      this.setState({
        isLoading: false,
        error: 'An error occurred during authentication check'
      });
    }
  }

  render() {
    const { isLoading, isAuthenticated, isEmployer, isCompleted, error } = this.state;
    
    if (isLoading) {
      return (
        <div className="flex h-[90vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/auth/login" replace />;
    }
    
    if (!isEmployer) {
      return <Navigate to="/profile" replace />;
    }
    
    if (isCompleted) {
      return <Navigate to="/employer/dashboard" replace />;
    }
    
    return this.props.children;
  }
}
