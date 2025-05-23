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
import { toast } from '../components/ui/toast-utils';
import { GoogleLogin } from '@react-oauth/google';

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
  isGoogleLoading: boolean;
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
      isGoogleLoading: false,
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
    
    // Show toast for validation errors
    if (!isValid) {
      const errorMessages = Object.values(errors).filter(Boolean);
      if (errorMessages.length > 0) {
        toast.destructive({
          title: "Validation Error",
          description: errorMessages[0]
        });
      }
    }
    
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
      const errorMessage = 'Registration service is not available';
      
      toast.destructive({
        title: "Registration Error",
        description: errorMessage
      });
      
      this.setState({ 
        errors: {
          general: errorMessage
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
      
      // Show success toast
      toast.success({
        title: "Registration Successful",
        description: "Your account has been created successfully."
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
          
          // Show toast for the first field error
          const errorMessages = Object.values(fieldErrors).filter(Boolean) as string[];
          if (errorMessages.length > 0) {
            toast.destructive({
              title: "Registration Error",
              description: errorMessages[0]
            });
          }
          
          this.setState({ errors, isLoading: false });
        } else {
          // General error
          const errorMessage = error.response.data.message;
          
          toast.destructive({
            title: "Registration Error",
            description: errorMessage
          });
          
          this.setState({ 
            errors: { general: errorMessage },
            isLoading: false
          });
        }
      } else if (error.message && error.message.includes('403')) {
        // Handle login failure after successful registration
        const errorMessage = `Registration successful, but automatic login failed. Please go to the login page and sign in with your email address and password.`;
        
        toast.warning({
          title: "Registration Successful",
          description: "Please sign in with your new credentials."
        });
        
        this.setState({ 
          errors: { general: errorMessage },
          isLoading: false,
          redirectTo: '/login?fromRegistration=true'  // Redirect to login page with query parameter
        });
      } else {
        // Generic error
        const errorMessage = error.message || 'Registration failed. Please try again.';
        
        toast.destructive({
          title: "Registration Error",
          description: errorMessage
        });
        
        this.setState({ 
          errors: { general: errorMessage },
          isLoading: false
        });
      }
    }
  };

  handleGoogleLogin = async (tokenId: string) => {
    if (!this.context || !this.context.googleLogin) {
      const errorMessage = 'Google authentication service is not available';
      
      toast.destructive({
        title: "Authentication Error",
        description: errorMessage
      });
      
      this.setState({ 
        errors: {
          general: errorMessage
        }
      });
      return;
    }
    
    this.setState({ isGoogleLoading: true });
    
    try {
      console.log("Google auth initiated with token");
      const user = await this.context.googleLogin(tokenId);
      
      // Show success toast
      toast.success({
        title: "Authentication Successful",
        description: "You have been successfully signed in with Google."
      });
      
      // Redirect to the appropriate page based on onboarding status and role
      if (user.hasCompletedOnboarding) {
        if (user.roles?.includes('ROLE_STUDENT')) {
          this.setState({ redirectTo: '/track' });
        } else if (user.roles?.includes('ROLE_EMPLOYER')) {
          this.setState({ redirectTo: '/employer/jobs' });
        } else if (user.roles?.includes('ROLE_ADMIN')) {
          this.setState({ redirectTo: '/admin/dashboard' });
        } else {
          this.setState({ redirectTo: '/' });
        }
      } else {
        // If they need to complete onboarding, send them to the appropriate page
        if (user.roles?.includes('ROLE_STUDENT')) {
          this.setState({ redirectTo: '/onboarding/student' });
        } else if (user.roles?.includes('ROLE_EMPLOYER')) {
          this.setState({ redirectTo: '/onboarding/employer' });
        } else {
          this.setState({ redirectTo: '/' });
        }
      }
    } catch (error: any) {
      console.error('Google authentication error:', error);
      
      // Enhanced error detection
      let errorMessage;
      let errorTitle = "Authentication Error";
      
      if (error.message?.includes('Invalid Google token')) {
        errorMessage = "Invalid authentication token received from Google.";
      } else if (error.message?.includes('Email not found')) {
        errorMessage = "Could not retrieve your email from Google. Please ensure your Google account has a verified email.";
      } else if (error.message?.includes('access_denied')) {
        // Google denied access
        errorMessage = "You denied access to your Google account. Please try again.";
      } else if (error.message?.includes('popup_closed')) {
        // User closed the popup
        errorMessage = "The authentication popup was closed. Please try again.";
        errorTitle = "Authentication Canceled";
      } else if (error.message?.includes('network')) {
        // Network issues
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else {
        // Generic error fallback
        errorMessage = error.message || 'Google authentication failed. Please try again.';
      }
      
      toast.destructive({
        title: errorTitle,
        description: errorMessage
      });
      
      this.setState({ 
        errors: { general: errorMessage },
        isGoogleLoading: false
      });
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
      isGoogleLoading,
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
            <div className="w-full">
              {isGoogleLoading ? (
                <Button variant="outline" className="w-full flex items-center justify-center" disabled>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Google...
                </Button>
              ) : (
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (credentialResponse.credential) {
                      this.handleGoogleLogin(credentialResponse.credential);
                    } else {
                      toast.destructive({
                        title: "Google Login Error",
                        description: "Failed to get credentials from Google."
                      });
                    }
                  }}
                  onError={() => {
                    toast.destructive({
                      title: "Google Login Error",
                      description: "Google authentication failed. Please try again."
                    });
                  }}
                  useOneTap
                  theme="outline"
                  size="large"
                  logo_alignment="center"
                  text="signup_with"
                  shape="rectangular"
                />
              )}
            </div>
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