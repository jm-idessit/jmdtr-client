"use client"
import { Users, Clock, TrendingUp, Download, Filter, Search, Calendar, CheckCircle, XCircle, AlertCircle, UserCheck, UserX, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useState } from 'react';

export default function EmployerDTRPage() {
    const [] = useState('March 23, 2026');
    const [searchQuery, setSearchQuery] = useState('');

    const overviewStats = {
        totalEmployees: 48,
        presentToday: 42,
        absentToday: 3,
        onLeave: 3,
        lateToday: 5,
        avgWorkHours: 8.4,
    };

    const employeesStatus = [
        {
            id: 1,
            name: 'Sarah Johnson',
            department: 'Engineering',
            position: 'Senior Developer',
            avatar: 'SJ',
            status: 'checked-in',
            timeIn: '8:25 AM',
            timeOut: '--:--',
            hoursToday: '4.5',
            weeklyHours: 38.5,
        },
        {
            id: 2,
            name: 'Michael Chen',
            department: 'Engineering',
            position: 'Frontend Developer',
            avatar: 'MC',
            status: 'checked-in',
            timeIn: '8:45 AM',
            timeOut: '--:--',
            hoursToday: '4.25',
            weeklyHours: 35.0,
        },
        {
            id: 3,
            name: 'Emily Rodriguez',
            department: 'Design',
            position: 'UI/UX Designer',
            avatar: 'ER',
            status: 'checked-in',
            timeIn: '8:30 AM',
            timeOut: '--:--',
            hoursToday: '4.5',
            weeklyHours: 40.0,
        },
        {
            id: 4,
            name: 'David Kim',
            department: 'Marketing',
            position: 'Marketing Manager',
            avatar: 'DK',
            status: 'on-leave',
            timeIn: '--:--',
            timeOut: '--:--',
            hoursToday: '0',
            weeklyHours: 32.0,
        },
        {
            id: 5,
            name: 'Jessica Williams',
            department: 'HR',
            position: 'HR Specialist',
            avatar: 'JW',
            status: 'checked-in',
            timeIn: '8:20 AM',
            timeOut: '--:--',
            hoursToday: '4.67',
            weeklyHours: 39.5,
        },
        {
            id: 6,
            name: 'Robert Taylor',
            department: 'Sales',
            position: 'Sales Executive',
            avatar: 'RT',
            status: 'absent',
            timeIn: '--:--',
            timeOut: '--:--',
            hoursToday: '0',
            weeklyHours: 28.0,
        },
        {
            id: 7,
            name: 'Amanda Lee',
            department: 'Engineering',
            position: 'Backend Developer',
            avatar: 'AL',
            status: 'checked-in',
            timeIn: '9:10 AM',
            timeOut: '--:--',
            hoursToday: '3.83',
            weeklyHours: 37.0,
        },
        {
            id: 8,
            name: 'James Brown',
            department: 'Finance',
            position: 'Financial Analyst',
            avatar: 'JB',
            status: 'checked-in',
            timeIn: '8:28 AM',
            timeOut: '--:--',
            hoursToday: '4.53',
            weeklyHours: 40.5,
        },
    ];

    const pendingLeaveRequests = [
        {
            id: 1,
            employeeName: 'Sarah Johnson',
            department: 'Engineering',
            leaveType: 'Vacation Leave',
            dates: 'Apr 5-7, 2026',
            days: 3,
            reason: 'Family vacation',
            avatar: 'SJ',
        },
        {
            id: 2,
            employeeName: 'Michael Chen',
            department: 'Engineering',
            leaveType: 'Sick Leave',
            dates: 'Mar 28, 2026',
            days: 1,
            reason: 'Medical appointment',
            avatar: 'MC',
        },
    ];

    const departmentStats = [
        { name: 'Engineering', total: 18, present: 16, absent: 1, onLeave: 1, attendance: 89 },
        { name: 'Design', total: 8, present: 7, absent: 0, onLeave: 1, attendance: 88 },
        { name: 'Marketing', total: 10, present: 9, absent: 1, onLeave: 0, attendance: 90 },
        { name: 'Sales', total: 7, present: 6, absent: 1, onLeave: 0, attendance: 86 },
        { name: 'HR', total: 3, present: 3, absent: 0, onLeave: 0, attendance: 100 },
        { name: 'Finance', total: 2, present: 1, absent: 0, onLeave: 1, attendance: 50 },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'checked-in':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <CheckCircle className="h-3 w-3" />
                        Present
                    </span>
                );
            case 'absent':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        <XCircle className="h-3 w-3" />
                        Absent
                    </span>
                );
            case 'on-leave':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        <Calendar className="h-3 w-3" />
                        On Leave
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen mx-auto p-4 md:p-6 lg:p-8">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Team Attendance Dashboard</h1>
                        <p className="text-gray-600 mt-1">Monitor and manage employee attendance</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Filter
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Export Report
                        </Button>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Employees</p>
                                    <p className="text-2xl font-bold mt-1">{overviewStats.totalEmployees}</p>
                                </div>
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Present Today</p>
                                    <p className="text-2xl font-bold mt-1 text-green-600">{overviewStats.presentToday}</p>
                                </div>
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <UserCheck className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Absent</p>
                                    <p className="text-2xl font-bold mt-1 text-red-600">{overviewStats.absentToday}</p>
                                </div>
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <UserX className="h-5 w-5 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">On Leave</p>
                                    <p className="text-2xl font-bold mt-1 text-blue-600">{overviewStats.onLeave}</p>
                                </div>
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Late Today</p>
                                    <p className="text-2xl font-bold mt-1 text-yellow-600">{overviewStats.lateToday}</p>
                                </div>
                                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Avg Hours</p>
                                    <p className="text-2xl font-bold mt-1">{overviewStats.avgWorkHours}h</p>
                                </div>
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Employee Status and Leave Requests */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Employee Attendance Status */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Employee Attendance - Today</CardTitle>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search employees..."
                                        className="pl-9 w-64"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Employee</th>
                                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Department</th>
                                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Status</th>
                                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Time In</th>
                                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Hours Today</th>
                                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Week Total</th>
                                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employeesStatus.map((employee) => (
                                            <tr key={employee.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-linear-to-br from-emerald-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0">
                                                            {employee.avatar}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-sm">{employee.name}</div>
                                                            <div className="text-xs text-gray-500">{employee.position}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2 text-sm text-gray-600">{employee.department}</td>
                                                <td className="py-3 px-2">{getStatusBadge(employee.status)}</td>
                                                <td className="py-3 px-2 text-sm font-mono">{employee.timeIn}</td>
                                                <td className="py-3 px-2 text-sm font-semibold">{employee.hoursToday}h</td>
                                                <td className="py-3 px-2 text-sm">{employee.weeklyHours}h</td>
                                                <td className="py-3 px-2">
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Leave Requests */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Pending Leave Requests</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {pendingLeaveRequests.map((request) => (
                                <div key={request.id} className="p-4 border rounded-lg space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-linear-to-br from-emerald-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">
                                            {request.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm">{request.employeeName}</div>
                                            <div className="text-xs text-gray-600">{request.department}</div>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Type:</span>
                                            <span className="font-medium">{request.leaveType}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Dates:</span>
                                            <span className="font-medium">{request.dates}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Duration:</span>
                                            <span className="font-medium">{request.days} day{request.days > 1 ? 's' : ''}</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-600 italic">
                                        Reason: {request.reason}
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                                            Approve
                                        </Button>
                                        <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-600 hover:bg-red-50">
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Department Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Department-wise Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Department</th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Total Employees</th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Present</th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Absent</th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">On Leave</th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Attendance %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {departmentStats.map((dept, index) => (
                                        <tr key={index} className="border-b hover:bg-gray-50">
                                            <td className="py-4 px-4 font-semibold">{dept.name}</td>
                                            <td className="py-4 px-4 text-center">{dept.total}</td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                                    {dept.present}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                                                    {dept.absent}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                                    {dept.onLeave}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${dept.attendance >= 90
                                                                ? 'bg-green-600'
                                                                : dept.attendance >= 75
                                                                    ? 'bg-yellow-600'
                                                                    : 'bg-red-600'
                                                                }`}
                                                            style={{ width: `${dept.attendance}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-semibold w-12 text-right">{dept.attendance}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6 text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Download className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold mb-1">Download Reports</h3>
                            <p className="text-sm text-gray-600">Export attendance data to Excel or PDF</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6 text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Calendar className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="font-semibold mb-1">Manage Schedules</h3>
                            <p className="text-sm text-gray-600">Set and update employee work schedules</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6 text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="font-semibold mb-1">View Analytics</h3>
                            <p className="text-sm text-gray-600">Detailed attendance trends and insights</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
