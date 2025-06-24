
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { SubscriptionTier, SubscriptionFeatures } from '@/types/subscription';
import { FREE_TIER_FEATURES, PRO_TIER_FEATURES } from '@/types/subscription';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


interface User {
  email: string;
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
      } else if (trialEndDate && trialEndDate <= new Date()) {
        // Trial has expired, user is on Free tier
        tier = 'Free';
        activeFeatures = FREE_TIER_FEATURES;
        isProEquivalent = false;
        daysLeft = 0;
      }
    }
    return { tier, features: activeFeatures, isProOrTrial: isProEquivalent, daysRemainingInTrial: daysLeft };
  }, [isLoggedIn, trialEndDate, hasPurchasedPro]);

  const { tier: currentTier, features, isProOrTrial, daysRemainingInTrial } = calculateCurrentTierAndFeatures();
  
  const persistUserState = useCallback(() => {
    if (user?.email) {
      if (trialEndDate) {
        localStorage.setItem(`kairo_trialEnd_${user.email}`, trialEndDate.toISOString());
      } else {
        localStorage.removeItem(`kairo_trialEnd_${user.email}`);
      }
      localStorage.setItem(`kairo_proStatus_${user.email}`, String(hasPurchasedPro));
    }
  }, [user, trialEndDate, hasPurchasedPro]);
  
  useEffect(() => {
    // This effect runs whenever the user state changes, effectively saving their progress.
    persistUserState();
  }, [persistUserState]);


  const signup = useCallback((email: string) => {
    const newUser = { email };
    setIsLoggedIn(true);
    setUser(newUser);
    const newTrialEndDate = new Date();
    newTrialEndDate.setDate(newTrialEndDate.getDate() + 15);
    setTrialEndDate(newTrialEndDate);
    setHasPurchasedPro(false);

    localStorage.setItem(`kairo_trialEnd_${email}`, newTrialEndDate.toISOString());
    localStorage.removeItem(`kairo_proStatus_${email}`);

    toast({ title: 'Signup Successful!', description: 'Your 15-day Pro trial has started.' });
    router.push('/workflow');
  }, [toast, router]);

  const login = useCallback((email: string) => {
    const newUser = { email };
    setIsLoggedIn(true);
    setUser(newUser);

    const storedTrialEnd = localStorage.getItem(`kairo_trialEnd_${email}`);
    const storedProStatus = localStorage.getItem(`kairo_proStatus_${email}`);

    if (storedProStatus === 'true') {
        setHasPurchasedPro(true);
        setTrialEndDate(null);
        toast({ title: 'Login Successful!', description: 'Welcome back to your Pro account.'});
    } else if (storedTrialEnd) {
        const loadedTrialEnd = new Date(storedTrialEnd);
        setTrialEndDate(loadedTrialEnd);
        if (loadedTrialEnd > new Date()) {
          toast({ title: 'Login Successful!', description: 'Welcome back! Your Pro trial is active.' });
        } else {
          toast({ title: 'Login Successful!', description: 'Welcome back. Your trial has expired.' });
        }
    } else { // First time login for this email, start a new trial
        const newTrialEndDate = new Date();
        newTrialEndDate.setDate(newTrialEndDate.getDate() + 15);
        setTrialEndDate(newTrialEndDate);
        setHasPurchasedPro(false);
        localStorage.setItem(`kairo_trialEnd_${email}`, newTrialEndDate.toISOString());
        localStorage.removeItem(`kairo_proStatus_${email}`);
        toast({ title: 'Login Successful!', description: 'A new 15-day Pro trial has started.' });
    }
    router.push('/workflow');
  }, [toast, router]);


  const logout = useCallback(() => {
    // Persisting state is now handled by the useEffect hook.
    setIsLoggedIn(false);
    setUser(null);
    setTrialEndDate(null); 
    setHasPurchasedPro(false);
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/');
  }, [toast, router]);

  const upgradeToPro = useCallback(() => {
    if (!isLoggedIn || !user) {
      toast({ title: 'Login Required', description: 'Please log in or sign up to upgrade.', variant: 'destructive' });
      router.push('/login');
      return;
    }
    setHasPurchasedPro(true);
    setTrialEndDate(null);
    toast({ title: 'Upgrade Successful!', description: 'You now have full access to Pro features.' });
  }, [isLoggedIn, user, toast, router]);

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
