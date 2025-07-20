'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { signIn, signUp } from '@/lib/auth-client';

export interface SubscriptionLimits {
  workflows: number;
  monthlyRuns: number;
  monthlyGenerations: number;
  storageGB: number;
  collaborators: number;
  apiAccess: boolean;
  priority: 'low' | 'normal' | 'high';
}

export interface SubscriptionContextType {
  subscriptionTier: string;
  trialEndDate: Date | null;
  isTrialActive: boolean;
  limits: SubscriptionLimits;
  usage: {
    monthlyRuns: number;
    monthlyGenerations: number;
  };
  hasProFeatures: boolean;
  isGoldOrHigher: boolean;
  isDiamondOrTrial: boolean;
  isLoggedIn: boolean;
  user: any;
  loading: boolean;
  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  isAuthLoading: boolean;
  // Additional properties for compatibility
  currentTier: string;
  daysRemainingInTrial: number | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const SUBSCRIPTION_LIMITS: Record<string, SubscriptionLimits> = {
  Free: {
    workflows: 3,
    monthlyRuns: 100,
    monthlyGenerations: 10,
    storageGB: 1,
    collaborators: 0,
    apiAccess: false,
    priority: 'low'
  },
  Gold: {
    workflows: 20,
    monthlyRuns: 2000,
    monthlyGenerations: 100,
    storageGB: 10,
    collaborators: 3,
    apiAccess: true,
    priority: 'normal'
  },
  Diamond: {
    workflows: -1, // unlimited
    monthlyRuns: 10000,
    monthlyGenerations: 500,
    storageGB: 100,
    collaborators: 10,
    apiAccess: true,
    priority: 'high'
  },
  Trial: {
    workflows: -1, // unlimited during trial
    monthlyRuns: 1000,
    monthlyGenerations: 50,
    storageGB: 10,
    collaborators: 5,
    apiAccess: true,
    priority: 'high'
  }
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [subscriptionTier, setSubscriptionTier] = useState<string>('Free');
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null);
  const [usage, setUsage] = useState({
    monthlyRuns: 0,
    monthlyGenerations: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!isAuthenticated || !user?.id || authLoading) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch user profile
        const profileResponse = await fetch('/api/user/profile');
        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          setSubscriptionTier(profile.subscription_tier || 'Free');
          setTrialEndDate(profile.trial_end_date ? new Date(profile.trial_end_date) : null);
          setUsage({
            monthlyRuns: profile.monthly_workflow_runs || 0,
            monthlyGenerations: profile.monthly_ai_generations || 0
          });
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        // Set defaults on error
        setSubscriptionTier('Free');
        setTrialEndDate(null);
        setUsage({ monthlyRuns: 0, monthlyGenerations: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [isAuthenticated, user?.id, authLoading]);

  // Calculate derived values
  const isTrialActive = trialEndDate ? new Date() < trialEndDate : false;
  const effectiveTier = isTrialActive ? 'Trial' : subscriptionTier;
  const limits = SUBSCRIPTION_LIMITS[effectiveTier] || SUBSCRIPTION_LIMITS.Free;
  
  const hasProFeatures = ['Gold', 'Diamond', 'Trial'].includes(effectiveTier);
  const isGoldOrHigher = ['Gold', 'Diamond', 'Trial'].includes(effectiveTier);
  const isDiamondOrTrial = ['Diamond', 'Trial'].includes(effectiveTier);

  const value: SubscriptionContextType = {
    subscriptionTier: effectiveTier,
    trialEndDate,
    isTrialActive,
    limits,
    usage,
    hasProFeatures,
    isGoldOrHigher,
    isDiamondOrTrial,
    isLoggedIn: isAuthenticated,
    user,
    loading: loading || authLoading
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};