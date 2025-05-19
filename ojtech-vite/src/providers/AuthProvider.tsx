import React, { Component, createContext, useContext, ReactNode } from 'react';
import authService, { UserData } from '@/lib/api/authService';
import profileService from '@/lib/api/profileService'; // Import profile service
import axios from 'axios';

export interface AppUser extends UserData {
  // Add profile specific fields here, or a nested profile object
  profile?: any; // Generic profile for now, can be StudentProfileData or EmployerProfileData
  hasCompletedOnboarding?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  login: (data: any) => Promise<AppUser>;
  register: (data: any) => Promise<any>; 
  logout: () => void;
  isLoading: boolean;
  fetchUserProfile: () => Promise<void>; // Added to manually refresh profile
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthProviderState {
  user: AppUser | null;
  isLoading: boolean;
}

export class AuthProvider extends Component<AuthProviderProps, AuthProviderState> {
  constructor(props: AuthProviderProps) {
    super(props);
    this.state = {
      user: null,
      isLoading: true
    };
  }

  componentDidMount() {
    this.initializeAuth();
  }

  fetchUserProfileData = async (userData: UserData): Promise<AppUser> => {
    let profileData: any = null;
    let hasCompletedOnboarding = false;
    
    try {
      // First try the general profile endpoint which should be more reliable
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/profile/me`, {
          headers: { 
            Authorization: `Bearer ${userData?.accessToken}` 
          }
        });
        
        if (response.data) {
          hasCompletedOnboarding = response.data.hasCompletedOnboarding || false;
        }
      } catch (error) {
        console.warn("Could not fetch base profile, trying role-specific profile");
      }
      
      // Then try to get role-specific profile data
      if (userData?.roles?.includes('ROLE_STUDENT')) {
        try {
        profileData = await profileService.getCurrentStudentProfile();
          hasCompletedOnboarding = profileData?.hasCompletedOnboarding || hasCompletedOnboarding;
        } catch (error: any) {
          // Only log a warning for 404s as this might be expected for new users
          if (error.response?.status === 404) {
            console.warn("Student profile not found - user may need to complete onboarding");
          } else {
            console.error("Error fetching student profile:", error);
          }
        }
      } else if (userData?.roles?.includes('ROLE_EMPLOYER')) {
        try {
        profileData = await profileService.getCurrentEmployerProfile();
          hasCompletedOnboarding = profileData?.hasCompletedOnboarding || hasCompletedOnboarding;
        } catch (error: any) {
          // Only log a warning for 404s as this might be expected for new users
          if (error.response?.status === 404) {
            console.warn("Employer profile not found - user may need to complete onboarding");
          } else {
            console.error("Error fetching employer profile:", error);
          }
        }
      }
    } catch (error: any) {
        console.error("Failed to fetch user profile:", error);
    }
    
    return { ...userData, profile: profileData, hasCompletedOnboarding };
  };

  initializeAuth = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
      const fullUser = await this.fetchUserProfileData(currentUser);
      this.setState({ user: fullUser });
      }
    this.setState({ isLoading: false });
    };

  login = async (data: any) => {
    this.setState({ isLoading: true });
    try {
      const baseUserData = await authService.login(data);
      const fullUser = await this.fetchUserProfileData(baseUserData);
      this.setState({ 
        user: fullUser,
        isLoading: false
      });
      return fullUser;
    } catch (error) {
      this.setState({ isLoading: false });
      throw error;
    }
  };

  register = async (data: any) => {
    try {
      // Register the user
      await authService.register(data);
      
      // Automatically log in after registration
      // Use username instead of email for login
      const loginData = {
        usernameOrEmail: data.username, // Use username instead of email
        password: data.password
      };
      
      return this.login(loginData);
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