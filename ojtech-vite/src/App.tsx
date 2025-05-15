import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { ToastProvider } from './providers/ToastContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { HomePage } from './pages/HomePage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { JobDetailPageWrapper } from './pages/JobDetailPage';
import { Toaster } from './components/ui/Toaster';
import './index.css';

// Define environment variables or fetch from .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if environment variables are set
const isMissingCredentials = !supabaseUrl || !supabaseAnonKey;

// Layout component with navigation
class AppLayout extends Component<{ children: React.ReactNode }> {
  static contextType = AuthProvider;
  
  render() {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {this.props.children}
        </main>
      </div>
    );
  }
}

// Environment setup error component
class EnvSetupError extends Component {
  render() {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-red-50">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-xl font-bold text-red-600 mb-4">
            Missing Environment Variables
          </h1>
          <p className="mb-4">
            Supabase credentials are not configured. Please set up your environment variables.
          </p>
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="font-mono text-sm mb-2">1. Create a <code>.env</code> file in the project root directory</p>
            <p className="font-mono text-sm mb-2">2. Add the following variables:</p>
            <pre className="bg-gray-800 text-white p-2 rounded text-xs overflow-x-auto">
              VITE_SUPABASE_URL=https://your-project.supabase.co
              VITE_SUPABASE_ANON_KEY=your-anon-key
            </pre>
          </div>
          <p className="mt-4 text-sm">
            See <a href="#" className="text-blue-600 underline">ENV_SETUP.md</a> for detailed instructions.
          </p>
        </div>
      </div>
    );
  }
}

// App component
export class App extends Component {
  render() {
    // Show setup instructions if credentials are missing
    if (isMissingCredentials) {
      return <EnvSetupError />;
    }
    
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ToastProvider>
          <AuthProvider supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey}>
            <Router>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/auth/login" element={<LoginPage />} />
                  <Route path="/auth/register" element={<RegisterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/opportunities" element={<OpportunitiesPage />} />
                  <Route path="/opportunities/:id" element={<JobDetailPageWrapper />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppLayout>
            </Router>
            <Toaster />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    );
  }
}
