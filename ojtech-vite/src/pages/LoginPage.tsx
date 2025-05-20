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
    const { email, password, error, isLoading, redirectTo } = this.state;
    
    if (redirectTo) {
      return <Navigate to={redirectTo} />;
    }
    
    return (
      <AuthLayout>
        <Card className="w-full p-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>
          
          <form onSubmit={this.handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={this.handleInputChange}
                  required
                  className="mt-1"
                  placeholder="Enter your email address"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={this.handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md">
                {error}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" aria-hidden="true">
                <path
                  d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                  fill="#EA4335"
                />
                <path
                  d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                  fill="#4285F4"
                />
                <path
                  d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.25 12.0004 19.25C8.8704 19.25 6.21537 17.14 5.2654 14.295L1.27539 17.39C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                  fill="#34A853"
                />
              </svg>
              Google
            </Button>
            <Button variant="outline" className="w-full flex items-center justify-center">
              <Github className="h-5 w-5 mr-2" />
              GitHub
            </Button>
          </div>
          
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </Card>
      </AuthLayout>
    );
  }
} 