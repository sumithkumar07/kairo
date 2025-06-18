
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { SubscriptionTier, SubscriptionFeatures } from '@/types/subscription';
import { FREE_TIER_FEATURES, PRO_TIER_FEATURES } from '@/types/subscription';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


interface User {
  email: string;
  // Add other user properties if needed
}

interface SubscriptionContextType {
  currentTier: SubscriptionTier;
  features: SubscriptionFeatures;
  isLoggedIn: boolean;
  user: User | null;
  trialEndDate: Date | null;
  hasPurchasedPro: boolean;
  login: (email: string) => void;
  signup: (email: string) => void;
  logout: () => void;
  upgradeToPro: () => void; // This now signifies purchasing Pro
  isProOrTrial: boolean;
  daysRemainingInTrial: number | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null);
  const [hasPurchasedPro, setHasPurchasedPro] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const calculateCurrentTierAndFeatures = useCallback(() => {
    let tier: SubscriptionTier = 'Free';
    let activeFeatures = FREE_TIER_FEATURES;
    let isProEquivalent = false;
    let daysLeft: number | null = null;

    if (isLoggedIn) {
      if (hasPurchasedPro) {
        tier = 'Pro';
        activeFeatures = PRO_TIER_FEATURES;
        isProEquivalent = true;
      } else if (trialEndDate && trialEndDate > new Date()) {
        tier = 'Pro Trial';
        activeFeatures = PRO_TIER_FEATURES;
        isProEquivalent = true;
        const diffTime = Math.abs(trialEndDate.getTime() - new Date().getTime());
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }
    return { tier, features: activeFeatures, isProOrTrial: isProEquivalent, daysRemainingInTrial: daysLeft };
  }, [isLoggedIn, trialEndDate, hasPurchasedPro]);

  const { tier: currentTier, features, isProOrTrial, daysRemainingInTrial } = calculateCurrentTierAndFeatures();
  
  // Effect to re-calculate if dependencies change (e.g., after login/logout)
  useEffect(() => {
    // This effect ensures `currentTier`, `features`, etc. are updated reactively
    // The actual values are derived in calculateCurrentTierAndFeatures and used directly
  }, [isLoggedIn, trialEndDate, hasPurchasedPro, calculateCurrentTierAndFeatures]);


  const signup = useCallback((email: string) => {
    setIsLoggedIn(true);
    setUser({ email });
    const newTrialEndDate = new Date();
    newTrialEndDate.setDate(newTrialEndDate.getDate() + 15);
    setTrialEndDate(newTrialEndDate);
    setHasPurchasedPro(false);
    toast({ title: 'Signup Successful!', description: 'Your 15-day Pro trial has started.' });
    router.push('/workflow');
  }, [toast, router]);

  const login = useCallback((email: string) => {
    setIsLoggedIn(true);
    setUser({ email });
    // For this mock: if user logs in and has no purchase/active trial, grant a new trial.
    // A real app would fetch subscription status from a backend.
    if (!hasPurchasedPro && (!trialEndDate || trialEndDate <= new Date())) {
      const newTrialEndDate = new Date();
      newTrialEndDate.setDate(newTrialEndDate.getDate() + 15);
      setTrialEndDate(newTrialEndDate);
      toast({ title: 'Login Successful!', description: 'Your 15-day Pro trial has started.' });
    } else if (hasPurchasedPro) {
      toast({ title: 'Login Successful!', description: 'Welcome back to your Pro account.'});
    } else if (trialEndDate && trialEndDate > new Date()) {
      toast({ title: 'Login Successful!', description: 'Welcome back! Your Pro trial is active.' });
    }
    router.push('/workflow');
  }, [hasPurchasedPro, trialEndDate, toast, router]);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    setTrialEndDate(null);
    setHasPurchasedPro(false); // User loses Pro status on logout in this mock
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/');
  }, [toast, router]);

  const upgradeToPro = useCallback(() => {
    if (!isLoggedIn) {
      toast({ title: 'Login Required', description: 'Please log in or sign up to upgrade.', variant: 'destructive' });
      router.push('/login');
      return;
    }
    setHasPurchasedPro(true);
    setTrialEndDate(null); // End trial upon purchasing Pro
    toast({ title: 'Upgrade Successful!', description: 'You now have full access to Pro features.' });
  }, [isLoggedIn, toast, router]);


  return (
    <SubscriptionContext.Provider value={{ 
      currentTier, 
      features, 
      isLoggedIn, 
      user, 
      trialEndDate, 
      hasPurchasedPro,
      login, 
      signup, 
      logout, 
      upgradeToPro, 
      isProOrTrial,
      daysRemainingInTrial
    }}>
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
