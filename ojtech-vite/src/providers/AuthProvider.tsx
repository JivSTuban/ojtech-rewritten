import React, { Component, createContext } from 'react';
// import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js'; // Commented out
import type { Session, User } from '@supabase/supabase-js'; // Keep types needed for context

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
  // supabaseUrl: string; // Removed
  // supabaseAnonKey: string; // Removed
}

// State interface
interface AuthProviderState {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
}

export class AuthProvider extends Component<AuthProviderProps, AuthProviderState> {
  // private supabase: SupabaseClient; // Removed

  constructor(props: AuthProviderProps) {
    super(props);
    
    // console.error("Missing Supabase credentials. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file");
    // const demoUrl = 'https://demo.supabase.co'; 
    // const demoKey = 'demo';
    // this.supabase = createClient(demoUrl, demoKey);
    
    // Initialize Supabase client with provided credentials
    // this.supabase = createClient(props.supabaseUrl, props.supabaseAnonKey); // Removed
    
    this.state = {
      session: null,
      user: null,
      profile: null,
      isLoading: true,
    };
  }

  componentDidMount() {
    // Set up auth state listener
    // this.supabase.auth.onAuthStateChange((event, session) => { // Removed
    //   this.setState({ session, user: session?.user || null });
      
    //   if (session?.user) {
    //     this.fetchProfile(session.user.id);
    //   } else {
    //     this.setState({ isLoading: false });
    //   }
    // });
    
    // Get initial session
    // this.initializeAuth(); // Removed
    this.setState({ isLoading: false }); // Set loading to false immediately
  }

  componentWillUnmount() {
    // Clean up any subscriptions
  }

  // Initialize auth state
  private async initializeAuth() {
    // try { // Removed
    //   const { data } = await this.supabase.auth.getSession();
    //   this.setState({ 
    //     session: data.session,
    //     user: data.session?.user || null
    //   });
      
    //   if (data.session?.user) {
    //     await this.fetchProfile(data.session.user.id);
    //   } else {
    //     this.setState({ isLoading: false });
    //   }
    // } catch (error) {
    //   console.error('Error initializing auth:', error);
    //   this.setState({ isLoading: false });
    // }
  }

  // Fetch user profile
  private async fetchProfile(userId: string) {
    // try { // Removed
    //   const { data, error } = await this.supabase
    //     .from('profiles')
    //     .select('*')
    //     .eq('id', userId)
    //     .single();
      
    //   if (error) throw error;
      
    //   this.setState({ 
    //     profile: data,
    //     isLoading: false
    //   });
    // } catch (error) {
    //   console.error('Error fetching profile:', error);
    //   this.setState({ isLoading: false });
    // }
    console.log("fetchProfile called with userId:", userId); // Placeholder
  }

  // Auth methods
  signUp = async (email: string, password: string) => {
    console.log("signUp called with:", email, password); // Placeholder
    return { data: null, error: { message: "Sign up not implemented" } }; // Placeholder
    // try { // Removed
    //   const { data, error } = await this.supabase.auth.signUp({
    //     email,
    //     password
    //   });
      
    //   if (error) throw error;
    //   return { data, error: null };
    // } catch (error) {
    //   console.error('Error signing up:', error);
    //   return { data: null, error };
    // }
  };

  signIn = async (email: string, password: string) => {
    console.log("signIn called with:", email, password); // Placeholder
    return { data: null, error: { message: "Sign in not implemented" } }; // Placeholder
    // try { // Removed
    //   const { data, error } = await this.supabase.auth.signInWithPassword({
    //     email,
    //     password
    //   });
      
    //   if (error) throw error;
    //   return { data, error: null };
    // } catch (error) {
    //   console.error('Error signing in:', error);
    //   return { data: null, error };
    // }
  };

  signOut = async () => {
    console.log("signOut called"); // Placeholder
    this.setState({ user: null, session: null, profile: null }); // Placeholder
    // try { // Removed
    //   await this.supabase.auth.signOut();
    //   this.setState({ 
    //     user: null,
    //     session: null,
    //     profile: null
    //   });
    // } catch (error) {
    //   console.error('Error signing out:', error);
    // }
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