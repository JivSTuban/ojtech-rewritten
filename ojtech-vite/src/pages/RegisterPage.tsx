import React, { Component } from 'react';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../providers/AuthProvider';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card } from '../components/ui/Card';
import { Loader2, Github } from 'lucide-react';
import { AuthLayout } from '../components/layouts/AuthLayout';

interface RegisterPageState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  errors: {
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  };
  isLoading: boolean;
  redirectTo: string | null;
}

export class RegisterPage extends Component<{}, RegisterPageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;
  
  // API base URL
  private API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  
  constructor(props: {}) {
    super(props);
    this.state = {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      errors: {},
      isLoading: false,
      redirectTo: null
    };
  }
  
  componentDidMount() {
    // Check if already logged in
    if (this.context && this.context.user) {
      this.setState({ redirectTo: '/' });
    }
  }
  
  handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    this.setState({ 
      ...this.state, 
      [name]: value,
      errors: {
        ...this.state.errors,
        [name]: undefined, // Clear the error when the field is changed
        general: undefined // Clear general errors
      }
    } as unknown as RegisterPageState);
  };
  
  validateForm = (): boolean => {
    const { fullName, email, password, confirmPassword } = this.state;
    const errors: RegisterPageState['errors'] = {};
    let isValid = true;
    
    // Validate full name
    if (!fullName || fullName.trim().length < 3) {
      errors.fullName = 'Full name must be at least 3 characters';
      isValid = false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Validate password
    if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      isValid = false;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    this.setState({ errors });
    return isValid;
  };
  
  // Generate a username from email
  generateUsername = (email: string): string => {
    // Take the part before @ and add a random number
    const baseUsername = email.split('@')[0];
    const randomSuffix = Math.floor(Math.random() * 10000);
    return `${baseUsername}${randomSuffix}`;
  };
  
  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!this.validateForm()) {
      return;
    }
    
    const { fullName, email, password } = this.state;
    
    if (!this.context || !this.context.register) {
      this.setState({ 
        errors: {
          general: 'Registration service is not available'
        }
      });
      return;
    }
    
    this.setState({ isLoading: true });
    
    try {
      // Generate a username from email
      const username = this.generateUsername(email);
      
      // Store full name and email in session storage before registration
      // This will be used for profile creation and login
      sessionStorage.setItem('registrationFullName', fullName);
      sessionStorage.setItem('registrationEmail', email);
      // Also store the generated username for login after registration
      sessionStorage.setItem('registrationUsername', username);
      
      // Call register function from context with STUDENT role
      // Note: We don't include fullName in the request as the backend doesn't accept it
      await this.context.register({
        username,
        email,
        password,
        roles: ["ROLE_STUDENT"]
      });
      
      // The user is now logged in, and the AuthProvider will handle redirection
      // based on the user's role and onboarding status
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific API error responses
      if (error.response?.data?.message) {
        // Handle field-specific errors if available
        if (error.response.data.fieldErrors) {
          const fieldErrors = error.response.data.fieldErrors;
          const errors: RegisterPageState['errors'] = {};
          
          // Map backend field errors to our state
          Object.keys(fieldErrors).forEach(key => {
            errors[key as keyof typeof errors] = fieldErrors[key];
          });
          
          this.setState({ errors, isLoading: false });
        } else {
          // General error
          this.setState({ 
            errors: { general: error.response.data.message },
            isLoading: false
          });
        }
      } else if (error.message && error.message.includes('403')) {
        // Handle login failure after successful registration
        this.setState({ 
          errors: { 
            general: `Registration successful, but automatic login failed. Please go to the login page and sign in with your email address and password.` 
          },
          isLoading: false,
          redirectTo: '/login?fromRegistration=true'  // Redirect to login page with query parameter
        });
      } else {
        // Generic error
        this.setState({ 
          errors: { general: error.message || 'Registration failed. Please try again.' },
          isLoading: false
        });
      }
    }
  };
  
  render() {
    const { 
      fullName, 
      email, 
      password, 
      confirmPassword, 
      errors, 
      isLoading, 
      redirectTo 
    } = this.state;
    
    if (redirectTo) {
      return <Navigate to={redirectTo} />;
    }
    
    return (
      <AuthLayout>
        <Card className="w-full p-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Create your account</h1>
          </div>
          
          <form onSubmit={this.handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={fullName}
                onChange={this.handleInputChange}
                required
                className="mt-1"
              />
              {errors.fullName && (
                <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
              )}
            </div>
            
            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={this.handleInputChange}
                required
                className="mt-1"
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>
            
            {/* Password */}
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
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>
            
            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={this.handleInputChange}
                required
                className="mt-1"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>
            
            {/* General error message */}
            {errors.general && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md">
                {errors.general}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
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
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </AuthLayout>
    );
  }
} 