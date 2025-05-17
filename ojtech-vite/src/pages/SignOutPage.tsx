import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../providers/AuthProvider';

interface SignOutPageState {
  isSignedOut: boolean;
  error: string | null;
}

export class SignOutPage extends Component<{}, SignOutPageState> {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  constructor(props: {}) {
    super(props);
    this.state = {
      isSignedOut: false,
      error: null
    };
  }

  async componentDidMount() {
    try {
      // Access the auth context and signOut method
      if (this.context && this.context.signOut) {
        await this.context.signOut();
        this.setState({ isSignedOut: true });
      } else {
        this.setState({ error: 'Authentication context not available' });
      }
    } catch (error) {
      console.error('Sign out error:', error);
      this.setState({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred while signing out'
      });
    }
  }

  render() {
    const { isSignedOut, error } = this.state;

    if (isSignedOut) {
      return <Navigate to="/" replace />;
    }

    if (error) {
      return (
        <div className="min-h-[calc(100vh-theme(spacing.16))] flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-xl font-bold text-red-600 mb-4">
              Error Signing Out
            </h1>
            <p className="mb-4 text-gray-700">
              {error}
            </p>
            <button
              onClick={() => this.setState({ isSignedOut: true })}
              className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded transition-colors"
            >
              Go to Home Page
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[calc(100vh-theme(spacing.16))] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <div className="animate-spin w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-700">Signing out...</p>
        </div>
      </div>
    );
  }
} 