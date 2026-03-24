"use client"
import { Clock, Calendar, CheckCircle, AlertCircle, Download, Filter, ChevronRight, Coffee, User, Bell, Settings, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useState, useEffect } from 'react';

export default function EmployeeDTRPage() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [isOnBreak, setIsOnBreak] = useState(false);

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const todayRecord = {
        date: 'March 23, 2026',
        timeIn: isCheckedIn ? '8:30 AM' : '--:--',
        timeOut: '--:--',
        status: isCheckedIn ? 'checked-in' : 'not-started',
        hoursWorked: isCheckedIn ? '4.5' : '0',
        breakDuration: '0:45',
    };

    const notifications = [
        { id: 1, type: 'warning', message: 'You forgot to clock out yesterday', time: '2 hours ago', read: false },
        { id: 2, type: 'info', message: 'Your leave request has been approved', time: '5 hours ago', read: false },
        { id: 3, type: 'reminder', message: 'Don\'t forget to submit your timesheet', time: '1 day ago', read: true },
    ];

    const weekSummary = {
        totalHours: 38.5,
        requiredHours: 40,
        daysPresent: 4,
        daysAbsent: 0,
        daysLate: 1,
    };

    const recentAttendance = [
        { date: 'Mar 22, 2026', day: 'Friday', timeIn: '8:25 AM', timeOut: '5:35 PM', breakDuration: '0:45', hours: '9.17', status: 'present' },
        { date: 'Mar 21, 2026', day: 'Thursday', timeIn: '8:45 AM', timeOut: '5:30 PM', breakDuration: '0:30', hours: '8.75', status: 'late' },
        { date: 'Mar 20, 2026', day: 'Wednesday', timeIn: '8:20 AM', timeOut: '5:25 PM', breakDuration: '0:45', hours: '9.08', status: 'present' },
        { date: 'Mar 19, 2026', day: 'Tuesday', timeIn: '8:30 AM', timeOut: '5:30 PM', breakDuration: '0:45', hours: '9.00', status: 'present' },
        { date: 'Mar 18, 2026', day: 'Monday', timeIn: '8:28 AM', timeOut: '5:32 PM', breakDuration: '0:45', hours: '9.07', status: 'present' },
    ];

    const upcomingLeaves = [
        { type: 'Vacation Leave', dates: 'Apr 5-7, 2026', days: 3, status: 'approved' },
        { type: 'Sick Leave', dates: 'Mar 28, 2026', days: 1, status: 'pending' },
    ];

    const handleCheckIn = () => {
        setIsCheckedIn(true);
    };

    const handleCheckOut = () => {
        setIsCheckedIn(false);
    };

    const handleBreakStart = () => {
        setIsOnBreak(true);

    };

    const handleBreakEnd = () => {
        setIsOnBreak(false);

    };

    return (
        <div className="min-h-screen mx-auto p-4 md:p-6 lg:p-8">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Daily Time Record</h1>
                        <p className="text-gray-600 mt-1">Track your attendance and working hours</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Button variant="outline" size="icon" className="relative">
                                <Bell className="h-4 w-4" />
                                {notifications.filter(n => !n.read).length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {notifications.filter(n => !n.read).length}
                                    </span>
                                )}
                            </Button>
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Filter
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Time In/Out Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Clock In/Out Card */}
                    <Card className="lg:col-span-2 bg-linear-to-br from-emerald-600 to-purple-600 text-white border-0">
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        <span className="text-sm opacity-90">{todayRecord.date}</span>
                                    </div>
                                    <div>
                                        <div className="text-6xl font-bold font-mono">
                                            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </div>
                                        <div className="text-sm opacity-90 mt-2">
                                            {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 pt-4">
                                        <div>
                                            <div className="text-sm opacity-90">Time In</div>
                                            <div className="text-2xl font-semibold">{todayRecord.timeIn}</div>
                                        </div>
                                        <div className="h-12 w-px bg-white/30"></div>
                                        <div>
                                            <div className="text-sm opacity-90">Time Out</div>
                                            <div className="text-2xl font-semibold">{todayRecord.timeOut}</div>
                                        </div>
                                        <div className="h-12 w-px bg-white/30"></div>
                                        <div>
                                            <div className="text-sm opacity-90">Break</div>
                                            <div className="text-2xl font-semibold">{todayRecord.breakDuration}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {!isCheckedIn ? (
                                        <>
                                            <Button
                                                size="lg"
                                                variant="secondary"
                                                className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8 py-6 text-lg gap-2"
                                                onClick={handleCheckIn}
                                            >
                                                <Clock className="h-5 w-5" />
                                                Clock In
                                            </Button>
                                            <div className="text-center text-sm opacity-90">
                                                Click to start your shift
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                size="lg"
                                                variant="secondary"
                                                className="bg-white text-red-600 hover:bg-gray-100 font-semibold px-8 py-6 text-lg gap-2"
                                                onClick={handleCheckOut}
                                            >
                                                <Clock className="h-5 w-5" />
                                                Clock Out
                                            </Button>
                                            {!isOnBreak ? (
                                                <Button
                                                    size="lg"
                                                    variant="outline"
                                                    className="bg-white/10 border-white text-white hover:bg-white/20 font-semibold px-8 py-3 gap-2"
                                                    onClick={handleBreakStart}
                                                >
                                                    <Coffee className="h-4 w-4" />
                                                    Start Break
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="lg"
                                                    variant="outline"
                                                    className="bg-yellow-500 border-yellow-600 text-white hover:bg-yellow-600 font-semibold px-8 py-3 gap-2 animate-pulse"
                                                    onClick={handleBreakEnd}
                                                >
                                                    <Coffee className="h-4 w-4" />
                                                    End Break
                                                </Button>
                                            )}
                                            <div className="text-center text-sm opacity-90">
                                                Hours Today: {todayRecord.hoursWorked}h
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">This Week</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600">Hours Worked</span>
                                    <span className="font-semibold">{weekSummary.totalHours} / {weekSummary.requiredHours} hrs</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${(weekSummary.totalHours / weekSummary.requiredHours) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{weekSummary.daysPresent}</div>
                                        <div className="text-xs text-gray-600">Present</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{weekSummary.daysLate}</div>
                                        <div className="text-xs text-gray-600">Late</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Summary - March 2026</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-3xl font-bold text-blue-600">156.5</div>
                                <div className="text-sm text-gray-600 mt-1">Total Hours</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-3xl font-bold text-green-600">18</div>
                                <div className="text-sm text-gray-600 mt-1">Days Present</div>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <div className="text-3xl font-bold text-yellow-600">3</div>
                                <div className="text-sm text-gray-600 mt-1">Times Late</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-3xl font-bold text-purple-600">8.5</div>
                                <div className="text-sm text-gray-600 mt-1">Avg Hours/Day</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Attendance History and Leaves */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Attendance History */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Attendance</CardTitle>
                            <Button variant="ghost" size="sm" className="gap-1">
                                View All
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Date</th>
                                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Day</th>
                                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Time In</th>
                                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Time Out</th>
                                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Break</th>
                                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Hours</th>
                                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentAttendance.map((record, index) => (
                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-2 text-sm">{record.date}</td>
                                                <td className="py-3 px-2 text-sm text-gray-600">{record.day}</td>
                                                <td className="py-3 px-2 text-sm font-mono">{record.timeIn}</td>
                                                <td className="py-3 px-2 text-sm font-mono">{record.timeOut}</td>
                                                <td className="py-3 px-2 text-sm font-mono">{record.breakDuration}</td>
                                                <td className="py-3 px-2 text-sm font-semibold">{record.hours}h</td>
                                                <td className="py-3 px-2">
                                                    {record.status === 'present' ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Present
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                                            <AlertCircle className="h-3 w-3" />
                                                            Late
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Leaves */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Leave Requests</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {upcomingLeaves.map((leave, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="font-semibold text-sm">{leave.type}</div>
                                            <div className="text-xs text-gray-600 mt-1">{leave.dates}</div>
                                            <div className="text-xs text-gray-500 mt-1">{leave.days} day{leave.days > 1 ? 's' : ''}</div>
                                        </div>
                                        {leave.status === 'approved' ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                Approved
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                                Pending
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full mt-4">
                                Request Leave
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Employee Profile Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>My Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-6">
                                <div className="w-24 h-24 bg-linear-to-br from-emerald-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shrink-0">
                                    JD
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-gray-600">Full Name</label>
                                            <p className="font-semibold">John Doe</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Employee ID</label>
                                            <p className="font-semibold">EMP-2024-001</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Department</label>
                                            <p className="font-semibold">Engineering</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Position</label>
                                            <p className="font-semibold">Senior Developer</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Email</label>
                                            <p className="font-semibold">john.doe@company.com</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Work Schedule</label>
                                            <p className="font-semibold">8:00 AM - 5:00 PM</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <Button variant="outline" className="gap-2">
                                            <User className="h-4 w-4" />
                                            Edit Profile
                                        </Button>
                                        <Button variant="outline" className="gap-2">
                                            <Settings className="h-4 w-4" />
                                            Settings
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <FileText className="h-4 w-4" />
                                View Payslip
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Calendar className="h-4 w-4" />
                                Request Leave
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Download className="h-4 w-4" />
                                Download DTR Report
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Clock className="h-4 w-4" />
                                View Schedule
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

