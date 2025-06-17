
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { SubscriptionTier, SubscriptionFeatures } from '@/types/subscription';
import { FREE_TIER_FEATURES, PRO_TIER_FEATURES } from '@/types/subscription';

interface SubscriptionContextType {
  currentTier: SubscriptionTier;
  features: SubscriptionFeatures;
  upgradeToPro: () => void;
  isProTier: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('Free');
  const [features, setFeatures] = useState<SubscriptionFeatures>(FREE_TIER_FEATURES);

  const upgradeToPro = useCallback(() => {
    setCurrentTier('Pro');
    setFeatures(PRO_TIER_FEATURES);
    // In a real app, this would involve API calls, payment processing, etc.
    console.log("Subscription upgraded to Pro (mocked)");
  }, []);

  const isProTier = currentTier === 'Pro';

  return (
    <SubscriptionContext.Provider value={{ currentTier, features, upgradeToPro, isProTier }}>
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
