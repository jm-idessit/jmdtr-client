"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Emp01Header } from './employeeHeader';
import Emp01Sidebar from './employeeSidebar';
import { Emp02Header } from './employerHeader';
import Emp02Sidebar from './employer.Sidebar';

interface AppLayoutProps {
    children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const pathname = usePathname();
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const showSidebar = pathname !== "/" && !pathname.startsWith("/login") && !pathname.startsWith("/register") && !pathname.startsWith("/about");

    if (pathname.startsWith('/employee') && showSidebar) {
        return (
            /*
             * h-screen + overflow-hidden on the outer shell means the viewport
             * itself never scrolls.  Only the inner content column (overflow-y-auto)
             * scrolls, so the sidebar and header stay perfectly pinned.
             */
            <div className="h-screen overflow-hidden flex">
                <Emp01Sidebar
                    isOpen={mobileSidebarOpen}
                    onClose={() => setMobileSidebarOpen(false)}
                />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <Emp01Header onOpenSidebar={() => setMobileSidebarOpen(true)} />
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        );
    } else if (pathname.startsWith('/employer')) {
        return (
            <div className="h-screen overflow-hidden flex">
                <Emp02Sidebar
                    isOpen={mobileSidebarOpen}
                    onClose={() => setMobileSidebarOpen(false)}
                />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <Emp02Header onOpenSidebar={() => setMobileSidebarOpen(true)} />
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        );
    } else {
        return <div className="min-h-screen">{children}</div>;
    }
}