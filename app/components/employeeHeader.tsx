"use client";
import { Input } from '../components/ui/input';
import { Bell, Search, User } from "lucide-react";
import { Button } from "../components/ui/button";
import Link from 'next/link';
import { getEmployeeProfile } from '../../services/employeeApi';
import { useEffect, useState } from 'react';

export function Emp01Header() {
    const [employeeProfile, setEmployeeProfile] = useState<any>(null);
    const handleGetEmployeeProfile = async () => {
        const response = await getEmployeeProfile();
        setEmployeeProfile(response);
    }

    useEffect(() => {
        handleGetEmployeeProfile();
    }, []);

    return (
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10">

            <div className="flex-1 max-w-md mx-8 hidden md:block">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <span className="text-sm font-medium truncate text-black">{employeeProfile?.profile}</span>
                </Button>
                <Link href="/employee/emp01Profile">
                    <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                    </Button>
                </Link>
                <span className="text-sm font-medium truncate text-black">{employeeProfile?.name}</span>
            </div>
        </header>
    );
}