import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../providers/AuthProvider';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Loader2, Github } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { AuthLayout } from '../components/layouts/AuthLayout';
import profileService from '../lib/api/profileService';
import { toast } from '../components/ui/toast-utils';

interface LoginPageState {
  email: string;
  password: string;
  error: string | null;
  isLoading: boolean;
  redirectTo: string | null;
}

export class LoginPage extends Component<{}, LoginPageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;
  
  // API base URL
  private API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  
  constructor(props: {}) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: null,
      isLoading: false,
      redirectTo: null
    };
  }
  
  componentDidMount() {
    // Check if already logged in
    if (this.context && this.context.user) {
      this.setState({ redirectTo: '/' });
    }
    
    // Use stored email from registration
    const storedEmail = sessionStorage.getItem('registrationEmail');
    
    if (storedEmail) {
      this.setState({ email: storedEmail });
    }
    
    // Check if redirected from registration
    const urlParams = new URLSearchParams(window.location.search);
    const fromRegistration = urlParams.get('fromRegistration');
    if (fromRegistration === 'true') {
      const email = sessionStorage.getItem('registrationEmail');
      const message = email 
        ? `Registration successful! Please log in with your email "${email}" and password.`
        : 'Registration successful! Please log in with your credentials.';
      
      // Show toast notification only
      toast.success({
        title: "Registration Successful",
        description: message
      });
    }
  }
  
  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    this.setState({ 
      ...this.state, 
      [name]: value,
      error: null
    } as Pick<LoginPageState, keyof LoginPageState>);
  };
  
  // Helper method to create initial profile if needed
  createInitialProfileIfNeeded = async () => {
    try {
      // Check if we have stored full name from registration
      const fullName = sessionStorage.getItem('registrationFullName');
      
      if (fullName) {
        console.log('Creating initial profile with stored full name:', fullName);
        
        try {
          // Try to create the initial profile
          await profileService.createInitialProfile(fullName);
          console.log('Successfully created initial profile');
          
          // Clear stored registration data after successful profile creation
          sessionStorage.removeItem('registrationEmail');
          sessionStorage.removeItem('registrationFullName');
          
          // Refresh user data to get updated profile information
          if (this.context && this.context.fetchUserProfile) {
            await this.context.fetchUserProfile();
          }
        } catch (error) {
          console.error('Error creating initial profile:', error);
          // Don't block the login flow if this fails
        }
      }
    } catch (error) {
      console.error('Error in createInitialProfileIfNeeded:', error);
      // Don't block the login flow if this fails
    }
  };
  
  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { email, password } = this.state;
    
    // Make sure the context is defined
    if (!this.context || !this.context.login) {
      toast.destructive({
        title: "Authentication Error",
        description: "Authentication service not available"
      });
      this.setState({ error: "Authentication service not available" });
      return;
    }
    
    const { login } = this.context;
    
    this.setState({ error: null, isLoading: true });
    
    try {
      // Use the login method from AuthContext with email and password as separate parameters
      await login(email, password);
      
      // Show success toast
      toast.success({
        title: "Login Successful",
        description: "You have been successfully logged in."
      });
      
      // After successful login, try to create initial profile if needed
      await this.createInitialProfileIfNeeded();
      
      // Check user role and determine where to redirect
      if (this.context && this.context.user) {
        const { user } = this.context;
        
        // Redirect based on user role and onboarding status
        if (user.roles?.includes('ROLE_ADMIN')) {
          this.setState({ redirectTo: '/admin/dashboard' });
        } else if (user.roles?.includes('ROLE_EMPLOYER') && !user.hasCompletedOnboarding) {
          this.setState({ redirectTo: '/onboarding/employer' });
        } else if (user.roles?.includes('ROLE_STUDENT') && !user.hasCompletedOnboarding) {
          this.setState({ redirectTo: '/onboarding/student' });
        } else {
          this.setState({ redirectTo: '/' });
        }
      } else {
        // If context or user is not available after login, redirect to home
        this.setState({ redirectTo: '/' });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Provide more helpful error message for 403 errors
      if (error.response?.status === 403) {
        const email = sessionStorage.getItem('registrationEmail');
        const errorMessage = email 
          ? `Invalid credentials. Please use your email "${email}" and password.` 
          : "Invalid email or password. Please make sure you're using the email address you registered with.";
        
        // Show toast notification
        toast.destructive({
          title: "Login Failed",
          description: errorMessage
        });
        
        this.setState({ 
          error: errorMessage,
          isLoading: false
        });
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
        
        // Show toast notification
        toast.destructive({
          title: "Login Error",
          description: errorMessage
        });
        
        this.setState({ 
          error: errorMessage,
          isLoading: false
        });
      }
    }
  };
  
  render() {
    const { isLoading, error, redirectTo } = this.state;
    
    // If we need to redirect, do it
    if (redirectTo) {
      return <Navigate to={redirectTo} />;
    }
    
    // If user is already logged in, redirect to home
    if (this.context && this.context.user) {
      return <Navigate to="/" />;
    }
    
    return (
      <AuthLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 shadow-lg">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Sign in to your account
              </p>
            </div>
            
            <form onSubmit={this.handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email or Username</Label>
                <Input
                  id="email"
                  name="email"
                  type="text"
                  value={this.state.email}
                  onChange={this.handleInputChange}
                  required
                  autoFocus
                  autoComplete="email"
                  placeholder="Enter your email or username"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={this.state.password}
                  onChange={this.handleInputChange}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full"
                />
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm dark:bg-red-900/30 dark:text-red-400">
                  {error}
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  Sign up
                </Link>
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                  Or continue with
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <Button variant="outline" disabled className="w-full">
                <Github className="mr-2 h-4 w-4" />
                GitHub (Coming Soon)
              </Button>
            </div>
          </Card>
        </div>
      </AuthLayout>
    );
  }
} 