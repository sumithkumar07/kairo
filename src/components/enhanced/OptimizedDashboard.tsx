'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  QuantumSimulationLoader, 
  HipaaComplianceLoader, 
  RealityFabricatorLoader, 
  ConsciousnessLoader,
  PerformanceMetrics,
  ToastNotification 
} from '../ui/LoadingStates';

interface GodTierFeature {
  id: string;
  name: string;
  accuracy: number;
  status: 'active' | 'loading' | 'error';
  lastUpdated?: string;
  responseTime?: number;
  cacheHit?: boolean;
}

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export const OptimizedDashboard: React.FC = () => {
  const [features, setFeatures] = useState<GodTierFeature[]>([
    { id: 'quantum', name: 'Quantum Simulation Engine', accuracy: 99.1, status: 'active' },
    { id: 'reality', name: 'Reality Fabricator', accuracy: 97.3, status: 'active' },
    { id: 'consciousness', name: 'Global Consciousness Feed', accuracy: 91.2, status: 'active' },
    { id: 'hipaa', name: 'HIPAA Compliance Pack', accuracy: 95.8, status: 'active' }
  ]);

  const [selectedTab, setSelectedTab] = useState('overview');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Optimized feature refresh with performance tracking
  const refreshFeature = useCallback(async (featureId: string) => {
    const feature = features.find(f => f.id === featureId);
    if (!feature) return;

    setFeatures(prev => prev.map(f => 
      f.id === featureId ? { ...f, status: 'loading' as const } : f
    ));

    try {
      const startTime = Date.now();
      let response;
      
      switch (featureId) {
        case 'quantum':
          response = await fetch('/api/quantum-simulation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              workflowData: { nodes: [{ type: 'test', id: 'dashboard-test' }] } 
            })
          });
          break;
        case 'reality':
          response = await fetch('/api/reality-fabricator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              workflowData: { nodes: [{ type: 'test', id: 'dashboard-test' }] } 
            })
          });
          break;
        case 'hipaa':
          response = await fetch('/api/hipaa-compliance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              workflowData: { nodes: [{ type: 'healthcare', id: 'dashboard-test' }] } 
            })
          });
          break;
        default:
          throw new Error('Unknown feature');
      }

      if (!response?.ok) throw new Error(`HTTP ${response?.status}`);
      
      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      // Update feature with performance metrics
      setFeatures(prev => prev.map(f => 
        f.id === featureId ? { 
          ...f, 
          status: 'active' as const,
          accuracy: data.simulation?.accuracy_score || data.fabrication?.accuracy_score || data.compliance?.compliance_score || f.accuracy,
          lastUpdated: new Date().toISOString(),
          responseTime,
          cacheHit: data.cached || false
        } : f
      ));

      // Success toast
      addToast({
        type: 'success',
        title: 'Feature Updated',
        message: `${feature.name} refreshed successfully in ${responseTime}ms`
      });

    } catch (error) {
      setFeatures(prev => prev.map(f => 
        f.id === featureId ? { ...f, status: 'error' as const } : f
      ));

      addToast({
        type: 'error',
        title: 'Update Failed',
        message: `Failed to refresh ${feature.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }, [features]);

  // Refresh all features with staggered timing
  const refreshAllFeatures = useCallback(async () => {
    setIsRefreshing(true);
    
    // Stagger API calls to prevent server overload
    for (let i = 0; i < features.length; i++) {
      await new Promise(resolve => setTimeout(resolve, i * 200)); // 200ms delay between calls
      refreshFeature(features[i].id);
    }
    
    setTimeout(() => setIsRefreshing(false), 2000);
  }, [features, refreshFeature]);

  // Toast management
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Memoized performance metrics
  const performanceStats = useMemo(() => {
    const featuresWithMetrics = features.filter(f => f.responseTime);
    const avgResponseTime = featuresWithMetrics.length > 0 
      ? featuresWithMetrics.reduce((sum, f) => sum + (f.responseTime || 0), 0) / featuresWithMetrics.length
      : 0;
    
    const cacheHitRate = featuresWithMetrics.length > 0
      ? (featuresWithMetrics.filter(f => f.cacheHit).length / featuresWithMetrics.length) * 100
      : 0;

    const avgAccuracy = features.reduce((sum, f) => sum + f.accuracy, 0) / features.length;

    return {
      avgResponseTime: Math.round(avgResponseTime),
      cacheHitRate: Math.round(cacheHitRate * 10) / 10,
      avgAccuracy: Math.round(avgAccuracy * 10) / 10,
      activeFeatures: features.filter(f => f.status === 'active').length,
      totalFeatures: features.length
    };
  }, [features]);

  // Auto-refresh every 30 seconds for active monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRefreshing && selectedTab === 'overview') {
        refreshAllFeatures();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isRefreshing, selectedTab, refreshAllFeatures]);

  const renderFeatureCard = (feature: GodTierFeature) => {
    const getLoader = () => {
      switch (feature.id) {
        case 'quantum': return <QuantumSimulationLoader />;
        case 'reality': return <RealityFabricatorLoader />;
        case 'consciousness': return <ConsciousnessLoader />;
        case 'hipaa': return <HipaaComplianceLoader />;
        default: return <div>Loading...</div>;
      }
    };

    if (feature.status === 'loading') {
      return (
        <div key={feature.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {getLoader()}
        </div>
      );
    }

    const statusColors = {
      active: 'text-green-600 bg-green-100',
      error: 'text-red-600 bg-red-100',
      loading: 'text-blue-600 bg-blue-100'
    };

    return (
      <div key={feature.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature.name}</h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[feature.status]}`}>
                God-Tier
              </span>
              <span className="text-sm text-gray-500">
                {feature.accuracy}% accuracy
              </span>
            </div>
          </div>
          <button
            onClick={() => refreshFeature(feature.id)}
            disabled={feature.status === 'loading'}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Performance</span>
            <span className={`text-sm font-medium ${
              feature.status === 'active' ? 'text-green-600' : 'text-red-600'
            }`}>
              {feature.status === 'active' ? 'Optimal' : 'Issues Detected'}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                feature.status === 'active' ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-red-400'
              }`}
              style={{ width: `${feature.accuracy}%` }}
            ></div>
          </div>

          {feature.lastUpdated && (
            <div className="text-xs text-gray-500">
              Last updated: {new Date(feature.lastUpdated).toLocaleTimeString()}
            </div>
          )}

          <PerformanceMetrics
            responseTime={feature.responseTime}
            cacheHit={feature.cacheHit}
            accuracy={feature.accuracy}
          />
        </div>
      </div>
    );
  };

  const renderPerformanceOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">Avg Response</h3>
            <p className="text-2xl font-bold text-blue-600">{performanceStats.avgResponseTime}ms</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">Cache Hit Rate</h3>
            <p className="text-2xl font-bold text-green-600">{performanceStats.cacheHitRate}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">Avg Accuracy</h3>
            <p className="text-2xl font-bold text-purple-600">{performanceStats.avgAccuracy}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-orange-100">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Features</h3>
            <p className="text-2xl font-bold text-orange-600">
              {performanceStats.activeFeatures}/{performanceStats.totalFeatures}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Toast Notifications */}
      {toasts.map(toast => (
        <ToastNotification
          key={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enhanced AI Intelligence</h1>
            <p className="text-gray-600 mt-2">God-tier features with real-time performance monitoring</p>
          </div>
          <button
            onClick={refreshAllFeatures}
            disabled={isRefreshing}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isRefreshing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
          >
            {isRefreshing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500 inline" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : (
              'Refresh All'
            )}
          </button>
        </div>

        {/* Performance Overview */}
        {renderPerformanceOverview()}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {features.map(renderFeatureCard)}
        </div>
      </div>
    </div>
  );
};

export default OptimizedDashboard;