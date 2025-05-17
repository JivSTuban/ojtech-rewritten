import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './providers/AuthProvider';
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

// Layout component with navigation
class AppLayout extends Component<{ children: React.ReactNode }> {
  static contextType = AuthContext;
  
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

// App component
export class App extends Component {
  render() {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ToastProvider>
          <AuthProvider>
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
