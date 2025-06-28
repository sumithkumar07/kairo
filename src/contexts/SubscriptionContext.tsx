
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { SubscriptionTier, SubscriptionFeatures } from '@/types/subscription';
import { FREE_TIER_FEATURES, PRO_TIER_FEATURES } from '@/types/subscription';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';


interface User {
  email: string;
  uid: string;
  isDemoUser?: boolean;
}

interface SubscriptionContextType {
  currentTier: SubscriptionTier;
  features: SubscriptionFeatures;
  isLoggedIn: boolean;
  user: User | null;
  trialEndDate: Date | null;
  hasPurchasedPro: boolean;
  login: (email: string, password: string, redirectUrl?: string | null) => Promise<void>;
  signup: (email: string, password: string, redirectUrl?: string | null) => Promise<void>;
  logout: () => void;
  upgradeToPro: () => void;
  isProOrTrial: boolean;
  daysRemainingInTrial: number | null;
  isAuthLoading: boolean;
  isSupabaseConfigured: boolean; // Changed from isFirebaseConfigured
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const DEMO_USER: User = {
  email: 'user@kairo.demo',
  uid: 'demo-user-uid',
  isDemoUser: true,
};


export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null);
  const [hasPurchasedPro, setHasPurchasedPro] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const isLoggedIn = !!user;

  const calculateCurrentTierAndFeatures = useCallback(() => {
    let tier: SubscriptionTier = 'Free';
    let activeFeatures = FREE_TIER_FEATURES;
    let isProEquivalent = false;
    let daysLeft: number | null = null;
    
    if (user?.isDemoUser) {
        tier = 'Pro Trial';
        activeFeatures = PRO_TIER_FEATURES;
        isProEquivalent = true;
        daysLeft = 15;
    } else if (isLoggedIn) {
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
        tier = 'Free';
        activeFeatures = FREE_TIER_FEATURES;
        isProEquivalent = false;
        daysLeft = 0;
      }
    }
    return { tier, features: activeFeatures, isProOrTrial: isProEquivalent, daysRemainingInTrial: daysLeft };
  }, [isLoggedIn, trialEndDate, hasPurchasedPro, user]);

  const { tier: currentTier, features, isProOrTrial, daysRemainingInTrial } = calculateCurrentTierAndFeatures();
  
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

      const newTrialEndDate = new Date();
      newTrialEndDate.setDate(newTrialEndDate.getDate() + 15);
      
      localStorage.setItem(`kairo_trialEnd_${data.user.id}`, newTrialEndDate.toISOString());
      localStorage.removeItem(`kairo_proStatus_${data.user.id}`);
      
      // setUser is handled by onAuthStateChange, but we can optimistically set it
      setUser({ email: data.user.email!, uid: data.user.id });
      setTrialEndDate(newTrialEndDate);
      setHasPurchasedPro(false);

      toast({ title: 'Signup Successful!', description: 'Your 15-day Pro trial has started. Check your email to verify your account.' });
      router.push(redirectUrl || '/workflow');
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
      router.push(redirectUrl || '/workflow');
    } catch (error: any) {
      console.error("Login error", error);
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    }
  }, [toast, router, showSupabaseNotConfiguredToast]);

  const logout = useCallback(async () => {
    if (user?.isDemoUser) {
        toast({ title: 'Demo Mode', description: 'Logout is not available in demo mode.' });
        return;
    }
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
  }, [toast, router, user, showSupabaseNotConfiguredToast]);

  const upgradeToPro = useCallback(() => {
    if (user?.isDemoUser) {
        toast({ title: 'Demo Mode', description: 'Cannot upgrade in demo mode.' });
        return;
    }
    if (!user || !isSupabaseConfigured) {
      showSupabaseNotConfiguredToast();
      router.push('/login');
      return;
    }
    setHasPurchasedPro(true);
    setTrialEndDate(null);
    localStorage.setItem(`kairo_proStatus_${user.uid}`, 'true');
    localStorage.removeItem(`kairo_trialEnd_${user.uid}`);
    toast({ title: 'Upgrade Successful!', description: 'You now have full access to Pro features.' });
  }, [user, toast, router, showSupabaseNotConfiguredToast]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setUser(DEMO_USER);
      setIsAuthLoading(false);
      return;
    }

    setIsAuthLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const supabaseUser = session?.user;
      if (supabaseUser && supabaseUser.email) {
        const storedProStatus = localStorage.getItem(`kairo_proStatus_${supabaseUser.id}`);
        const storedTrialEnd = localStorage.getItem(`kairo_trialEnd_${supabaseUser.id}`);
        
        setUser({ email: supabaseUser.email, uid: supabaseUser.id });

        if (storedProStatus === 'true') {
          setHasPurchasedPro(true);
          setTrialEndDate(null);
        } else if (storedTrialEnd) {
          setTrialEndDate(new Date(storedTrialEnd));
        } else {
          // If a user logs in for the first time without a trial date, start one.
          if(event === "SIGNED_IN" && !storedTrialEnd) {
              const newTrialEndDate = new Date();
              newTrialEndDate.setDate(newTrialEndDate.getDate() + 15);
              localStorage.setItem(`kairo_trialEnd_${supabaseUser.id}`, newTrialEndDate.toISOString());
              setTrialEndDate(newTrialEndDate);
          } else {
             setTrialEndDate(null);
          }
          setHasPurchasedPro(false);
        }
      } else {
        setUser(null);
        setTrialEndDate(null);
        setHasPurchasedPro(false);
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
      hasPurchasedPro,
      login, 
      signup, 
      logout, 
      upgradeToPro,
      isProOrTrial,
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
