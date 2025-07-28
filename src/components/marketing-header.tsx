'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X, 
  ChevronDown,
  Sparkles,
  Workflow,
  Brain,
  Zap,
  Globe,
  BookOpen,
  Users,
  Phone,
  Mail,
  ArrowRight
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';

const navigation = {
  main: [
    {
      name: 'Features',
      href: '#features',
      children: [
        { name: 'AI Workflow Generation', href: '/dashboard?tab=ai', icon: Brain },
        { name: 'Visual Builder', href: '/editor?tab=canvas', icon: Workflow },
        { name: 'Integrations', href: '/integrations', icon: Globe },
        { name: 'Analytics', href: '/dashboard?tab=analytics', icon: Zap }
      ]
    },
    {
      name: 'Solutions',
      href: '#solutions',
      children: [
        { name: 'Marketing Automation', href: '/#marketing', icon: Sparkles },
        { name: 'Sales Operations', href: '/#sales', icon: Users },
        { name: 'Customer Support', href: '/#support', icon: Phone },
        { name: 'Data Processing', href: '/#data', icon: Brain }
      ]
    },
    {
      name: 'Resources',
      href: '/help',
      children: [
        { name: 'Documentation', href: '/help?tab=docs', icon: BookOpen },
        { name: 'API Reference', href: '/help?tab=api', icon: Workflow },
        { name: 'Tutorials', href: '/help?tab=tutorials', icon: Brain },
        { name: 'Community', href: '/help?tab=community', icon: Users }
      ]
    },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Contact', href: '/#contact' }
  ]
};

export function MarketingHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { isLoggedIn } = useSubscription();

  useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Kairo
            </span>
          </Link>
          <Badge variant="secondary" className="ml-3 text-xs">
            v2.0
          </Badge>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navigation.main.map((item) => (
            <div key={item.name} className="relative group">
              {item.children ? (
                <div>
                  <button 
                    className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onMouseEnter={() => setActiveDropdown(item.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    {item.name}
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </button>
                  
                  {activeDropdown === item.name && (
                    <div 
                      className="absolute top-full left-0 mt-2 w-64 bg-background border rounded-lg shadow-lg p-2 z-50"
                      onMouseEnter={() => setActiveDropdown(item.name)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted transition-colors"
                        >
                          <child.icon className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-medium text-sm">{child.name}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild>
                <Link href="/editor">
                  <Workflow className="mr-2 h-4 w-4" />
                  Create
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/auth?tab=signin">Sign In</Link>
              </Button>
              <Button className="bg-gradient-to-r from-primary to-purple-600 hover:shadow-lg" asChild>
                <Link href="/auth?tab=signup">
                  Get Started Free
                  <Sparkles className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Enhanced Mobile menu button - More Prominent */}
        <div className="md:hidden">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsOpen(!isOpen)}
            className={`h-12 px-4 border-2 transition-all duration-300 transform touch-manipulation ${
              isOpen 
                ? 'border-primary bg-primary text-white shadow-xl scale-105 ring-2 ring-primary/20' 
                : 'border-primary/50 hover:border-primary hover:bg-primary/10 hover:shadow-lg hover:scale-105'
            }`}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
            <span className="ml-2 text-base font-bold">
              {isOpen ? 'Close' : 'Menu'}
            </span>
          </Button>
        </div>
      </nav>

      {/* Enhanced Mobile Navigation - More Prominent */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="md:hidden fixed inset-0 top-16 bg-background/80 backdrop-blur-md z-40" />
          
          {/* Mobile Menu */}
          <div className="md:hidden fixed inset-x-0 top-16 z-50 bg-background/98 backdrop-blur-lg border-b shadow-2xl">
            <div className="container py-8 space-y-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {/* Enhanced Quick Actions with better visibility */}
              <div className="bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-xl p-6 border border-primary/30 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-foreground flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-primary" />
                    Quick Actions
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {isLoggedIn ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full h-12 font-medium border-2 hover:bg-background/80" 
                        asChild
                      >
                        <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                          <Zap className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </Button>
                      <Button 
                        size="lg" 
                        className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 font-medium shadow-lg" 
                        asChild
                      >
                        <Link href="/editor" onClick={() => setIsOpen(false)}>
                          <Workflow className="mr-2 h-4 w-4" />
                          Create Workflow
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full h-12 font-medium border-2 hover:bg-background/80" 
                        asChild
                      >
                        <Link href="/auth?tab=signin" onClick={() => setIsOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button 
                        size="lg" 
                        className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 font-medium shadow-lg" 
                        asChild
                      >
                        <Link href="/auth?tab=signup" onClick={() => setIsOpen(false)}>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Start Free Trial
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Enhanced Navigation Items */}
              {navigation.main.map((item) => (
                <div key={item.name} className="space-y-4">
                  <h3 className="font-bold text-lg text-foreground flex items-center border-b border-border/50 pb-3">
                    {item.name}
                  </h3>
                  {item.children ? (
                    <div className="pl-2 space-y-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="flex items-center space-x-4 p-4 rounded-xl hover:bg-primary/10 transition-all duration-300 border border-transparent hover:border-primary/20 group"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="p-2 bg-primary/15 rounded-lg group-hover:bg-primary/25 transition-colors">
                            <child.icon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium text-foreground group-hover:text-primary transition-colors">{child.name}</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="block p-4 text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-300"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              
              {/* Enhanced Contact Info */}
              <div className="pt-6 border-t space-y-4 bg-muted/30 rounded-xl p-6">
                <h3 className="font-bold text-lg text-foreground">Need Help?</h3>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="font-medium">Email Support</span>
                    </div>
                    <span className="text-muted-foreground">support@kairo.ai</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="font-medium">24/7 Support</span>
                    </div>
                    <span className="text-muted-foreground">Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}