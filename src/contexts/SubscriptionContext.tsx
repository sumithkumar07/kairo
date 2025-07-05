
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { SubscriptionTier, SubscriptionFeatures } from '@/types/subscription';
import { FREE_TIER_FEATURES, GOLD_TIER_FEATURES, DIAMOND_TIER_FEATURES } from '@/types/subscription';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import * as WorkflowStorage from '@/services/workflow-storage-service';
import type { Session } from '@supabase/supabase-js';


interface User {
  email: string;
  uid: string;
}

interface SubscriptionContextType {
  currentTier: SubscriptionTier;
  features: SubscriptionFeatures;
  isLoggedIn: boolean;
  user: User | null;
  trialEndDate: Date | null;
  purchasedTier: 'Gold' | 'Diamond' | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  upgradeToGold: () => void;
  upgradeToDiamond: () => void;
  hasProFeatures: boolean;
  daysRemainingInTrial: number | null;
  isAuthLoading: boolean;
  isSupabaseConfigured: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null);
  const [purchasedTier, setPurchasedTier] = useState<'Gold' | 'Diamond' | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const isLoggedIn = !!user;

  const calculateCurrentTierAndFeatures = useCallback(() => {
    let tier: SubscriptionTier = 'Free';
    let activeFeatures = FREE_TIER_FEATURES;
    let hasProFeatures = false;
    let daysLeft: number | null = null;
    
    if (isLoggedIn) {
      if (purchasedTier === 'Diamond') {
        tier = 'Diamond';
        activeFeatures = DIAMOND_TIER_FEATURES;
        hasProFeatures = true;
      } else if (purchasedTier === 'Gold') {
        tier = 'Gold';
        activeFeatures = GOLD_TIER_FEATURES;
        hasProFeatures = true; 
      } else if (trialEndDate && trialEndDate > new Date()) {
        tier = 'Gold Trial';
        activeFeatures = GOLD_TIER_FEATURES;
        hasProFeatures = true;
        const diffTime = trialEndDate.getTime() - new Date().getTime();
        daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      } else if (trialEndDate && trialEndDate <= new Date()) {
        tier = 'Free';
        activeFeatures = FREE_TIER_FEATURES;
        daysLeft = 0;
      }
    }
    return { tier, features: activeFeatures, hasProFeatures, daysRemainingInTrial: daysLeft };
  }, [isLoggedIn, trialEndDate, purchasedTier]);

  const { tier: currentTier, features, hasProFeatures, daysRemainingInTrial } = calculateCurrentTierAndFeatures();
  
  const showSupabaseNotConfiguredToast = useCallback(() => {
    toast({
        title: 'Authentication Disabled',
        description: 'Supabase is not configured. Please set up your environment variables to enable user accounts.',
        variant: 'destructive',
    });
  }, [toast]);
  
  const updateUserStateFromSession = useCallback(async (session: Session | null) => {
    const supabaseUser = session?.user;

    if (supabaseUser && supabaseUser.email) {
      // Set basic user info immediately from the session
      setUser({ email: supabaseUser.email, uid: supabaseUser.id });

      // Then, try to fetch the profile to get tier info.
      const profile = await WorkflowStorage.getUserProfile(supabaseUser.id);
      
      if (profile) {
        const tier = profile.subscription_tier;
        if (tier === 'Gold' || tier === 'Diamond') {
          setPurchasedTier(tier);
          setTrialEndDate(null);
        } else {
          setPurchasedTier(null);
          setTrialEndDate(profile.trial_end_date ? new Date(profile.trial_end_date) : null);
        }
      } else {
        // If profile doesn't exist yet (e.g., replication lag after signup),
        // DON'T log the user out. Just default to no purchased tier. The trial
        // logic will still be based on the profile, which may appear momentarily.
        console.warn(`[AUTH] Profile for user ${supabaseUser.id} not found. Defaulting to base state.`);
        setPurchasedTier(null);
        // We don't set trial end date here, as it comes from the profile.
        // It will be null until the profile is successfully fetched.
      }
    } else {
      // No user session, clear all user-related state.
      setUser(null);
      setTrialEndDate(null);
      setPurchasedTier(null);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
        showSupabaseNotConfiguredToast();
        return;
    }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
        toast({ title: 'Signup Failed', description: error.message, variant: 'destructive' });
        throw error;
    }
    toast({ title: 'Signup Successful!', description: 'Your 15-day Gold trial has started. Check your email to verify your account.' });
  }, [toast, showSupabaseNotConfiguredToast, supabase]);

  const login = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
        showSupabaseNotConfiguredToast();
        return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
      throw error;
    }
    toast({ title: 'Login Successful!', description: 'Welcome back!' });
  }, [toast, showSupabaseNotConfiguredToast, supabase]);

  const logout = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
        showSupabaseNotConfiguredToast();
        return;
    }
    await supabase.auth.signOut();
    router.push('/');
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
  }, [toast, router, showSupabaseNotConfiguredToast, supabase]);

  const upgradeToGold = useCallback(async () => {
    if (!user) {
        router.push('/login');
        return;
    }
    if (!isSupabaseConfigured) {
        showSupabaseNotConfiguredToast();
        return;
    }
    try {
        await WorkflowStorage.updateUserProfileTier(user.uid, 'Gold');
        setPurchasedTier('Gold');
        setTrialEndDate(null);
        toast({ title: 'Upgrade Successful!', description: 'You now have access to Gold features.' });
    } catch (e: any) {
        toast({ title: 'Upgrade Failed', description: e.message, variant: 'destructive' });
    }
  }, [user, toast, router, showSupabaseNotConfiguredToast]);

  const upgradeToDiamond = useCallback(async () => {
    if (!user) {
        router.push('/login');
        return;
    }
     if (!isSupabaseConfigured) {
        showSupabaseNotConfiguredToast();
        return;
    }
    try {
        await WorkflowStorage.updateUserProfileTier(user.uid, 'Diamond');
        setPurchasedTier('Diamond');
        setTrialEndDate(null);
        toast({ title: 'Upgrade Successful!', description: 'You now have full access to Diamond features.' });
    } catch (e: any) {
        toast({ title: 'Upgrade Failed', description: e.message, variant: 'destructive' });
    }
  }, [user, toast, router, showSupabaseNotConfiguredToast]);


  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsAuthLoading(false);
      return;
    }

    setIsAuthLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      await updateUserStateFromSession(session);
      setIsAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [updateUserStateFromSession, supabase, isSupabaseConfigured]);

  return (
    <SubscriptionContext.Provider value={{ 
      currentTier, 
      features, 
      isLoggedIn, 
      user, 
      trialEndDate, 
      purchasedTier,
      login, 
      signup, 
      logout, 
      upgradeToGold,
      upgradeToDiamond,
      hasProFeatures,
      daysRemainingInTrial,
      isAuthLoading,
      isSupabaseConfigured,
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
