import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { AuthContext } from '../providers/AuthProvider';

export class HomePage extends Component {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  render() {
    const { user, profile } = this.context;

    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">
            Welcome to OJTech
          </h1>
          
          <p className="text-xl mb-8 text-gray-600">
            Connect students with the right internship opportunities through AI-powered matching.
          </p>
          
          {user ? (
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-lg">
                <h2 className="text-2xl font-semibold mb-2">
                  Welcome back, {profile?.full_name || user.email}!
                </h2>
                <p className="mb-4">
                  Continue exploring internship opportunities or track your applications.
                </p>
                
                {profile?.role === 'student' && (
                  <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
                    <Link to="/opportunities">
                      <Button size="lg">
                        Browse Opportunities
                      </Button>
                    </Link>
                    <Link to="/track">
                      <Button size="lg" variant="outline">
                        Track Applications
                      </Button>
                    </Link>
                  </div>
                )}
                
                {profile?.role === 'employer' && (
                  <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
                    <Link to="/employer/jobs">
                      <Button size="lg">
                        Manage Jobs
                      </Button>
                    </Link>
                    <Link to="/employer/dashboard">
                      <Button size="lg" variant="outline">
                        Company Profile
                      </Button>
                    </Link>
                  </div>
                )}
                
                {profile?.role === 'admin' && (
                  <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
                    <Link to="/admin/dashboard">
                      <Button size="lg">
                        Admin Dashboard
                      </Button>
                    </Link>
                    <Link to="/admin/users">
                      <Button size="lg" variant="outline">
                        Manage Users
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
              <Link to="/auth/login">
                <Button size="lg">
                  Log In
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button size="lg" variant="outline">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">For Students</h3>
            <p className="text-gray-600 mb-4">
              Create your profile, upload your CV, and get matched with internship opportunities based on your skills.
            </p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">For Employers</h3>
            <p className="text-gray-600 mb-4">
              Post internship opportunities and get matched with qualified candidates based on their skills and experience.
            </p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">AI-Powered Matching</h3>
            <p className="text-gray-600 mb-4">
              Our advanced algorithms analyze student skills and employer requirements to create optimal matches.
            </p>
          </div>
        </div>
      </div>
    );
  }
} 