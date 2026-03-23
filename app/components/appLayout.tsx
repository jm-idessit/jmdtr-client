"use client";

import { usePathname } from "next/navigation";
import { Emp01Header } from './employeeHeader';
import Emp01Sidebar from './employeeSidebar';
import { Emp02Header } from './employerHeader';
import Emp02Sidebar from './employer.Sidebar';

interface AppLayoutProps {
    children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const pathname = usePathname();

    const showSidebar = pathname !== "/" && !pathname.startsWith("/login") && !pathname.startsWith("/register") && !pathname.startsWith("/about");

    if (pathname.startsWith('/employee') && showSidebar) {
        return (
            <div className="min-h-screen flex">
                <Emp01Sidebar />
                <div className="flex-1 flex flex-col">
                    <Emp01Header />
                    <div className="flex-1 overflow-auto">
                        {children}
                    </div>
                </div>
            </div>
        );
    } else if (pathname.startsWith('/employer')) {
        return (
            <div className="min-h-screen flex">
                <Emp02Sidebar />
                <div className="flex-1 flex flex-col">
                    <Emp02Header />
                    <div className="flex-1 overflow-auto">
                        {children}
                    </div>
                </div>
            </div>
        );
    } else {
        return <div className="min-h-screen">{children}</div>;
    }
}