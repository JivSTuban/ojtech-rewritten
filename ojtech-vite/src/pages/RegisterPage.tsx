import React, { Component, FormEvent } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { ToastHelper } from '../providers/ToastContext';
import { Loader2 } from 'lucide-react';

interface RegisterPageProps {}

interface RegisterPageState {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: string;
  agreeToTerms: boolean;
  loading: boolean;
  errors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    terms?: string;
    general?: string;
  };
  isAuthenticated: boolean;
}

export class RegisterPage extends Component<RegisterPageProps, RegisterPageState> {
  private supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );
  
  constructor(props: RegisterPageProps) {
    super(props);
    
    this.state = {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      role: 'student',
      agreeToTerms: false,
      loading: false,
      errors: {},
      isAuthenticated: false
    };
  }
  
  componentDidMount() {
    this.checkAuthentication();
  }
  
  // Check if user is already authenticated
  checkAuthentication = async () => {
    const { data } = await this.supabase.auth.getSession();
    if (data.session) {
      this.setState({ isAuthenticated: true });
    }
  };
  
  // Handle input changes
  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    this.setState({ [name]: value } as unknown as Pick<RegisterPageState, keyof RegisterPageState>);
  };
  
  // Handle role selection
  handleRoleChange = (value: string) => {
    this.setState({ role: value });
  };
  
  // Handle checkbox change
  handleCheckboxChange = (checked: boolean) => {
    this.setState({ agreeToTerms: checked });
  };
  
  // Validate form
  validateForm = (): boolean => {
    const { email, password, confirmPassword, firstName, lastName, role, agreeToTerms } = this.state;
    const errors: RegisterPageState['errors'] = {};
    
    // Email validation
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // First name validation
    if (!firstName) {
      errors.firstName = 'First name is required';
    }
    
    // Last name validation
    if (!lastName) {
      errors.lastName = 'Last name is required';
    }
    
    // Role validation
    if (!role) {
      errors.role = 'Please select a role';
    }
    
    // Terms validation
    if (!agreeToTerms) {
      errors.terms = 'You must agree to the terms and conditions';
    }
    
    this.setState({ errors });
    
    // Form is valid if there are no errors
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!this.validateForm()) {
      return;
    }
    
    this.setState({ loading: true });
    
    try {
      const { email, password, firstName, lastName, role } = this.state;
      
      // Register the user with Supabase Auth
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // Create a profile record in the database
        await this.supabase.from('profiles').insert({
          user_id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          role
        });
        
        // Show success message
        ToastHelper.toast({
          title: "Registration successful",
          description: "Please check your email to verify your account.",
        });
        
        // Redirect to login page after successful registration
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 2000);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific error cases
      if (error.message.includes('email')) {
        this.setState({
          errors: {
            ...this.state.errors,
            email: error.message
          }
        });
      } else {
        this.setState({
          errors: {
            ...this.state.errors,
            general: error.message
          }
        });
      }
      
      ToastHelper.toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      this.setState({ loading: false });
    }
  };
  
  render() {
    const { 
      email, 
      password, 
      confirmPassword, 
      firstName, 
      lastName, 
      role, 
      agreeToTerms, 
      loading, 
      errors,
      isAuthenticated
    } = this.state;
    
    // Redirect if already authenticated
    if (isAuthenticated) {
      return <Navigate to="/" />;
    }
    
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[85vh] px-4 py-8">
        <Card className="w-full max-w-md p-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Create an Account</h1>
            <p className="text-gray-600">Join OJTech to find your perfect internship</p>
          </div>
          
          {errors.general && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {errors.general}
            </div>
          )}
          
          <form onSubmit={this.handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={firstName}
                  onChange={this.handleChange}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={lastName}
                  onChange={this.handleChange}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={this.handleChange}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={this.handleChange}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={this.handleChange}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">I am a...</Label>
              <Select value={role} onValueChange={this.handleRoleChange}>
                <SelectTrigger id="role" className={errors.role ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student looking for OJT</SelectItem>
                  <SelectItem value="employer">Employer/Company</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-red-500 text-xs mt-1">{errors.role}</p>
              )}
            </div>
            
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox 
                id="terms" 
                checked={agreeToTerms} 
                onCheckedChange={this.handleCheckboxChange}
              />
              <Label 
                htmlFor="terms" 
                className={`text-sm leading-tight ${errors.terms ? 'text-red-500' : ''}`}
              >
                I agree to the Terms of Service and Privacy Policy
              </Label>
            </div>
            {errors.terms && (
              <p className="text-red-500 text-xs mt-0">{errors.terms}</p>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
          
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-primary font-medium">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    );
  }
} 