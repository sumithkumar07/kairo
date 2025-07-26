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
  Mail
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
  const { isLoggedIn } = useSubscription();

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
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button className="bg-gradient-to-r from-primary to-purple-600 hover:shadow-lg" asChild>
                <Link href="/signup">
                  Get Started Free
                  <Sparkles className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 z-50 bg-background border-b shadow-lg">
          <div className="container py-6 space-y-6">
            {navigation.main.map((item) => (
              <div key={item.name} className="space-y-3">
                <h3 className="font-semibold text-foreground">{item.name}</h3>
                {item.children ? (
                  <div className="pl-4 space-y-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <child.icon className="h-4 w-4 text-primary" />
                        <span className="text-sm">{child.name}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="block p-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            
            <div className="pt-6 border-t space-y-3">
              {isLoggedIn ? (
                <div className="space-y-3">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/workflow" onClick={() => setIsOpen(false)}>
                      <Workflow className="mr-2 h-4 w-4" />
                      Create Workflow
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button variant="ghost" className="w-full" asChild>
                    <Link href="/signin" onClick={() => setIsOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button className="w-full bg-gradient-to-r from-primary to-purple-600" asChild>
                    <Link href="/signup" onClick={() => setIsOpen(false)}>
                      Get Started Free
                      <Sparkles className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}