import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { UserData } from '@/lib/api/authService';
import profileService from '@/lib/api/profileService'; // Import profile service

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfileData = async (userData: UserData): Promise<AppUser> => {
    let profileData: any = null;
    let hasCompletedOnboarding = false;
    try {
      if (userData.roles.includes('ROLE_STUDENT')) {
        profileData = await profileService.getCurrentStudentProfile();
        hasCompletedOnboarding = profileData?.hasCompletedOnboarding || false;
      } else if (userData.roles.includes('ROLE_EMPLOYER')) {
        profileData = await profileService.getCurrentEmployerProfile();
        hasCompletedOnboarding = profileData?.hasCompletedOnboarding || false;
      }
    } catch (error: any) {
      // Ignore 404 if profile doesn't exist yet, means onboarding not done
      if (error.response?.status !== 404) {
        console.error("Failed to fetch user profile:", error);
        // Potentially set an error state here to show in UI
      }
      hasCompletedOnboarding = false; // Assume not complete if error or 404
    }
    return { ...userData, profile: profileData, hasCompletedOnboarding };
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const fullUser = await fetchUserProfileData(currentUser);
        setUser(fullUser);
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (data: any) => {
    setIsLoading(true);
    try {
      const baseUserData = await authService.login(data);
      const fullUser = await fetchUserProfileData(baseUserData);
      setUser(fullUser);
      setIsLoading(false);
      return fullUser;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (data: any) => {
    // After registration, user is not logged in immediately by this setup.
    // They need to login separately. Or, modify backend to return JWT on signup.
    return authService.register(data);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const fetchUserProfile = async () => {
    if (user) {
        setIsLoading(true);
        const fullUser = await fetchUserProfileData(user);
        setUser(fullUser);
        setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 