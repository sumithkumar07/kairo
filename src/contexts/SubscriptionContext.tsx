
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { SubscriptionTier, SubscriptionFeatures } from '@/types/subscription';
import { FREE_TIER_FEATURES, PRO_TIER_FEATURES } from '@/types/subscription';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
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
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

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
        tier = 'Free';
        activeFeatures = FREE_TIER_FEATURES;
        isProEquivalent = false;
        daysLeft = 0;
      }
    }
    return { tier, features: activeFeatures, isProOrTrial: isProEquivalent, daysRemainingInTrial: daysLeft };
  }, [isLoggedIn, trialEndDate, hasPurchasedPro]);

  const { tier: currentTier, features, isProOrTrial, daysRemainingInTrial } = calculateCurrentTierAndFeatures();
  
  const signup = useCallback(async (email: string, password: string, redirectUrl?: string | null) => {
    if (typeof window === 'undefined') return;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const newTrialEndDate = new Date();
      newTrialEndDate.setDate(newTrialEndDate.getDate() + 15);
      
      localStorage.setItem(`kairo_trialEnd_${firebaseUser.uid}`, newTrialEndDate.toISOString());
      localStorage.removeItem(`kairo_proStatus_${firebaseUser.uid}`);
      
      // State will be set by onAuthStateChanged, but we can optimistically set it here for faster UI updates
      setUser({ email: firebaseUser.email!, uid: firebaseUser.uid });
      setTrialEndDate(newTrialEndDate);
      setHasPurchasedPro(false);

      toast({ title: 'Signup Successful!', description: 'Your 15-day Pro trial has started.' });
      router.push(redirectUrl || '/workflow');
    } catch (error: any) {
      console.error("Signup error", error);
      toast({ title: 'Signup Failed', description: error.message, variant: 'destructive' });
    }
  }, [toast, router]);

  const login = useCallback(async (email: string, password: string, redirectUrl?: string | null) => {
    if (typeof window === 'undefined') return;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting user state.
      toast({ title: 'Login Successful!', description: 'Welcome back!' });
      router.push(redirectUrl || '/workflow');
    } catch (error: any) {
      console.error("Login error", error);
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    }
  }, [toast, router]);

  const logout = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      await signOut(auth);
      // onAuthStateChanged will clear user state
      router.push('/');
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    } catch (error: any) {
      toast({ title: 'Logout Failed', description: error.message, variant: 'destructive' });
    }
  }, [toast, router]);

  const upgradeToPro = useCallback(() => {
    if (typeof window === 'undefined' || !user) {
      toast({ title: 'Login Required', description: 'Please log in or sign up to upgrade.', variant: 'destructive' });
      router.push('/login');
      return;
    }
    setHasPurchasedPro(true);
    setTrialEndDate(null);
    localStorage.setItem(`kairo_proStatus_${user.uid}`, 'true');
    localStorage.removeItem(`kairo_trialEnd_${user.uid}`);
    toast({ title: 'Upgrade Successful!', description: 'You now have full access to Pro features.' });
  }, [user, toast, router]);

  useEffect(() => {
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
          // Fallback for users that existed before trial logic, or if something was cleared.
          setTrialEndDate(null);
          setHasPurchasedPro(false);
        }
      } else {
        // User is signed out
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
      isAuthLoading
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
