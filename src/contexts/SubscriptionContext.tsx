
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { SubscriptionTier, SubscriptionFeatures } from '@/types/subscription';
import { FREE_TIER_FEATURES, GOLD_TIER_FEATURES, DIAMOND_TIER_FEATURES } from '@/types/subscription';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import * as WorkflowStorage from '@/services/workflow-storage-service';


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
  login: (email: string, password: string, redirectUrl?: string | null) => Promise<void>;
  signup: (email: string, password: string, redirectUrl?: string | null) => Promise<void>;
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
  
  const signup = useCallback(async (email: string, password: string, redirectUrl?: string | null) => {
    if (!isSupabaseConfigured || !supabase) {
        showSupabaseNotConfiguredToast();
        return;
    }
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("Signup did not return a user.");

      // The onAuthStateChange listener will handle profile creation for the new user.
      toast({ title: 'Signup Successful!', description: 'Your 15-day Gold trial has started. Check your email to verify your account.' });
      router.push(redirectUrl || '/dashboard');

    } catch (error: any) {
      console.error("Signup error", error);
      toast({ title: 'Signup Failed', description: error.message, variant: 'destructive' });
    }
  }, [toast, router, showSupabaseNotConfiguredToast]);

  const login = useCallback(async (email: string, password: string, redirectUrl?: string | null) => {
    if (!isSupabaseConfigured || !supabase) {
        showSupabaseNotConfiguredToast();
        return;
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: 'Login Successful!', description: 'Welcome back!' });
      router.push(redirectUrl || '/dashboard');
    } catch (error: any) {
      console.error("Login error", error);
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    }
  }, [toast, router, showSupabaseNotConfiguredToast]);

  const logout = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
        showSupabaseNotConfiguredToast();
        return;
    }
    try {
      await supabase.auth.signOut();
      router.push('/');
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    } catch (error: any) {
      toast({ title: 'Logout Failed', description: error.message, variant: 'destructive' });
    }
  }, [toast, router, showSupabaseNotConfiguredToast]);

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
      const supabaseUser = session?.user;

      if (supabaseUser && supabaseUser.email) {
        // The database trigger now handles profile creation automatically.
        // We just need to fetch it.
        const profile = await WorkflowStorage.getUserProfile(supabaseUser.id);
        
        if (profile) {
            setUser({ email: supabaseUser.email, uid: supabaseUser.id });
            const tier = profile.subscription_tier;
            if (tier === 'Gold' || tier === 'Diamond') {
                setPurchasedTier(tier);
                setTrialEndDate(null);
            } else {
                setPurchasedTier(null);
                setTrialEndDate(profile.trial_end_date ? new Date(profile.trial_end_date) : null);
            }
        } else {
          // This case might happen with replication lag on a very fresh signup.
          // The user will be in a logged-out state until the next check. A page refresh
          // would likely fix it. For now, we clear the local state.
          console.warn(`[AUTH] Profile for user ${supabaseUser.id} not found immediately. This might be temporary.`);
          setUser(null);
          setTrialEndDate(null);
          setPurchasedTier(null);
        }
      } else {
        setUser(null);
        setTrialEndDate(null);
        setPurchasedTier(null);
      }
      setIsAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
