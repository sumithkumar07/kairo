'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { SubscriptionTier, SubscriptionFeatures } from '@/types/subscription';
import { FREE_TIER_FEATURES, GOLD_TIER_FEATURES, DIAMOND_TIER_FEATURES } from '@/types/subscription';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signIn, signUp, signOut, setCookie, clearCookie } from '@/lib/auth-client';

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
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('Free');
  const [features, setFeatures] = useState<SubscriptionFeatures>(FREE_TIER_FEATURES);
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null);
  const [hasProFeatures, setHasProFeatures] = useState(false);
  const [daysRemainingInTrial, setDaysRemainingInTrial] = useState<number | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  const isLoggedIn = !!user;
  const isSupabaseConfigured = true; // Always true now with PostgreSQL

  const getUserProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/profile/${userId}`);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const updateUserStateFromUser = useCallback(async (currentUser: any) => {
    if (currentUser?.email) {
      setUser({ email: currentUser.email, uid: currentUser.id });
      
      try {
        const profile = await getUserProfile(currentUser.id);
        
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
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Set defaults on error
        setCurrentTier('Free');
        setFeatures(FREE_TIER_FEATURES);
        setHasProFeatures(false);
        setTrialEndDate(null);
        setDaysRemainingInTrial(null);
      }
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
    try {
      const { user, token } = await signUp(email, password);
      
      // Set cookie
      setCookie('session-token', token, 1);
      
      await updateUserStateFromUser(user);
      toast({ 
        title: 'Signup Successful!', 
        description: 'Your 15-day Gold trial has started. Welcome to Kairo!' 
      });
      
      router.push('/dashboard');
    } catch (error: any) {
      toast({ 
        title: 'Signup Failed', 
        description: error.message || 'Failed to create account', 
        variant: 'destructive' 
      });
    }
  }, [toast, router, updateUserStateFromUser]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { user, token } = await signIn(email, password);
      
      // Set cookie
      setCookie('session-token', token, 1);
      
      await updateUserStateFromUser(user);
      toast({ 
        title: 'Login Successful!', 
        description: 'Welcome back!' 
      });
      
      router.push('/dashboard');
    } catch (error: any) {
      toast({ 
        title: 'Login Failed', 
        description: error.message || 'Invalid credentials', 
        variant: 'destructive' 
      });
    }
  }, [toast, router, updateUserStateFromUser]);

  const logout = useCallback(async () => {
    try {
      await signOut();
      
      // Clear cookie
      clearCookie('session-token');
      
      setUser(null);
      setCurrentTier('Free');
      setFeatures(FREE_TIER_FEATURES);
      setHasProFeatures(false);
      setTrialEndDate(null);
      setDaysRemainingInTrial(null);
      
      router.push('/');
      toast({ 
        title: 'Logged Out', 
        description: 'You have been successfully logged out.' 
      });
    } catch (error: any) {
      toast({ 
        title: 'Logout Failed', 
        description: error.message || 'Failed to logout', 
        variant: 'destructive' 
      });
    }
  }, [toast, router]);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsAuthLoading(true);
        const currentUser = await getCurrentUser();
        await updateUserStateFromUser(currentUser);
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuth();
  }, [updateUserStateFromUser]);

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