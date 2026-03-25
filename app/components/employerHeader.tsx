"use client";
import { Input } from '../components/ui/input';
import { Bell, Menu, Search, User } from "lucide-react";
import { Button } from "../components/ui/button";
import Link from 'next/link';
import { getEmployerProfile } from '../../services/employerApi';
import { useEffect, useState } from 'react';

type EmployerProfile = {
    profile?: string;
    name?: string;
    email?: string;
};

export function Emp02Header({ onOpenSidebar }: { onOpenSidebar: () => void }) {
    const [employerProfile, setEmployerProfile] = useState<EmployerProfile | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const response = await getEmployerProfile();
                if (!cancelled) setEmployerProfile(response as EmployerProfile);
            } catch {
                // Ignore profile fetch errors (header will render without profile).
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);
    return (
        <header className="h-16 border-b bg-white flex items-center justify-end px-4 sm:px-6 sticky top-0 z-10">

            {/* Mobile menu button */}
            <button
                type="button"
                aria-label="Open sidebar"
                onClick={onOpenSidebar}
                className="lg:hidden p-2 rounded-md hover:bg-gray-50 text-gray-700 mr-auto"
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
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                    <span className="hidden sm:inline-flex text-sm font-medium truncate text-black">
                        {employerProfile?.profile}
                    </span>
                </Button>
                <Link href="/employer/emp02Profile">
                    <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                    </Button>
                </Link>
                <span className="hidden sm:inline-flex text-sm font-medium truncate text-black max-w-[180px]">
                    {employerProfile?.name}
                </span>
             </div>
        </header>
    );
}