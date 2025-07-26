'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles,
  Github,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
  ArrowRight,
  Globe,
  Shield,
  Award,
  Zap
} from 'lucide-react';

const footerNavigation = {
  product: [
    { name: 'Features', href: '/features' },
    { name: 'Integrations', href: '/integrations' },
    { name: 'Workflow Builder', href: '/workflow' },
    { name: 'AI Studio', href: '/ai-studio' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Templates', href: '/templates' }
  ],
  solutions: [
    { name: 'Marketing Automation', href: '/solutions/marketing' },
    { name: 'Sales Operations', href: '/solutions/sales' },
    { name: 'Customer Support', href: '/solutions/support' },
    { name: 'Data Processing', href: '/solutions/data' },
    { name: 'E-commerce', href: '/solutions/ecommerce' },
    { name: 'Enterprise', href: '/solutions/enterprise' }
  ],
  resources: [
    { name: 'Documentation', href: '/learn?tab=docs' },
    { name: 'API Reference', href: '/learn?tab=api' },
    { name: 'Tutorials', href: '/learn?tab=tutorials' },
    { name: 'Community', href: '/learn?tab=community' },
    { name: 'Blog', href: '/blog' },
    { name: 'Help Center', href: '/help' }
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Partners', href: '/partners' },
    { name: 'Contact', href: '/contact' },
    { name: 'Status', href: '/status' }
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Security', href: '/security' },
    { name: 'Compliance', href: '/compliance' },
    { name: 'Cookies', href: '/cookies' }
  ]
};

const socialLinks = [
  { name: 'GitHub', href: '#', icon: Github },
  { name: 'Twitter', href: '#', icon: Twitter },
  { name: 'LinkedIn', href: '#', icon: Linkedin },
  { name: 'YouTube', href: '#', icon: Youtube }
];

export function MarketingFooter() {
  return (
    <footer className="bg-background border-t">
      {/* Main Footer Content */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Kairo
              </span>
            </div>
            
            <p className="text-muted-foreground leading-relaxed">
              The world's most advanced AI-powered workflow automation platform. 
              Build, deploy, and scale intelligent automations with zero-code complexity.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                SOC 2 Compliant
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                99.9% Uptime
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                10x Faster
              </Badge>
            </div>

            {/* Newsletter Signup */}
            <div className="space-y-4">
              <h4 className="font-semibold">Stay Updated</h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input 
                  placeholder="Enter your email" 
                  className="flex-1"
                />
                <Button className="bg-gradient-to-r from-primary to-purple-600">
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get the latest updates on new features and automation tips.
              </p>
            </div>
          </div>
          
          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Product</h4>
            <ul className="space-y-3">
              {footerNavigation.product.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Solutions */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Solutions</h4>
            <ul className="space-y-3">
              {footerNavigation.solutions.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Resources</h4>
            <ul className="space-y-3">
              {footerNavigation.resources.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Company</h4>
            <ul className="space-y-3">
              {footerNavigation.company.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t bg-muted/20">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-sm text-muted-foreground">
                © 2025 Kairo. All rights reserved.
              </p>
              <div className="flex items-center space-x-6">
                {footerNavigation.legal.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>Global Infrastructure</span>
              </div>
              <div className="flex items-center space-x-2">
                {socialLinks.map((item) => (
                  <Button key={item.name} variant="ghost" size="sm" className="h-9 w-9 p-0" asChild>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="sr-only">{item.name}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}