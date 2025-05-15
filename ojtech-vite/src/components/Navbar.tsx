import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/Button';

interface NavbarProps {
  user?: {
    email: string;
  } | null;
  profile?: {
    role?: string;
    avatar_url?: string;
    full_name?: string;
  } | null;
  signOut?: () => void;
  isLoading?: boolean;
}

interface NavbarState {
  isDropdownOpen: boolean;
}

export class Navbar extends Component<NavbarProps, NavbarState> {
  constructor(props: NavbarProps) {
    super(props);
    this.state = {
      isDropdownOpen: false
    };
  }

  toggleDropdown = () => {
    this.setState(prevState => ({
      isDropdownOpen: !prevState.isDropdownOpen
    }));
  };

  componentDidMount() {
    // Update loading state classes
    document.body.classList.toggle('auth-checking', !!this.props.isLoading);
    document.body.classList.toggle('auth-ready', !this.props.isLoading);
  }

  componentDidUpdate(prevProps: NavbarProps) {
    if (prevProps.isLoading !== this.props.isLoading) {
      document.body.classList.toggle('auth-checking', !!this.props.isLoading);
      document.body.classList.toggle('auth-ready', !this.props.isLoading);
    }
  }

  render() {
    const { user, profile, signOut, isLoading } = this.props;
    const { isDropdownOpen } = this.state;

    // Don't render anything while checking auth
    if (isLoading) {
      return (
        <nav className="w-full bg-black text-white border-b border-gray-800">
          <div className="container mx-auto px-4 flex h-14 items-center justify-between">
            <div className="flex items-center">
              <span className="font-bold text-lg mr-8">OJTech</span>
            </div>
            <div className="h-6 w-6 animate-spin rounded-full border-2 loading-spinner" />
          </div>
        </nav>
      );
    }

    return (
      <nav className="w-full bg-black text-white border-b border-gray-800">
        <div className="container mx-auto px-4 flex h-14 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="font-bold text-lg mr-8">
              OJTech
            </Link>
            
            {user && profile?.role && (
              <div className="flex space-x-6">
                {/* Common navigation for all non-student users */}
                {profile.role !== "student" && (
                  <Link to="/" className="text-gray-400 hover:text-white">
                    Home
                  </Link>
                )}
                
                {/* Student-specific navigation */}
                {profile.role === "student" && (
                  <>
                    <Link to="/opportunities" className="text-gray-400 hover:text-white">
                      Find Jobs
                    </Link>
                    <Link to="/track" className="text-gray-400 hover:text-white">
                      Track Applications
                    </Link>
                  </>
                )}
                
                {/* Employer-specific navigation */}
                {profile.role === "employer" && (
                  <>
                    <Link to="/employer/jobs" className="text-gray-400 hover:text-white">
                      Manage Jobs
                    </Link>
                  </>
                )}
                
                {/* Admin-specific navigation */}
                {profile.role === "admin" && (
                  <>
                    <Link to="/admin/dashboard" className="text-gray-400 hover:text-white">
                      Dashboard
                    </Link>
                    <Link to="/admin/users" className="text-gray-400 hover:text-white">
                      Users
                    </Link>         
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {profile?.role && (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-600 text-white font-medium">
                    {profile.role}
                  </span>
                )}
                
                <div className="relative">
                  <button 
                    onClick={this.toggleDropdown}
                    className="h-8 w-8 rounded-full bg-gray-700 cursor-pointer flex items-center justify-center overflow-hidden"
                  >
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt="Avatar" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-white">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
                      </span>
                    )}
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <Link 
                        to={profile?.role === "employer" ? "/employer/dashboard" : "/profile"} 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={this.toggleDropdown}
                      >
                        {profile?.role === "employer" ? "Company Profile" : "My Resume"}
                      </Link>
                      <button 
                        onClick={() => {
                          if (signOut) signOut();
                          this.toggleDropdown();
                        }} 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="ghost" className="text-white">Log In</Button>
                </Link>
                <Link to="/auth/register">
                  <Button className="bg-white text-black hover:bg-gray-200">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    );
  }
} 