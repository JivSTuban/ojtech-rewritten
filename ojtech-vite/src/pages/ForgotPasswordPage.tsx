import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { AuthLayout } from '../components/layouts/AuthLayout';
import authService from '../lib/api/authService';
import { toast } from '../components/ui/toast-utils';

interface ForgotPasswordPageState {
    email: string;
    isLoading: boolean;
    error: string | null;
    success: boolean;
}

export class ForgotPasswordPage extends Component<{}, ForgotPasswordPageState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            email: '',
            isLoading: false,
            error: null,
            success: false
        };
    }

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            email: e.target.value,
            error: null
        });
    };

    handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { email } = this.state;

        if (!email) {
            this.setState({ error: 'Please enter your email address' });
            return;
        }

        this.setState({ isLoading: true, error: null });

        try {
            await authService.forgotPassword(email);

            toast.success({
                title: 'Email Sent',
                description: 'If an account exists with this email, you will receive password reset instructions.'
            });

            this.setState({
                success: true,
                isLoading: false
            });
        } catch (error: any) {
            console.error('Forgot password error:', error);

            const errorMessage = error.response?.data?.message ||
                'An error occurred. Please try again later.';

            toast.destructive({
                title: 'Error',
                description: errorMessage
            });

            this.setState({
                error: errorMessage,
                isLoading: false
            });
        }
    };

    render() {
        const { email, isLoading, error, success } = this.state;

        return (
            <AuthLayout>
                <Card className="w-full p-6 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="flex justify-center mb-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <Mail className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold">Forgot Password?</h1>
                        <p className="text-muted-foreground text-sm">
                            Enter your email address and we'll send you a link to reset your password
                        </p>
                    </div>

                    {success ? (
                        <div className="space-y-4">
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 p-4 rounded-md">
                                <p className="font-medium">Check your email</p>
                                <p className="text-sm mt-1">
                                    If an account exists with <strong>{email}</strong>, you will receive password reset instructions shortly.
                                </p>
                            </div>

                            <div className="text-sm text-muted-foreground space-y-2">
                                <p>Didn't receive the email?</p>
                                <ul className="list-disc list-inside ml-2 space-y-1">
                                    <li>Check your spam or junk folder</li>
                                    <li>Make sure you entered the correct email address</li>
                                    <li>Wait a few minutes and try again</li>
                                </ul>
                            </div>

                            <Link to="/login">
                                <Button variant="outline" className="w-full">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={this.handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={this.handleInputChange}
                                    required
                                    className="mt-1"
                                    placeholder="Enter your email address"
                                    disabled={isLoading}
                                    autoFocus
                                />
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
                                        Sending...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </Button>

                            <Link to="/login">
                                <Button variant="ghost" className="w-full" type="button">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Login
                                </Button>
                            </Link>
                        </form>
                    )}
                </Card>
            </AuthLayout>
        );
    }
}
