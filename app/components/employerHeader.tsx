"use client";
import { Input } from '../components/ui/input';
import { Bell, Search, User } from "lucide-react";
import { Button } from "../components/ui/button";
import Link from 'next/link';

export function Emp02Header() {
    return (
        <header className="h-16 border-b bg-white flex items-center justify-end px-6 sticky top-0 z-10">

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
                </Button>
                <Link href="/employer/emp02Profile">
                    <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                    </Button>
                </Link>
            </div>
        </header>
    );
}