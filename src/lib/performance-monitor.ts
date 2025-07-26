'use client';

// Performance monitoring utilities
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Monitor Long Tasks (> 50ms)
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn(`Long task detected: ${entry.duration}ms`, entry);
            }
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        // Browser doesn't support longtask
      }

      // Monitor Layout Shifts
      try {
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).value > 0.1) {
              console.warn(`Layout shift detected: ${(entry as any).value}`, entry);
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        // Browser doesn't support layout-shift
      }

      // Monitor First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const fid = entry.processingStart - entry.startTime;
            if (fid > 100) {
              console.warn(`High First Input Delay: ${fid}ms`, entry);
            }
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        // Browser doesn't support first-input
      }
    }
  }

  // Measure function execution time
  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;
    
    this.metrics.set(name, duration);
    
    if (duration > 100) {
      console.warn(`Slow function execution: ${name} took ${duration}ms`);
    }
    
    return result;
  }

  // Measure async function execution time
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    const duration = end - start;
    
    this.metrics.set(name, duration);
    
    if (duration > 500) {
      console.warn(`Slow async function execution: ${name} took ${duration}ms`);
    }
    
    return result;
  }

  // Get Web Vitals
  getWebVitals(): Promise<{
    fcp?: number;
    lcp?: number;
    cls?: number;
    fid?: number;
    ttfb?: number;
  }> {
    return new Promise((resolve) => {
      const vitals: any = {};

      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            vitals.fcp = entry.startTime;
          }
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          vitals.lcp = entry.startTime;
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Time to First Byte
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        vitals.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      }

      // Return vitals after a short delay to collect metrics
      setTimeout(() => {
        fcpObserver.disconnect();
        lcpObserver.disconnect();
        resolve(vitals);
      }, 2000);
    });
  }

  // Memory usage monitoring
  getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
      };
    }
    return null;
  }

  // Bundle size analysis
  analyzeBundleSize() {
    const scripts = Array.from(document.querySelectorAll('script[src]')) as HTMLScriptElement[];
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
    
    const analysis = {
      scripts: scripts.length,
      stylesheets: links.length,
      totalRequests: scripts.length + links.length,
    };

    console.log('Bundle Analysis:', analysis);
    return analysis;
  }

  // Network performance
  getNetworkPerformance() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      return {
        dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcpConnect: navigation.connectEnd - navigation.connectStart,
        tlsNegotiation: navigation.connectEnd - navigation.secureConnectionStart,
        requestResponse: navigation.responseEnd - navigation.requestStart,
        domParsing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
        resourceLoad: navigation.loadEventEnd - navigation.domContentLoadedEventEnd,
      };
    }
    
    return null;
  }

  // Clean up observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  // Get all collected metrics
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  // Report performance issues
  reportIssues() {
    const memory = this.getMemoryUsage();
    const network = this.getNetworkPerformance();
    
    const issues: string[] = [];

    if (memory && memory.used > memory.total * 0.8) {
      issues.push('High memory usage detected');
    }

    if (network) {
      if (network.dnsLookup > 100) issues.push('Slow DNS lookup');
      if (network.requestResponse > 1000) issues.push('Slow server response');
      if (network.domParsing > 2000) issues.push('Slow DOM parsing');
    }

    this.metrics.forEach((duration, name) => {
      if (duration > 100) {
        issues.push(`Slow function: ${name} (${duration}ms)`);
      }
    });

    return issues;
  }
}

// Global performance monitor instance
let performanceMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor && typeof window !== 'undefined') {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor!;
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = getPerformanceMonitor();
  
  return {
    measureFunction: monitor?.measureFunction.bind(monitor),
    measureAsyncFunction: monitor?.measureAsyncFunction.bind(monitor),
    getWebVitals: monitor?.getWebVitals.bind(monitor),
    getMemoryUsage: monitor?.getMemoryUsage.bind(monitor),
    getMetrics: monitor?.getMetrics.bind(monitor),
    reportIssues: monitor?.reportIssues.bind(monitor),
  };
}