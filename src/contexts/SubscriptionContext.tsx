
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { SubscriptionTier, SubscriptionFeatures } from '@/types/subscription';
import { FREE_TIER_FEATURES, GOLD_TIER_FEATURES, DIAMOND_TIER_FEATURES } from '@/types/subscription';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import * as WorkflowStorage from '@/services/workflow-storage-service';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';


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
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasProFeatures: boolean;
  daysRemainingInTrial: number | null;
  isAuthLoading: boolean;
  isSupabaseConfigured: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('Free');
  const [features, setFeatures] = useState<SubscriptionFeatures>(FREE_TIER_FEATURES);
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null);
  const [hasProFeatures, setHasProFeatures] = useState(false);
  const [daysRemainingInTrial, setDaysRemainingInTrial] = useState<number | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  // Create the supabase client instance once, scoped to this provider.
  // This uses the recommended helper for client components.
  const [supabase] = useState(() => isSupabaseConfigured ? createClientComponentClient() : null);

  const isLoggedIn = !!user;

  const showSupabaseNotConfiguredToast = useCallback(() => {
    toast({
        title: 'Authentication Disabled',
        description: 'Supabase is not configured. Please set up your environment variables to enable user accounts.',
        variant: 'destructive',
    });
  }, [toast]);
  
  const updateUserStateFromSession = useCallback(async (currentSession: Session | null) => {
    const supabaseUser = currentSession?.user;

    if (supabaseUser?.email) {
      setUser({ email: supabaseUser.email, uid: supabaseUser.id });
      const profile = await WorkflowStorage.getUserProfile(supabaseUser.id);
      
      let tier: SubscriptionTier = 'Free';
      let features: SubscriptionFeatures = FREE_TIER_FEATURES;
      let pro = false;
      let trialEnd: Date | null = null;
      let daysLeft: number | null = null;
      
      if (profile) {
        trialEnd = profile.trial_end_date ? new Date(profile.trial_end_date) : null;

        if (profile.subscription_tier === 'Diamond') {
            tier = 'Diamond';
            features = DIAMOND_TIER_FEATURES;
            pro = true;
        } else if (profile.subscription_tier === 'Gold') {
            tier = 'Gold';
            features = GOLD_TIER_FEATURES;
            pro = true;
        } else if (trialEnd && trialEnd > new Date()) {
            tier = 'Gold Trial';
            features = GOLD_TIER_FEATURES;
            pro = true;
            const diffTime = trialEnd.getTime() - new Date().getTime();
            daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        } else {
             daysLeft = 0;
        }
      }
      
      setCurrentTier(tier);
      setFeatures(features);
      setHasProFeatures(pro);
      setTrialEndDate(trialEnd);
      setDaysRemainingInTrial(daysLeft);

    } else {
      setUser(null);
      setCurrentTier('Free');
      setFeatures(FREE_TIER_FEATURES);
      setHasProFeatures(false);
      setTrialEndDate(null);
      setDaysRemainingInTrial(null);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    if (!supabase) {
        showSupabaseNotConfiguredToast();
        return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
        toast({ title: 'Signup Failed', description: error.message, variant: 'destructive' });
        return;
    }
    toast({ title: 'Signup Successful!', description: 'Your 15-day Gold trial has started. Check your email to verify your account.' });
  }, [supabase, toast, showSupabaseNotConfiguredToast]);

  const login = useCallback(async (email: string, password: string) => {
    if (!supabase) {
        showSupabaseNotConfiguredToast();
        return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Login Successful!', description: 'Welcome back!' });
  }, [supabase, toast, showSupabaseNotConfiguredToast]);

  const logout = useCallback(async () => {
    if (!supabase) {
        showSupabaseNotConfiguredToast();
        return;
    }
    await supabase.auth.signOut();
    router.push('/');
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
  }, [supabase, toast, router, showSupabaseNotConfiguredToast]);

  useEffect(() => {
    if (!supabase) {
      setIsAuthLoading(false);
      return;
    }

    setIsAuthLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      await updateUserStateFromSession(session);
      setIsAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [updateUserStateFromSession, supabase]);

  return (
    <SubscriptionContext.Provider value={{ 
      currentTier, 
      features, 
      isLoggedIn, 
      user, 
      trialEndDate, 
      login, 
      signup, 
      logout, 
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

    