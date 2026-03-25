"use client";
import { Input } from '../components/ui/input';
import { Bell, Menu, Search, User } from "lucide-react";
import { Button } from "../components/ui/button";
import Link from 'next/link';
import { getEmployeeProfile } from '../../services/employeeApi';
import { useEffect, useState } from 'react';

type EmployeeProfile = {
    profile?: string;
    name?: string;
    email?: string;
};

export function Emp01Header({ onOpenSidebar }: { onOpenSidebar: () => void }) {
    const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfile | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const response = await getEmployeeProfile();
                if (!cancelled) setEmployeeProfile(response as EmployeeProfile);
            } catch {
                // Ignore profile fetch errors (header will render without profile).
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <header className="h-16 border-b bg-white flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">

            {/* Mobile menu button */}
            <button
                type="button"
                aria-label="Open sidebar"
                onClick={onOpenSidebar}
                className="lg:hidden p-2 rounded-md hover:bg-gray-50 text-gray-700"
            >
                <Menu className="h-5 w-5" />
            </button>

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
                    <span className="hidden sm:inline-flex text-sm font-medium truncate text-black">
                        {employeeProfile?.profile}
                    </span>
                </Button>
                <Link href="/employee/emp01Profile">
                    <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                    </Button>
                </Link>
                <span className="hidden sm:inline-flex text-sm font-medium truncate text-black max-w-[180px]">
                    {employeeProfile?.name}
                </span>
            </div>
        </header>
    );
}