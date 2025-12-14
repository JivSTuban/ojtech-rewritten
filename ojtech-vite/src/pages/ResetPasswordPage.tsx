import React, { Component } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Loader2, Eye, EyeOff, Check, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { AuthLayout } from '../components/layouts/AuthLayout';
import authService from '../lib/api/authService';
import { toast } from '../components/ui/toast-utils';

interface ResetPasswordPageProps {
    token?: string;
}

interface ResetPasswordPageState {
    newPassword: string;
    confirmPassword: string;
    isLoading: boolean;
    error: string | null;
    success: boolean;
    showNewPassword: boolean;
    showConfirmPassword: boolean;
    passwordStrength: {
        hasMinLength: boolean;
        hasUpperCase: boolean;
        hasLowerCase: boolean;
        hasNumber: boolean;
    };
}

class ResetPasswordPageComponent extends Component<ResetPasswordPageProps, ResetPasswordPageState> {
    constructor(props: ResetPasswordPageProps) {
        super(props);
        this.state = {
            newPassword: '',
            confirmPassword: '',
            isLoading: false,
            error: null,
            success: false,
            showNewPassword: false,
            showConfirmPassword: false,
            passwordStrength: {
                hasMinLength: false,
                hasUpperCase: false,
                hasLowerCase: false,
                hasNumber: false
            }
        };
    }

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        this.setState({
            ...this.state,
            [name]: value,
            error: null
        } as Pick<ResetPasswordPageState, keyof ResetPasswordPageState>);

        // Update password strength indicators when typing new password
        if (name === 'newPassword') {
            this.setState({
                passwordStrength: {
                    hasMinLength: value.length >= 6,
                    hasUpperCase: /[A-Z]/.test(value),
                    hasLowerCase: /[a-z]/.test(value),
                    hasNumber: /[0-9]/.test(value)
                }
            });
        }
    };

    toggleNewPasswordVisibility = () => {
        this.setState(prevState => ({ showNewPassword: !prevState.showNewPassword }));
    };

    toggleConfirmPasswordVisibility = () => {
        this.setState(prevState => ({ showConfirmPassword: !prevState.showConfirmPassword }));
    };

    handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { newPassword, confirmPassword } = this.state;
        const { token } = this.props;

        if (!token) {
            this.setState({ error: 'Invalid reset link' });
            return;
        }

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            this.setState({ error: 'Passwords do not match' });
            toast.destructive({
                title: 'Password Mismatch',
                description: 'The passwords you entered do not match.'
            });
            return;
        }

        // Validate password strength
        if (newPassword.length < 6) {
            this.setState({ error: 'Password must be at least 6 characters long' });
            toast.destructive({
                title: 'Weak Password',
                description: 'Your password must be at least 6 characters long.'
            });
            return;
        }

        this.setState({ isLoading: true, error: null });

        try {
            await authService.resetPassword(token, newPassword, confirmPassword);

            toast.success({
                title: 'Password Reset Successfully',
                description: 'Your password has been reset. You can now log in with your new password.'
            });

            this.setState({
                success: true,
                isLoading: false
            });
        } catch (error: any) {
            console.error('Reset password error:', error);

            const errorMessage = error.response?.data?.message ||
                'Failed to reset password. Please try again.';

            toast.destructive({
                title: 'Reset Failed',
                description: errorMessage
            });

            this.setState({
                error: errorMessage,
                isLoading: false
            });
        }
    };

    render() {
        const {
            newPassword,
            confirmPassword,
            isLoading,
            error,
            success,
            showNewPassword,
            showConfirmPassword,
            passwordStrength
        } = this.state;

        const { token } = this.props;

        if (!token) {
            return <Navigate to="/forgot-password" replace />;
        }

        if (success) {
            return <Navigate to="/login" replace />;
        }

        return (
            <AuthLayout>
                <Card className="w-full p-6 space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold">Reset Your Password</h1>
                        <p className="text-muted-foreground text-sm">
                            Enter your new password below
                        </p>
                    </div>

                    <form onSubmit={this.handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={this.handleInputChange}
                                    required
                                    className="mt-1 pr-10"
                                    placeholder="Enter new password"
                                    disabled={isLoading}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={this.toggleNewPasswordVisibility}
                                    className="absolute right-3 top-[calc(50%+2px)] transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            {/* Password strength indicators */}
                            {newPassword && (
                                <div className="mt-2 space-y-1 text-xs">
                                    <div className="flex items-center gap-2">
                                        {passwordStrength.hasMinLength ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                        ) : (
                                            <X className="h-3 w-3 text-gray-400" />
                                        )}
                                        <span className={passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-500'}>
                                            At least 6 characters
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {passwordStrength.hasUpperCase ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                        ) : (
                                            <X className="h-3 w-3 text-gray-400" />
                                        )}
                                        <span className={passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-500'}>
                                            Contains uppercase letter
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {passwordStrength.hasLowerCase ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                        ) : (
                                            <X className="h-3 w-3 text-gray-400" />
                                        )}
                                        <span className={passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-500'}>
                                            Contains lowercase letter
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {passwordStrength.hasNumber ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                        ) : (
                                            <X className="h-3 w-3 text-gray-400" />
                                        )}
                                        <span className={passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}>
                                            Contains number
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={this.handleInputChange}
                                    required
                                    className="mt-1 pr-10"
                                    placeholder="Confirm new password"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={this.toggleConfirmPasswordVisibility}
                                    className="absolute right-3 top-[calc(50%+2px)] transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Resetting Password...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            Remember your password?{' '}
                            <Link to="/login" className="font-medium text-primary hover:underline">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </Card>
            </AuthLayout>
        );
    }
}

// Wrapper component to use React Router hooks
export const ResetPasswordPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    return <ResetPasswordPageComponent token={token} />;
};
