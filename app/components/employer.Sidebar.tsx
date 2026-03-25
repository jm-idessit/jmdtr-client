"use client";

import { LayoutDashboard, CreditCard, LogOut, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getEmployerProfile } from '../../services/employerApi';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const navItems = [
    { icon: LayoutDashboard, label: 'Home', href: '/employer/emp02Home' },
    { icon: CreditCard, label: 'Profile', href: '/employer/emp02Profile' },
];

type EmployerProfile = {
    profile?: string;
    name?: string;
    email?: string;
};

export default function Emp02Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isLgUp, setIsLgUp] = useState(false);
    const [employerProfile, setEmployerProfile] = useState<EmployerProfile | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const response = await getEmployerProfile();
                if (!cancelled) setEmployerProfile(response as EmployerProfile);
            } catch {
                // Ignore profile fetch errors (sidebar will render without profile).
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)");
        const update = () => setIsLgUp(mq.matches);
        update();

        // Safari fallback: older versions may not support addEventListener on MediaQueryList.
        if (mq.addEventListener) mq.addEventListener("change", update);
        else mq.addListener(update);

        return () => {
            if (mq.removeEventListener) mq.removeEventListener("change", update);
            else mq.removeListener(update);
        };
    }, []);

    const showLabels = isLgUp ? isExpanded : true; // Keep labels visible on mobile for usability.
    const close = () => onClose?.();

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={close}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "flex flex-col z-50 bg-blue-800 rounded-r-3xl shadow-2xl",
                    "overflow-y-auto overflow-x-hidden overscroll-contain",

                    // ── Mobile: off-canvas drawer, slides in/out, full dynamic-viewport height ──
                    "fixed inset-y-0 left-0 w-64 h-[100dvh]",
                    "transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "-translate-x-full",

                    // ── Desktop (lg+): leave the fixed/translate flow; become a sticky column ──
                    isExpanded ? "lg:w-64" : "lg:w-20",
                    "lg:static lg:translate-x-0 lg:h-screen lg:sticky lg:top-0 lg:shrink-0",
                )}
            >
                {/* Logo Section */}
                <div className="h-24 flex items-center justify-between px-4 relative">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Mobile close button */}
                        <button
                            type="button"
                            aria-label="Close sidebar"
                            onClick={close}
                            className="lg:hidden absolute right-2 top-2 w-9 h-9 rounded-full bg-[#3E4268]/60 hover:bg-[#3E4268] flex items-center justify-center"
                        >
                            <X className="h-4 w-4 text-[#A9ABBA]" />
                        </button>

                        {/* Logo Icon */}
                        <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-red-500 rounded-full flex items-center justify-center shrink-0">
                            <div className="w-6 h-6 bg-blue-800 rounded-full"></div>
                        </div>
                        {/* Logo Text */}
                        {showLabels && (
                            <span className="text-white font-bold text-lg truncate max-w-[10.5rem] transition-opacity duration-200">
                                Employer.CO
                            </span>
                        )}
                    </div>

                    {/* Toggle button - Desktop only */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-[#3E4268] hover:bg-[#4a4f7a] rounded-full items-center justify-center transition-colors z-10"
                    >
                        {isExpanded ? (
                            <ChevronLeft className="h-4 w-4 text-[#A9ABBA]" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-[#A9ABBA]" />
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={close}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 min-w-0",
                                    "hover:bg-[#3E4268]/50",
                                    isActive && "bg-[#3E4268]",
                                    !showLabels && "justify-center"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-5 w-5 shrink-0",
                                    isActive ? "text-white" : "text-white"
                                )} />
                                {showLabels && (
                                    <span className={cn(
                                        "truncate transition-opacity duration-200",
                                        isActive ? "text-white font-semibold" : "text-white"
                                    )}>
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button - Only visible when expanded */}
                {showLabels && (
                    <div className="p-4">
                        <Button
                            variant="secondary"
                            className="w-full bg-white hover:bg-gray-100 text-[#6C5DD3] font-semibold rounded-xl gap-2"
                            asChild
                        >
                            <Link href="/">
                                <LogOut className="h-5 w-5" />
                                Logout
                            </Link>
                        </Button>
                    </div>
                )}

                {/* User Profile - Only visible when expanded */}
                {showLabels && (
                    <div className="p-4 border-t border-[#3E4268]/50">
                        <Link href="/employer/emp02Profile" className="flex items-center gap-3 px-3 py-3 hover:bg-[#3E4268]/50 rounded-xl transition-colors">
                            <div className="w-8 h-8 bg-linear-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-sm text-white font-semibold">{employerProfile?.profile}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-white">{employerProfile?.name}</p>
                                <p className="text-xs text-[#A9ABBA] truncate">{employerProfile?.email}</p>
                            </div>
                        </Link>
                    </div>
                )}

                {/* Collapsed state user icon */}
                {!showLabels && (
                    <div className="p-4">
                        <Link
                            href="/employer/emp02Profile"
                            className="flex justify-center p-2 hover:bg-[#3E4268]/50 rounded-xl transition-colors"
                        >
                            <div className="w-8 h-8 bg-linear-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-sm text-white font-semibold">{employerProfile?.profile}</span>
                            </div>
                        </Link>
                    </div>
                )}
            </aside>
        </>
    );
}