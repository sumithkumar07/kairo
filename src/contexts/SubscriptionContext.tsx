
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { SubscriptionTier, SubscriptionFeatures } from '@/types/subscription';
import { FREE_TIER_FEATURES, PRO_TIER_FEATURES } from '@/types/subscription';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';


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
  isFirebaseConfigured: boolean;
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
    
    // In demo mode, always grant Pro Trial access
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
  
  const showFirebaseNotConfiguredToast = useCallback(() => {
    toast({
        title: 'Authentication Disabled',
        description: 'Firebase is not configured. Please set up your environment variables to enable user accounts.',
        variant: 'destructive',
    });
  }, [toast]);
  
  const signup = useCallback(async (email: string, password: string, redirectUrl?: string | null) => {
    if (typeof window === 'undefined' || !isFirebaseConfigured || !auth) {
        showFirebaseNotConfiguredToast();
        return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const newTrialEndDate = new Date();
      newTrialEndDate.setDate(newTrialEndDate.getDate() + 15);
      
      localStorage.setItem(`kairo_trialEnd_${firebaseUser.uid}`, newTrialEndDate.toISOString());
      localStorage.removeItem(`kairo_proStatus_${firebaseUser.uid}`);
      
      setUser({ email: firebaseUser.email!, uid: firebaseUser.uid });
      setTrialEndDate(newTrialEndDate);
      setHasPurchasedPro(false);

      toast({ title: 'Signup Successful!', description: 'Your 15-day Pro trial has started.' });
      router.push(redirectUrl || '/workflow');
    } catch (error: any) {
      console.error("Signup error", error);
      toast({ title: 'Signup Failed', description: error.message, variant: 'destructive' });
    }
  }, [toast, router, showFirebaseNotConfiguredToast]);

  const login = useCallback(async (email: string, password: string, redirectUrl?: string | null) => {
    if (typeof window === 'undefined' || !isFirebaseConfigured || !auth) {
        showFirebaseNotConfiguredToast();
        return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Login Successful!', description: 'Welcome back!' });
      router.push(redirectUrl || '/workflow');
    } catch (error: any) {
      console.error("Login error", error);
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    }
  }, [toast, router, showFirebaseNotConfiguredToast]);

  const logout = useCallback(async () => {
    if (user?.isDemoUser) {
        toast({ title: 'Demo Mode', description: 'Logout is not available in demo mode.' });
        return;
    }
    if (typeof window === 'undefined' || !isFirebaseConfigured || !auth) {
        showFirebaseNotConfiguredToast();
        return;
    }
    try {
      await signOut(auth);
      router.push('/');
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    } catch (error: any) {
      toast({ title: 'Logout Failed', description: error.message, variant: 'destructive' });
    }
  }, [toast, router, user, showFirebaseNotConfiguredToast]);

  const upgradeToPro = useCallback(() => {
    if (user?.isDemoUser) {
        toast({ title: 'Demo Mode', description: 'Cannot upgrade in demo mode.' });
        return;
    }
    if (typeof window === 'undefined' || !user || !isFirebaseConfigured) {
      showFirebaseNotConfiguredToast();
      router.push('/login');
      return;
    }
    setHasPurchasedPro(true);
    setTrialEndDate(null);
    localStorage.setItem(`kairo_proStatus_${user.uid}`, 'true');
    localStorage.removeItem(`kairo_trialEnd_${user.uid}`);
    toast({ title: 'Upgrade Successful!', description: 'You now have full access to Pro features.' });
  }, [user, toast, router, showFirebaseNotConfiguredToast]);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setUser(DEMO_USER);
      setIsAuthLoading(false);
      return;
    }
    
    if (!auth) {
        setIsAuthLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      setIsAuthLoading(true);
      if (firebaseUser && firebaseUser.email) {
        const storedProStatus = localStorage.getItem(`kairo_proStatus_${firebaseUser.uid}`);
        const storedTrialEnd = localStorage.getItem(`kairo_trialEnd_${firebaseUser.uid}`);
        
        setUser({ email: firebaseUser.email, uid: firebaseUser.uid });

        if (storedProStatus === 'true') {
          setHasPurchasedPro(true);
          setTrialEndDate(null);
        } else if (storedTrialEnd) {
          setTrialEndDate(new Date(storedTrialEnd));
        } else {
          setTrialEndDate(null);
          setHasPurchasedPro(false);
        }
      } else {
        setUser(null);
        setTrialEndDate(null);
        setHasPurchasedPro(false);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
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
      isFirebaseConfigured,
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
