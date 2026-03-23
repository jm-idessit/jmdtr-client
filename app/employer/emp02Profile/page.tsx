"use client";

import { useState } from 'react';
import { Camera, Mail, Phone, MapPin, Calendar, Briefcase } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '../../components/ui/sheet';

export default function Profile() {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [profile, setProfile] = useState({
        name: 'Employer Doe',
        role: 'Senior Product Designer',
        email: 'employer@example.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        joined: 'March 2024',
        bio: 'Passionate product designer with over 8 years of experience creating user-centered digital products. I specialize in UX/UI design, design systems, and cross-functional collaboration. When I\'m not designing, you can find me exploring new coffee shops or hiking in the mountains.',
    });

    const [formData, setFormData] = useState({ ...profile });

    const openEditModal = () => {
        setFormData({ ...profile });
        setIsEditModalOpen(true);
    };

    const handleSaveProfile = () => {
        setProfile({ ...formData });
        setIsEditModalOpen(false);
    };

    return (
        <div className="min-h-screen mx-auto p-4 md:p-6 lg:p-8">
            <div className="space-y-6">
                {/* Profile Header */}
                <div className="bg-white rounded-lg border shadow-sm mb-6">
                    <div className="h-32 bg-linear-to-r from-emerald-600 to-purple-600 rounded-t-lg"></div>
                    <div className="px-6 pb-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
                            <div className="relative">
                                <div className="w-32 h-32 bg-gray-200 rounded-full border-4 border-white flex items-center justify-center text-4xl font-semibold text-gray-600">
                                    JD
                                </div>
                                <button className="absolute bottom-0 right-0 w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white border-4 border-white hover:bg-emerald-700 transition-colors">
                                    <Camera className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold">{profile.name}</h1>
                                <p className="text-gray-600">{profile.role}</p>
                            </div>
                            <Button onClick={openEditModal}>Edit Profile</Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="h-4 w-4" />
                                <span className="text-sm">{profile.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span className="text-sm">{profile.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span className="text-sm">{profile.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm">Joined {profile.joined}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Tabs */}
                <Tabs defaultValue="about" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="about">About</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                    </TabsList>

                    {/* About Tab */}
                    <TabsContent value="about" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>About Me</CardTitle>
                                <CardDescription>Tell others about yourself</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    {profile.bio}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Work Experience</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    {
                                        title: 'Senior Product Designer',
                                        company: 'Tech Corp',
                                        period: '2022 - Present',
                                        description: 'Leading design initiatives for enterprise SaaS products',
                                    },
                                    {
                                        title: 'Product Designer',
                                        company: 'Design Studio',
                                        period: '2019 - 2022',
                                        description: 'Designed mobile and web applications for various clients',
                                    },
                                    {
                                        title: 'UX Designer',
                                        company: 'Startup Inc',
                                        period: '2017 - 2019',
                                        description: 'Worked on early-stage product development and user research',
                                    },
                                ].map((job, index) => (
                                    <div key={index} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                            <Briefcase className="h-6 w-6 text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{job.title}</h4>
                                            <p className="text-sm text-gray-600">{job.company}</p>
                                            <p className="text-sm text-gray-500">{job.period}</p>
                                            <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Skills</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {['UX Design', 'UI Design', 'Figma', 'Sketch', 'Prototyping', 'User Research',
                                        'Design Systems', 'HTML/CSS', 'React', 'Accessibility'].map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Update your personal details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input id="firstName" defaultValue="John" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input id="lastName" defaultValue="Doe" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" defaultValue="john@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        rows={4}
                                        defaultValue="Passionate product designer with over 8 years of experience..."
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button>Save Changes</Button>
                                    <Button variant="outline">Cancel</Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>Update your password to keep your account secure</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input id="currentPassword" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input id="newPassword" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input id="confirmPassword" type="password" />
                                </div>
                                <Button>Update Password</Button>
                            </CardContent>
                        </Card>

                        <Card className="border-red-200">
                            <CardHeader>
                                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                                <CardDescription>Irreversible actions for your account</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button variant="destructive">Delete Account</Button>
                                <p className="text-sm text-gray-600">
                                    Once you delete your account, there is no going back. Please be certain.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Activity Tab */}
                    <TabsContent value="activity" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Your recent actions and updates</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { action: 'Updated profile picture', time: '2 hours ago' },
                                        { action: 'Changed email address', time: '1 day ago' },
                                        { action: 'Logged in from new device', time: '3 days ago' },
                                        { action: 'Updated password', time: '1 week ago' },
                                        { action: 'Changed phone number', time: '2 weeks ago' },
                                    ].map((activity, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center py-3 border-b last:border-0"
                                        >
                                            <span className="text-gray-700">{activity.action}</span>
                                            <span className="text-sm text-gray-500">{activity.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <Sheet open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <SheetContent side="right">
                    <SheetHeader>
                        <SheetTitle>Edit Profile</SheetTitle>
                        <SheetDescription>Modify profile information and save your changes.</SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 p-4">
                        <div className="space-y-2">
                            <Label htmlFor="profileName">Name</Label>
                            <Input
                                id="profileName"
                                value={formData.name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profileRole">Role</Label>
                            <Input
                                id="profileRole"
                                value={formData.role}
                                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profileEmail">Email</Label>
                            <Input
                                id="profileEmail"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profilePhone">Phone</Label>
                            <Input
                                id="profilePhone"
                                value={formData.phone}
                                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profileLocation">Location</Label>
                            <Input
                                id="profileLocation"
                                value={formData.location}
                                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profileBio">Bio</Label>
                            <Textarea
                                id="profileBio"
                                rows={4}
                                value={formData.bio}
                                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                            />
                        </div>
                    </div>
                    <SheetFooter>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setFormData({ ...profile });
                                    setIsEditModalOpen(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSaveProfile}>Save</Button>
                        </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
