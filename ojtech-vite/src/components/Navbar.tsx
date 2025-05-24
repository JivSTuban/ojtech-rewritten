import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
import { AuthContext } from '../providers/AuthProvider';
import { useTheme } from 'next-themes';

interface NavbarState {
  isDropdownOpen: boolean;
}

// Class component for Navbar logic
class NavbarClass extends Component<{ setTheme: (theme: string) => void; theme?: string }, NavbarState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  constructor(props: { setTheme: (theme: string) => void; theme?: string }) {
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

  render() {
    const { user, isLoading, logout } = this.context || {};
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
            
            {user && user.roles && (
              <div className="flex space-x-6">
                {/* Student-specific navigation */}
                {user.roles.includes('ROLE_STUDENT') && (
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
                {user.roles.includes('ROLE_EMPLOYER') && (
                  <>
                    <Link to="/employer/jobs" className="text-gray-400 hover:text-white">
                      Manage Jobs
                    </Link>
                  </>
                )}
                
                {/* Admin-specific navigation */}
                {user.roles.includes('ROLE_ADMIN') && (
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
                {user.roles && user.roles.length > 0 && (
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-white font-medium">
                    {user.roles.includes('ROLE_ADMIN') 
                      ? 'Admin' 
                      : user.roles.includes('ROLE_EMPLOYER') 
                        ? 'Employer' 
                        : 'Student'}
                  </span>
                )}
                
                <div className="relative">
                  <button 
                    onClick={this.toggleDropdown}
                    className="h-8 w-8 rounded-full bg-gray-700 cursor-pointer flex items-center justify-center overflow-hidden"
                  >
                    {user.profile?.avatar_url ? (
                      <img 
                        src={user.profile.avatar_url} 
                        alt="Avatar" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-white">
                        {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    )}
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={this.toggleDropdown}
                      >
                        {user.roles?.includes('ROLE_EMPLOYER') ? "Company Profile" : "My Profile"}
                      </Link>
                      
                      {/* Resume Management link for students only */}
                      {user.roles?.includes('ROLE_STUDENT') && (
                        <Link 
                          to="/resume" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={this.toggleDropdown}
                        >
                          Manage Resume
                        </Link>
                      )}
                      
                      <button 
                        onClick={() => {
                          if (logout) logout();
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
                <Link to="/login">
                  <Button variant="ghost" className="text-white">Log In</Button>
                </Link>
                <Link to="/register">
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

// Wrapper component to provide theme context
export const Navbar: React.FC = () => {
  const { setTheme, theme } = useTheme();
  return <NavbarClass setTheme={setTheme} theme={theme} />;
}; 