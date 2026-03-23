
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
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
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Button variant="outline">
                <Link href="/auth/employeeSignin">Sign In</Link>
              </Button>
              <Button>
                <Link href="/auth/employerSignin">Get Started</Link>
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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-linear-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">
            Build Something Amazing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The all-in-one platform to bring your ideas to life. Fast, secure, and designed for modern teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">

            <Link href="/auth/employeeSignin" className="text-lg px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

            <Button size="lg" variant="outline" className="text-lg px-8 py-3 flex items-center justify-center">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600">
              Powerful features to help you succeed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">
              Choose the plan that&apos;s right for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white p-8 rounded-xl border-2 ${plan.popular ? 'border-emerald-600 shadow-lg scale-105' : 'border-gray-200'
                  }`}
              >
                {plan.popular && (
                  <span className="bg-emerald-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-2xl font-bold mt-4 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <Button
                  className="w-full mb-6"
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link href="/app">Get Started</Link>
                </Button>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-emerald-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who are already building amazing things.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
            <Link href="/app">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
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
            <p>&copy; 2026 App Name. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
