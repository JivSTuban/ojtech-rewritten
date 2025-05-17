import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../providers/AuthProvider';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

interface VerifyEmailPageState {
  isVerifying: boolean;
  isVerified: boolean;
  error: string | null;
  email: string;
}

export class VerifyEmailPage extends Component<{}, VerifyEmailPageState> {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  constructor(props: {}) {
    super(props);
    this.state = {
      isVerifying: true,
      isVerified: false,
      error: null,
      email: ''
    };
  }

  async componentDidMount() {
    // Get the token from the URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const type = params.get('type');
    
    if (!token || type !== 'email_verification') {
      this.setState({
        isVerifying: false,
        error: 'Invalid verification link. Please check your email for the correct link.'
      });
      return;
    }

    try {
      // Verify the email with Supabase
      if (this.context && this.context.verifyEmail) {
        const { error, email } = await this.context.verifyEmail(token);
        
        if (error) {
          this.setState({
            isVerifying: false,
            error: error.message || 'An error occurred during verification.'
          });
        } else {
          this.setState({
            isVerifying: false,
            isVerified: true,
            email: email || 'your email'
          });
        }
      } else {
        this.setState({
          isVerifying: false,
          error: 'Authentication context not available'
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      this.setState({
        isVerifying: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred during verification'
      });
    }
  }

  render() {
    const { isVerifying, isVerified, error, email } = this.state;

    if (isVerifying) {
      return (
        <div className="min-h-[calc(100vh-theme(spacing.16))] flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h1 className="text-xl font-bold mb-2">Verifying your email</h1>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </div>
          </Card>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-[calc(100vh-theme(spacing.16))] flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <div className="text-center">
              <div className="rounded-full bg-red-100 p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-red-600 mb-2">Verification Failed</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => window.location.href = '/auth/login'}>
                  Go to Login
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                >
                  Go to Home
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    if (isVerified) {
      return (
        <div className="min-h-[calc(100vh-theme(spacing.16))] flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <div className="text-center">
              <div className="rounded-full bg-green-100 p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-green-600 mb-2">Email Verified!</h1>
              <p className="text-gray-600 mb-4">
                {email} has been successfully verified. You can now log in to your account.
              </p>
              <Button onClick={() => window.location.href = '/auth/login'}>
                Go to Login
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    // Default fallback - shouldn't reach here
    return <Navigate to="/" replace />;
  }
} 