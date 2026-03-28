
import Link from 'next/link';
import { ArrowRight, Building2, CalendarDays, Clock, Coffee, Search, Users } from 'lucide-react';
import { Button } from './components/ui/button';
// import { useState } from 'react';

export default function Home() {
  // const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      title: 'Fast Performance',
      description: 'Built with modern technology for lightning-fast load times and smooth interactions.',
    },
    {
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security to keep your data safe and protected at all times.',
    },
    {
      title: 'Easy to Use',
      description: 'Intuitive interface designed for users of all skill levels to get started quickly.',
    },
    {
      title: 'Real-time Updates',
      description: 'Stay connected with instant notifications and live data synchronization.',
    },
    {
      title: 'Customizable',
      description: 'Tailor the platform to your needs with flexible settings and configurations.',
    },
    {
      title: '24/7 Support',
      description: 'Our dedicated team is always here to help you succeed with expert assistance.',
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '₱249',
      description: 'Perfect for individuals and small projects',
      features: [
        'Up to 5 projects',
        '10 GB storage',
        'Basic support',
        'Core features',
      ],
    },
    {
      name: 'Professional',
      price: '₱499',
      description: 'Great for growing teams and businesses',
      features: [
        'Unlimited projects',
        '100 GB storage',
        'Priority support',
        'Advanced features',
        'Team collaboration',
        'Analytics dashboard',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '₱899',
      description: 'For large organizations with custom needs',
      features: [
        'Everything in Professional',
        'Unlimited storage',
        'Dedicated support',
        'Custom integrations',
        'SLA guarantee',
        'Advanced security',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold">JM</span>
              </div>
              <span className="text-xl font-semibold">JM.Next.js</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#employees" className="text-gray-600 hover:text-gray-900">For Employees</a>
              <a href="#employers" className="text-gray-600 hover:text-gray-900">For Employers</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How it works</a>
              <Button variant="outline">
                <Link href="/auth/employeeSignin">Employee Sign In</Link>
              </Button>
              <Button>
                <Link href="/auth/employerSignin">Employer Sign In</Link>
              </Button>
            </div>

            {/* Mobile quick actions */}
            <div className="md:hidden flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/employeeSignin">Employee</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/employerSignin">Employer</Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            {/* <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button> */}
          </div>

          {/* Mobile Navigation */}
          {/* {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t">
              <a href="#features" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded">Features</a>
              <a href="#pricing" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded">Pricing</a>
              <a href="#about" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded">About</a>
              <div className="px-4 pt-2 space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <a href="/app">Sign In</a>
                </Button>
                <Button className="w-full" asChild>
                  <a href="/app">Get Started</a>
                </Button>
              </div>
            </div>
          )} */}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">Digital Time Record (DTR)</span>
              </div>

              <h1 className="mt-5 text-4xl md:text-6xl font-bold leading-tight bg-linear-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">
                Attendance that matches real work hours.
              </h1>

              <p className="mt-5 text-lg text-gray-600 max-w-xl">
                Clock in/out, track Morning/Lunch/Afternoon breaks, and get weekly attendance summaries as an employee.
                Employers monitor records, late/undertime, and auto vs manual break actions from one dashboard.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
                <Link
                  href="/auth/employeeSignin"
                  className="text-base sm:text-lg px-7 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
                >
                  Employee DTR
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-7 py-3 text-base sm:text-lg flex items-center justify-center"
                  asChild
                >
                  <Link href="/auth/employerSignin">
                    Employer Dashboard
                    <Building2 className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="mt-10 grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">Auto-tracking rules</div>
                    <div className="text-gray-600">
                      Manual clock-in (on time or late), optional mark absent, timed breaks, and auto clock-out.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Coffee className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">Breaks are timed</div>
                    <div className="text-gray-600">Morning, Lunch (auto end), and Afternoon windows.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Simple responsive preview (desktop only) */}
            <div className="hidden lg:block">
              <div className="rounded-3xl border shadow-sm bg-white/80 backdrop-blur p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Search className="w-4 h-4" />
                    <span className="font-semibold">Live DTR</span>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Philippine Standard Time
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <div className="text-xs text-gray-500">Clock In</div>
                    <div className="mt-2 text-3xl font-bold text-emerald-700">08:05</div>
                    <div className="text-xs text-emerald-600 mt-1">tap to clock in</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border">
                    <div className="text-xs text-gray-500">Lunch</div>
                    <div className="mt-2 text-2xl font-bold text-gray-900">12:00</div>
                    <div className="text-xs text-gray-500 mt-1">auto end</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-900 border-gray-900">
                    <div className="text-xs text-white/70">Clock Out</div>
                    <div className="mt-2 text-3xl font-bold text-white">17:30</div>
                    <div className="text-xs text-white/70 mt-1">auto</div>
                  </div>
                </div>

                <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-purple-700 text-white">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    <span className="font-semibold">Weekly attendance</span>
                  </div>
                  <div className="text-sm text-white/90 mt-1">
                    Late + undertime minutes, plus weekly record tracking.
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-white/90" />
                    <span className="text-xs text-white/80">Built for employees & employers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">DTR for everyday timekeeping</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built around the same rules you use in the app: timed breaks, late/undertime insights, and weekly summaries.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div id="employees" className="bg-white p-8 rounded-2xl border shadow-sm">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h3 className="text-2xl font-bold">Employee DTR</h3>
              </div>
              <p className="text-gray-600 mt-3">
                Clock in/out, start/end breaks, and review your weekly attendance.
              </p>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">Clock In / Clock Out</div>
                    <div className="text-sm text-gray-600">
                      Clock in on time or late, mark absent when needed, and clock out (with scheduled auto clock-out).
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Coffee className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">Break Tracking</div>
                    <div className="text-sm text-gray-600">Morning, Lunch (with auto end), and Afternoon windows.</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CalendarDays className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">Weekly Records</div>
                    <div className="text-sm text-gray-600">Work hours + late and undertime minutes.</div>
                  </div>
                </li>
              </ul>

              <div className="mt-8">
                <Button asChild>
                  <Link href="/auth/employeeSignin">
                    Open Employee DTR
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div id="employers" className="bg-white p-8 rounded-2xl border shadow-sm">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-2xl font-bold">Employer Attendance Dashboard</h3>
              </div>
              <p className="text-gray-600 mt-3">
                Monitor employee time records, see statuses, and review break actions.
              </p>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3">
                  <Search className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">Filter + Search</div>
                    <div className="text-sm text-gray-600">Filter by week/day and search by name, ID, or department.</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">Clear Statuses</div>
                    <div className="text-sm text-gray-600">Absent, Present, and Late—plus late/undertime minutes.</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Coffee className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">Auto vs Manual Breaks</div>
                    <div className="text-sm text-gray-600">Break durations with “auto” indicators where applicable.</div>
                  </div>
                </li>
              </ul>

              <div className="mt-8">
                <Button asChild variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-50">
                  <Link href="/auth/employerSignin">
                    Open Employer Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How DTR works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The app uses Philippine Standard Time and timed windows for clock-in, breaks, and clock-out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-7 rounded-2xl border shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="mt-4 text-lg font-bold">1) Clock In</h3>
              <p className="text-gray-600 mt-2 text-sm">
                Clock in during the morning window, use &quot;Clock In Late&quot; after 8:30 AM, or mark absent if you are not working today.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="mt-4 text-lg font-bold">2) Breaks</h3>
              <p className="text-gray-600 mt-2 text-sm">
                Track Morning, Lunch, and Afternoon breaks. Lunch break can auto-end based on its window.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="mt-4 text-lg font-bold">3) Clock Out + Weekly</h3>
              <p className="text-gray-600 mt-2 text-sm">
                Clock out with the afternoon schedule and review weekly attendance summaries (work hours, late, undertime).
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl bg-gradient-to-r from-emerald-600 to-purple-700 text-white p-7 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-sm font-semibold opacity-90">Auto-tracking highlights</div>
                <div className="text-2xl md:text-3xl font-bold mt-1">Auto clock-out at 5:30 PM</div>
                <div className="text-sm text-white/90 mt-2">
                  Where applicable, the employer dashboard will show whether breaks were recorded automatically or manually.
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  <Link href="/auth/employeeSignin">
                    Employee DTR
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white/40 bg-transparent hover:bg-white/10 text-white">
                  <Link href="/auth/employerSignin">
                    Employer Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-emerald-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Get started with DTR</h2>
          <p className="text-xl mb-8 opacity-90">
            Employees clock in/out and track breaks. Employers review attendance records instantly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
              <Link href="/auth/employeeSignin">
                Employee Sign In
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-white border-white/40 hover:bg-white/10" asChild>
              <Link href="/auth/employerSignin">
                Employer Sign In
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 JM DTR. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
