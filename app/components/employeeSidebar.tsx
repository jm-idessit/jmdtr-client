import { LayoutDashboard, Users, CreditCard, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const navItems = [
    { icon: LayoutDashboard, label: 'Home', href: '/employee/emp01Home' },
    { icon: Users, label: 'Records', href: '/employee/emp01Records' },
    { icon: CreditCard, label: 'Profile', href: '/employee/emp01Profile' },
];

export default function Emp01Sidebar({ isOpen = true, onClose }: SidebarProps) {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed lg:sticky top-0 left-0 h-screen flex flex-col z-50 transition-all duration-300 ease-in-out",
                    "bg-emerald-700 rounded-r-3xl shadow-2xl",
                    isExpanded ? "w-64" : "w-20",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Logo Section */}
                <div className="h-24 flex items-center justify-between px-4 relative">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Logo Icon */}
                        <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-red-500 rounded-full flex items-center justify-center shrink-0">
                            <div className="w-6 h-6 bg-emerald-700 rounded-full"></div>
                        </div>
                        {/* Logo Text */}
                        {isExpanded && (
                            <span className="text-white font-bold text-lg whitespace-nowrap transition-opacity duration-200">
                                Employee.CO
                            </span>
                        )}
                    </div>

                    {/* Toggle button - Desktop only */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#3E4268] hover:bg-[#4a4f7a] rounded-full items-center justify-center transition-colors z-10"
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
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                                    "hover:bg-[#3E4268]/50",
                                    isActive && "bg-[#3E4268]",
                                    !isExpanded && "justify-center"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-5 w-5 shrink-0",
                                    isActive ? "text-white" : "text-white"
                                )} />
                                {isExpanded && (
                                    <span className={cn(
                                        "whitespace-nowrap transition-opacity duration-200",
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
                {isExpanded && (
                    <div className="p-4">
                        <Button
                            variant="secondary"
                            className="w-full bg-white hover:bg-gray-100 text-[#6C5DD3] font-semibold rounded-xl gap-2"
                            asChild
                        >
                            <Link href="/login">
                                <LogOut className="h-5 w-5" />
                                Logout
                            </Link>
                        </Button>
                    </div>
                )}

                {/* User Profile - Only visible when expanded */}
                {isExpanded && (
                    <div className="p-4 border-t border-[#3E4268]/50">
                        <Link href="/employee/emp01Profile" className="flex items-center gap-3 px-3 py-3 hover:bg-[#3E4268]/50 rounded-xl transition-colors">
                            <div className="w-8 h-8 bg-linear-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-sm text-white font-semibold">JD</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-white">Employee Doe</p>
                                <p className="text-xs text-[#A9ABBA] truncate">employee1@example.com</p>
                            </div>
                        </Link>
                    </div>
                )}

                {/* Collapsed state user icon */}
                {!isExpanded && (
                    <div className="p-4">
                        <Link
                            href="/employee/emp01Profile"
                            className="flex justify-center p-2 hover:bg-[#3E4268]/50 rounded-xl transition-colors"
                        >
                            <div className="w-8 h-8 bg-linear-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-sm text-white font-semibold">JD</span>
                            </div>
                        </Link>
                    </div>
                )}
            </aside>
        </>
    );
}