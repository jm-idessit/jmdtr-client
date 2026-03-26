"use client"
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User, Building2, Phone, CheckCircle, Briefcase } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Card, CardContent } from '../../components/ui/card';
import { getBaseURL } from '../../../utils/api';

export default function EmployeeSignup() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        department: '',
        position: '',
        phoneNumber: '',
        employerId: '',
        termsAccepted: false,
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Check password match
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            const res = await fetch(`${getBaseURL()}/employees/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    name: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    department: formData.department,
                    position: formData.position,
                    phoneNumber: formData.phoneNumber,
                    employerId: formData.employerId,
                }),
            });

            const data = await res.json();
            console.log(data)
            if (res.ok) {
                const idNote = data.employeeId ? ` Your employee ID is ${data.employeeId}.` : "";
                alert(`${data.message ?? "Employee registered successfully."}${idNote}`);
                window.location.href = "/auth/employeeSignin";
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Image/Gradient */}
            <div className="hidden lg:flex flex-1 bg-linear-to-br from-emerald-600 via-purple-600 to-blue-700 items-center justify-center p-8">
                <div className="max-w-md text-white">
                    <div className="mb-8">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                            <Building2 className="h-10 w-10" />
                        </div>
                        <h2 className="text-4xl font-bold mb-4">Employee Registration</h2>
                        <p className="text-lg opacity-90 mb-8">
                            Join our DTR system and manage your team&apos;s attendance effortlessly.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center shrink-0 mt-1">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Real-time Attendance Tracking</h3>
                                <p className="text-sm opacity-80">Monitor employee check-ins, breaks, and working hours in real-time</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center shrink-0 mt-1">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Comprehensive Reports</h3>
                                <p className="text-sm opacity-80">Generate detailed attendance reports and analytics for your team</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center shrink-0 mt-1">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Leave Management</h3>
                                <p className="text-sm opacity-80">Approve leave requests and manage schedules efficiently</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Signup Form */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-y-auto bg-gray-50">
                <div className="w-full max-w-xl">
                    <Card className="border-2">
                        <CardContent className="p-6 md:p-8">
                            {/* Logo */}
                            <div className="flex justify-center items-center gap-2 mb-6">
                                <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <Building2 className="text-white h-6 w-6" />
                                </div>
                                <span className="text-2xl font-semibold">DTR System</span>
                            </div>

                            {/* Header */}
                            <div className="flex justify-center items-center text-center">
                                <div className="mb-6">
                                    <h1 className="text-3xl font-bold mb-2">Employee Sign Up</h1>
                                    <p className="text-gray-600">
                                        Create your employee account to get started. Your employee ID is assigned automatically when you register.
                                    </p>
                                </div>
                            </div>

                            {/* Signup Form */}
                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-6">
                                    {/* Full Name - Required */}
                                    <div className="space-y-2 md:col-span-1">
                                        <Label htmlFor="fullName" className="flex items-center gap-1 min-h-[1.25rem]">
                                            Full Name <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                            <Input
                                                id="fullName"
                                                type="text"
                                                placeholder="Enter your full name"
                                                className="pl-10 h-11 w-full"
                                                required
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Employer ID - Required */}
                                    <div className="space-y-2 md:col-span-1">
                                        <Label htmlFor="employerId" className="flex items-center gap-1 min-h-[1.25rem]">
                                            Employer ID <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                            <Input
                                                id="employerId"
                                                type="text"
                                                placeholder="Your employer's company ID"
                                                className="pl-10 h-11 w-full"
                                                required
                                                value={formData.employerId}
                                                onChange={(e) => setFormData({ ...formData, employerId: e.target.value })}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">Ask your employer for this value</p>
                                    </div>

                                    {/* Department - Optional */}
                                    <div className="space-y-2 md:col-span-1">
                                        <Label htmlFor="department" className="flex items-center gap-1 min-h-[1.25rem]">
                                            Department <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                                        </Label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                            <Input
                                                id="department"
                                                type="text"
                                                placeholder="e.g. IT"
                                                className="pl-10 h-11 w-full"
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Position - Optional */}
                                    <div className="space-y-2 md:col-span-1">
                                        <Label htmlFor="position" className="flex items-center gap-1 min-h-[1.25rem]">
                                            Position <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                                        </Label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                            <Input
                                                id="position"
                                                type="text"
                                                placeholder="e.g. Software Developer"
                                                className="pl-10 h-11 w-full"
                                                value={formData.position}
                                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Email Address - Required */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-1 min-h-[1.25rem]">
                                        Email Address <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="employee@company.com"
                                            className="pl-10 h-11 w-full"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">This will be used for login and notifications</p>
                                </div>

                                {/* Password - Required */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="flex items-center gap-1 min-h-[1.25rem]">
                                        Password <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Create a strong password"
                                            className="pl-10 pr-10 h-11 w-full"
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
                                    <p className="text-xs text-gray-500">Must be at least 8 characters with letters, numbers & special characters</p>
                                </div>

                                {/* Confirm Password - Required */}
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="flex items-center gap-1 min-h-[1.25rem]">
                                        Confirm Password <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Re-enter your password"
                                            className="pl-10 pr-10 h-11 w-full"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Phone Number - Optional */}
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber" className="flex items-center gap-1 min-h-[1.25rem]">
                                        Phone Number <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                                    </Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                        <Input
                                            id="phoneNumber"
                                            type="tel"
                                            placeholder="+63 900 000-0000"
                                            className="pl-10 h-11 w-full"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">For contact or two-factor authentication</p>
                                </div>

                                {/* Terms & Conditions - Required */}
                                <div className="flex items-start space-x-2 p-4 bg-gray-50 rounded-lg">
                                    <Checkbox
                                        id="terms"
                                        className="mt-1"
                                        checked={formData.termsAccepted}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, termsAccepted: checked as boolean })
                                        }
                                        required
                                    />
                                    <label
                                        htmlFor="terms"
                                        className="text-sm text-gray-700 cursor-pointer"
                                    >
                                        I agree to the{' '}
                                        <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium underline">
                                            Terms of Service
                                        </Link>{' '}
                                        and{' '}
                                        <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium underline">
                                            Privacy Policy
                                        </Link>
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <Button type="submit"
                                    className="w-full bg-linear-to-r from-emerald-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    size="lg">
                                    Create Employee Account
                                </Button>
                            </form>

                            {/* Login Link */}
                            <div className="mt-6 text-center">
                                <p className="text-gray-600">
                                    Already have an account?{' '}
                                    <Link href="/auth/employeeSignin" className="text-blue-600 hover:text-blue-700 font-semibold">
                                        Sign In
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
