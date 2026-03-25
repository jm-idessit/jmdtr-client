"use client"
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Building2, CheckCircle, Shield } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Card, CardContent } from '../../components/ui/card';
import { getBaseURL } from '../../../utils/api';

export default function EmployeeLogin() {
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });    

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const res = await fetch(`${getBaseURL()}/employees/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                email: formData.email,
                password: formData.password,
            }),
        });

        const data = await res.json();
        console.log(data)
        if (res.ok) {
            window.location.href = "/employee/emp01Home";
        } else {
            alert(data.message);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    <Card className="border-2">
                        <CardContent className="p-6 md:p-8">
                            {/* Logo */}
                            <div className="flex justify-center items-center gap-2 mb-6">
                                <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-emerald-600 rounded-lg flex items-center justify-center">
                                    <Building2 className="text-white h-6 w-6" />
                                </div>
                                <span className="text-2xl font-semibold">DTR System</span>
                            </div>

                            {/* Header */}
                            <div className="flex justify-center items-center text-center">
                                <div className="mb-8">
                                    <h1 className="text-3xl font-bold mb-2">Employee Sign In</h1>
                                    <p className="text-gray-600">Welcome back! Please enter your credentials</p>
                                </div>
                            </div>

                            {/* Login Form */}
                            <form className="space-y-5" onSubmit={handleLogin}>
                                {/* Email Address - Required */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-1">
                                        Email Address <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="employee@company.com"
                                            className="pl-10"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Password - Required */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="flex items-center gap-1">
                                        Password <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter your password"
                                            className="pl-10 pr-10"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember Me & Forgot Password */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="remember"
                                            checked={rememberMe}
                                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                        />
                                        <label
                                            htmlFor="remember"
                                            className="text-sm text-gray-600 cursor-pointer"
                                        >
                                            Remember me
                                        </label>
                                    </div>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full bg-linear-to-r from-emerald-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    size="lg"
                                >
                                    Sign In
                                </Button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">Or sign in with</span>
                                </div>
                            </div>

                            {/* Social Login Buttons */}
                            <div className="space-y-3">
                                <Button variant="outline" className="w-full" size="lg">
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Continue with Google
                                </Button>
                                <Button variant="outline" className="w-full" size="lg">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                    Continue with GitHub
                                </Button>
                            </div>

                            {/* Sign Up Link */}
                            <div className="mt-6 text-center">
                                <p className="text-gray-600">
                                    Don&apos;t have an employee account?{' '}
                                    <Link href="/auth/employeeSignup" className="text-blue-600 hover:text-blue-700 font-semibold">
                                        Sign Up
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Notice */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                        <Shield className="h-4 w-4" />
                        <span>Secure login with 256-bit encryption</span>
                    </div>
                </div>
            </div>

            {/* Right side - Image/Gradient */}
            <div className="hidden lg:flex flex-1 bg-linear-to-br from-emerald-600 via-purple-600 to-blue-700 items-center justify-center p-8">
                <div className="max-w-md text-white">
                    <div className="mb-8">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                            <Building2 className="h-10 w-10" />
                        </div>
                        <h2 className="text-4xl font-bold mb-4">Manage Your DTR and Pay Slips</h2>
                        <p className="text-lg opacity-90 mb-8">
                            Access your employee dashboard to track attendance, approve leave requests, and generate comprehensive reports.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center shrink-0 mt-1">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Real-time Monitoring</h3>
                                <p className="text-sm opacity-80">Track employee attendance and working hours in real-time</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center shrink-0 mt-1">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Detailed Analytics</h3>
                                <p className="text-sm opacity-80">Generate comprehensive reports with just a few clicks</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center shrink-0 mt-1">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Easy Management</h3>
                                <p className="text-sm opacity-80">Approve requests and manage schedules effortlessly</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-12 grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-1">500+</div>
                            <div className="text-sm opacity-80">Companies</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-1">10K+</div>
                            <div className="text-sm opacity-80">Employees</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-1">99.9%</div>
                            <div className="text-sm opacity-80">Uptime</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
