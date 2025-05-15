import React, { Component, createContext } from 'react';
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';

// Define types for our context
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  setProfile: (profile: any) => void;
}

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  signUp: async () => ({}),
  signIn: async () => ({}),
  signOut: async () => {},
  setProfile: () => {},
});

// Props for AuthProvider
interface AuthProviderProps {
  children: React.ReactNode;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

// State interface
interface AuthProviderState {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
}

export class AuthProvider extends Component<AuthProviderProps, AuthProviderState> {
  private supabase: SupabaseClient;

  constructor(props: AuthProviderProps) {
    super(props);
    
    // Check if required props are provided
    if (!props.supabaseUrl || !props.supabaseAnonKey) {
      console.error("Missing Supabase credentials. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file");
      // Use demo credentials for development to avoid crashing
      const demoUrl = 'https://demo.supabase.co'; 
      const demoKey = 'demo';
      // Initialize with demo credentials
      this.supabase = createClient(demoUrl, demoKey);
    } else {
      // Initialize Supabase client with provided credentials
      this.supabase = createClient(props.supabaseUrl, props.supabaseAnonKey);
    }
    
    // Set initial state
    this.state = {
      session: null,
      user: null,
      profile: null,
      isLoading: true,
    };
  }

  componentDidMount() {
    // Set up auth state listener
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.setState({ session, user: session?.user || null });
      
      // If user is authenticated, fetch their profile
      if (session?.user) {
        this.fetchProfile(session.user.id);
      } else {
        this.setState({ isLoading: false });
      }
    });
    
    // Get initial session
    this.initializeAuth();
  }

  componentWillUnmount() {
    // Clean up any subscriptions
  }

  // Initialize auth state
  private async initializeAuth() {
    try {
      const { data } = await this.supabase.auth.getSession();
      this.setState({ 
        session: data.session,
        user: data.session?.user || null
      });
      
      if (data.session?.user) {
        await this.fetchProfile(data.session.user.id);
      } else {
        this.setState({ isLoading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.setState({ isLoading: false });
    }
  }

  // Fetch user profile
  private async fetchProfile(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      this.setState({ 
        profile: data,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      this.setState({ isLoading: false });
    }
  }

  // Auth methods
  signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  };

  signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
  };

  signOut = async () => {
    try {
      await this.supabase.auth.signOut();
      this.setState({ 
        user: null,
        session: null,
        profile: null
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  setProfile = (profile: any) => {
    this.setState({ profile });
  };

  render() {
    const { user, session, profile, isLoading } = this.state;
    const { children } = this.props;

    const value: AuthContextType = {
      user,
      session,
      profile,
      isLoading,
      signUp: this.signUp,
      signIn: this.signIn,
      signOut: this.signOut,
      setProfile: this.setProfile,
    };

    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  }
}

// Hook for consuming the auth context
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 