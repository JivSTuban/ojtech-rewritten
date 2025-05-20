import React, { Component, createContext, useContext, ReactNode } from 'react';
import authService, { UserData } from '../lib/api/authService';
import profileService from '../lib/api/profileService'; // Import profile service
import axios from 'axios';

export interface AppUser extends UserData {
  // Add profile specific fields here, or a nested profile object
  profile?: any; // Generic profile for now, can be StudentProfileData or EmployerProfileData
  hasCompletedOnboarding?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  login: (usernameOrEmail: string, password: string) => Promise<AppUser>;
  register: (data: any) => Promise<any>; 
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  profile: any;
  needsOnboarding: boolean;
  fetchUserProfile: () => Promise<void>; // Added to manually refresh profile
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthProviderState {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  profile: any | null;
  needsOnboarding: boolean;
}

export class AuthProvider extends Component<AuthProviderProps, AuthProviderState> {
  constructor(props: AuthProviderProps) {
    super(props);
    this.state = {
      user: null,
      isLoading: true,
      isAuthenticated: false,
      profile: null,
      needsOnboarding: true
    };
  }

  componentDidMount() {
    this.initializeAuth();
  }

  fetchUserProfileData = async (userData: UserData): Promise<AppUser> => {
    try {
      const profile = await profileService.getCurrentStudentProfile();
      
      const user: AppUser = {
        ...userData,
        profile: profile || null,
        hasCompletedOnboarding: profile ? profile.hasCompletedOnboarding : false
      };
      
      this.setState({
        isLoading: false,
        isAuthenticated: true,
        user,
        profile: profile || null,
        needsOnboarding: !profile || !profile.hasCompletedOnboarding
      });
      
      return user;
        } catch (error: any) {
      console.error("Error fetching user profile:", error);
      
      if (error.response && error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        this.logout();
        throw error; // Rethrow to handle in calling code
          } else {
        // Other error - still authenticated but no profile
        const user: AppUser = {
          ...userData,
          profile: null,
          hasCompletedOnboarding: false
        };
        
        this.setState({
          isLoading: false,
          isAuthenticated: true,
          user,
          profile: null,
          needsOnboarding: true
        });
        
        return user;
      }
    }
  };

  initializeAuth = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
      const fullUser = await this.fetchUserProfileData(currentUser);
        this.setState({ 
          user: fullUser,
          isLoading: false,
          isAuthenticated: true,
          needsOnboarding: !fullUser.profile?.hasCompletedOnboarding
        });
      } else {
        this.setState({ isLoading: false });
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
    this.setState({ isLoading: false });
    }
    };

  login = async (usernameOrEmail: string, password: string) => {
    try {
    this.setState({ isLoading: true });
      const baseUserData = await authService.login({
        usernameOrEmail,
        password
      });
      
      const fullUser = await this.fetchUserProfileData(baseUserData);
      
      this.setState({ 
        isLoading: false,
        isAuthenticated: true,
        user: fullUser,
        profile: fullUser.profile,
        needsOnboarding: !fullUser.profile?.hasCompletedOnboarding
      });
      
      return fullUser;
    } catch (error: any) {
      this.setState({ isLoading: false });
      throw error;
    }
  };

  register = async (data: any) => {
    try {
      // Register the user
      await authService.register(data);
      
      // Store the email for login
      console.log('Registration successful for email:', data.email);
      
      // Add a small delay before attempting login to ensure backend processing is complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Automatically log in after registration
      // Use the email for login instead of username, as that's what the backend expects
      console.log('Attempting automatic login with email:', data.email);
      
      try {
        return await this.login(data.email, data.password);
      } catch (error: any) {
        console.error('Automatic login failed after registration:', error);
        
        // If login fails with 403, create a minimal user object to return
        // This allows the user to proceed without having to manually log in
        if (error.response?.status === 403) {
          console.log('Creating minimal user object after 403 error');
          const minimalUser: AppUser = {
            id: 0, // Placeholder ID
            username: data.username,
            email: data.email,
            roles: ['ROLE_STUDENT'], // Assuming student role for new registrations
            accessToken: '', // Empty token
            profile: null,
            hasCompletedOnboarding: false
          };
          
          // Update state to show as authenticated but needing onboarding
          this.setState({
            user: minimalUser,
            isAuthenticated: true,
            isLoading: false,
            needsOnboarding: true,
            profile: null
          });
          
          return minimalUser;
        }
        
        // For other errors, redirect to login page
        throw error;
      }
    } catch (error) {
      throw error;
    }
  };

  logout = () => {
    authService.logout();
    this.setState({ user: null });
  };

  fetchUserProfile = async () => {
    const { user } = this.state;
    if (user) {
      this.setState({ isLoading: true });
      const fullUser = await this.fetchUserProfileData(user);
      this.setState({
        user: fullUser,
        isLoading: false
      });
    }
  }

  render() {
    const { user, isLoading } = this.state;
    const value: AuthContextType = {
      user, 
      login: this.login, 
      register: this.register, 
      logout: this.logout, 
      isLoading,
      isAuthenticated: this.state.isAuthenticated,
      profile: this.state.profile,
      needsOnboarding: this.state.needsOnboarding,
      fetchUserProfile: this.fetchUserProfile
    };

  return (
      <AuthContext.Provider value={value}>
        {this.props.children}
    </AuthContext.Provider>
  );
  }
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 