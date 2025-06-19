
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
  upgradeToPro: () => void; 
  forceEndTrial: () => void; // Added for dev/testing
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
        const diffTime = trialEndDate.getTime() - new Date().getTime();
        daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }
    }
    return { tier, features: activeFeatures, isProOrTrial: isProEquivalent, daysRemainingInTrial: daysLeft };
  }, [isLoggedIn, trialEndDate, hasPurchasedPro]);

  const { tier: currentTier, features, isProOrTrial, daysRemainingInTrial } = calculateCurrentTierAndFeatures();
  

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
    // Simulate loading persisted state - for a real app, this would come from a backend
    // For this demo, if they log in and don't have an active trial or pro, start/restart a trial.
    const storedTrialEnd = localStorage.getItem(`kairo_trialEnd_${email}`);
    const storedProStatus = localStorage.getItem(`kairo_proStatus_${email}`);

    let loadedTrialEnd = storedTrialEnd ? new Date(storedTrialEnd) : null;
    let loadedProStatus = storedProStatus === 'true';

    if (loadedProStatus) {
        setHasPurchasedPro(true);
        setTrialEndDate(null);
        toast({ title: 'Login Successful!', description: 'Welcome back to your Pro account.'});
    } else if (loadedTrialEnd && loadedTrialEnd > new Date()) {
        setHasPurchasedPro(false);
        setTrialEndDate(loadedTrialEnd);
        toast({ title: 'Login Successful!', description: 'Welcome back! Your Pro trial is active.' });
    } else { // No valid trial or pro status found, start a new trial
        const newTrialEndDate = new Date();
        newTrialEndDate.setDate(newTrialEndDate.getDate() + 15);
        setTrialEndDate(newTrialEndDate);
        setHasPurchasedPro(false);
        localStorage.setItem(`kairo_trialEnd_${email}`, newTrialEndDate.toISOString());
        localStorage.removeItem(`kairo_proStatus_${email}`); // ensure pro is off
        toast({ title: 'Login Successful!', description: 'Your 15-day Pro trial has started.' });
    }
    router.push('/workflow');
  }, [toast, router]);


  const logout = useCallback(() => {
    // Persist current user's subscription state before logging out
    if (user?.email) {
        if (trialEndDate) localStorage.setItem(`kairo_trialEnd_${user.email}`, trialEndDate.toISOString());
        else localStorage.removeItem(`kairo_trialEnd_${user.email}`);
        localStorage.setItem(`kairo_proStatus_${user.email}`, String(hasPurchasedPro));
    }

    setIsLoggedIn(false);
    setUser(null);
    setTrialEndDate(null); 
    setHasPurchasedPro(false);
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/');
  }, [user, trialEndDate, hasPurchasedPro, toast, router]);

  const upgradeToPro = useCallback(() => {
    if (!isLoggedIn || !user) {
      toast({ title: 'Login Required', description: 'Please log in or sign up to upgrade.', variant: 'destructive' });
      router.push('/login');
      return;
    }
    setHasPurchasedPro(true);
    setTrialEndDate(null); 
    localStorage.setItem(`kairo_proStatus_${user.email}`, 'true');
    localStorage.removeItem(`kairo_trialEnd_${user.email}`);
    toast({ title: 'Upgrade Successful!', description: 'You now have full access to Pro features.' });
  }, [isLoggedIn, user, toast, router]);

  const forceEndTrial = useCallback(() => {
    if (!isLoggedIn || !user) {
        toast({ title: 'Not Logged In', description: 'Cannot end trial if not logged in.', variant: 'destructive' });
        return;
    }
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Set to yesterday
    setTrialEndDate(pastDate);
    setHasPurchasedPro(false); // Ensure not marked as Pro
    localStorage.setItem(`kairo_trialEnd_${user.email}`, pastDate.toISOString());
    localStorage.setItem(`kairo_proStatus_${user.email}`, 'false');
    toast({ title: 'Developer Action', description: 'Pro Trial has been ended. You are now on the Free tier.' });
  }, [isLoggedIn, user, toast]);


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
      forceEndTrial, // Expose the new function
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
