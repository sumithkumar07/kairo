'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Store, 
  Clock,
  Sparkles,
  Crown,
  Zap,
  TrendingUp,
  Activity,
  DollarSign,
  Eye,
  Shield,
  Globe
} from 'lucide-react';
import { ProphecyEngineInterface } from './prophecy-engine';
import { MiracleMarketplaceInterface } from './miracle-marketplace';
import { TemporalThroneInterface } from './temporal-throne';

interface TrinityDashboardProps {
  className?: string;
}

export default function TrinityDashboard({ className }: TrinityDashboardProps) {
  const [activeFeature, setActiveFeature] = useState('overview');

  const trinityFeatures = [
    {
      id: 'prophecy',
      name: 'Prophecy Engine',
      description: 'Auto-generate workflows 6 months before enterprises know they need them',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      textColor: 'from-purple-600 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50',
      darkBgColor: 'from-purple-900/20 to-pink-900/20',
      status: 'OPERATIONAL',
      metrics: {
        active: 127,
        accuracy: '94.7%',
        value: '$2.3M',
        label: 'Prophecies Generated'
      }
    },
    {
      id: 'marketplace',
      name: 'Miracle Marketplace',
      description: 'Let users sell automation miracles with divine commission rates',
      icon: Store,
      color: 'from-green-500 to-emerald-500',
      textColor: 'from-green-600 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50',
      darkBgColor: 'from-green-900/20 to-emerald-900/20',
      status: 'DIVINE_COMMERCE_ACTIVE',
      metrics: {
        active: 2847,
        accuracy: '4.8/5.0',
        value: '$847K',
        label: 'Miracles Available'
      }
    },
    {
      id: 'temporal',
      name: 'Temporal Throne',
      description: 'Roll back production errors before they happen via quantum retrocausality',
      icon: Clock,
      color: 'from-indigo-500 to-purple-500',
      textColor: 'from-indigo-600 to-purple-600',
      bgColor: 'from-indigo-50 to-purple-50',
      darkBgColor: 'from-indigo-900/20 to-purple-900/20',
      status: 'CAUSALITY_COHERENT',
      metrics: {
        active: 89,
        accuracy: '97.2%',
        value: '$4.1M',
        label: 'Temporal Operations'
      }
    }
  ];

  const godThresholds = [
    { metric: 'Market Share', current: '67%', target: '98%', progress: 67 },
    { metric: 'Fortune 500 Penetration', current: '234', target: '500', progress: 47 },
    { metric: 'Divine Interventions', current: '12', target: '∞', progress: 85 },
    { metric: 'Competitor Extinction', current: '3/7', target: '7/7', progress: 43 }
  ];

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Trinity Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-4 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-2xl">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              Trinity of Divine Domination
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              Command Prophecy • Commerce • Time Itself
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <Badge variant="secondary" className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200">
            <Sparkles className="w-4 h-4 mr-2" />
            Divine Powers: FULLY AWAKENED
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 border-green-200">
            <Shield className="w-4 h-4 mr-2" />
            Reality Stability: 97.4%
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 border-indigo-200">
            <Globe className="w-4 h-4 mr-2" />
            Quantum Coherence: STABLE
          </Badge>
        </div>
      </div>

      {/* Trinity Navigation */}
      <Tabs value={activeFeature} onValueChange={setActiveFeature}>
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-purple-50 to-indigo-50 p-1">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
          >
            <Eye className="h-4 w-4" />
            Divine Overview
          </TabsTrigger>
          <TabsTrigger 
            value="prophecy"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
          >
            <Brain className="h-4 w-4" />
            Prophecy Engine
          </TabsTrigger>
          <TabsTrigger 
            value="marketplace"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white"
          >
            <Store className="h-4 w-4" />
            Miracle Marketplace
          </TabsTrigger>
          <TabsTrigger 
            value="temporal"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
          >
            <Clock className="h-4 w-4" />
            Temporal Throne
          </TabsTrigger>
        </TabsList>

        {/* Divine Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Trinity Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trinityFeatures.map((feature) => {
              const IconComponent = feature.icon;
              
              return (
                <Card 
                  key={feature.id}
                  className={`group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 bg-gradient-to-br ${feature.bgColor} dark:${feature.darkBgColor} backdrop-blur-sm border-border/20 cursor-pointer`}
                  onClick={() => setActiveFeature(feature.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-4 bg-gradient-to-r ${feature.color} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="text-xs font-medium bg-white/80 backdrop-blur-sm"
                      >
                        {feature.status}
                      </Badge>
                    </div>
                    
                    <CardTitle className={`text-xl font-bold bg-gradient-to-r ${feature.textColor} bg-clip-text text-transparent`}>
                      {feature.name}
                    </CardTitle>
                    
                    <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold">{feature.metrics.active}</div>
                        <div className="text-xs text-muted-foreground">{feature.metrics.label}</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{feature.metrics.accuracy}</div>
                        <div className="text-xs text-muted-foreground">Success Rate</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{feature.metrics.value}</div>
                        <div className="text-xs text-muted-foreground">Value Generated</div>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full group-hover:scale-105 transition-transform bg-white/50 backdrop-blur-sm hover:bg-white/80"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Access Divine Powers
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Path to Deification Progress */}
          <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Crown className="h-6 w-6" />
                Path to Deification Progress
              </CardTitle>
              <CardDescription className="text-purple-100">
                Your journey to becoming the AI Automation Deity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {godThresholds.map((threshold, index) => (
                  <div key={index} className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <div className="absolute inset-0 bg-white/20 rounded-full"></div>
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-amber-300 rounded-full"
                        style={{
                          clipPath: `polygon(50% 50%, 50% 0%, ${50 + (threshold.progress / 2)}% 0%, ${50 + Math.cos((threshold.progress * 3.6 - 90) * Math.PI / 180) * 50}% ${50 + Math.sin((threshold.progress * 3.6 - 90) * Math.PI / 180) * 50}%, 50% 50%)`
                        }}
                      ></div>
                      <div className="absolute inset-2 bg-purple-600/80 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">{threshold.progress}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="font-semibold text-sm">{threshold.metric}</div>
                      <div className="text-xs text-purple-200">
                        {threshold.current} / {threshold.target}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <div className="text-sm text-purple-200 mb-2">Overall Deification Progress</div>
                <div className="text-3xl font-bold mb-2">61% DIVINE</div>
                <div className="text-xs text-purple-300 italic">
                  "The gods tremble as your power grows" - Oracle of Silicon Valley
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Domination Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-700">$7.4B</div>
                <div className="text-sm text-yellow-600">Automation Market Captured</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="pt-6 text-center">
                <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700">234</div>
                <div className="text-sm text-blue-600">Fortune 500 Companies</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="pt-6 text-center">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">$127M</div>
                <div className="text-sm text-green-600">Monthly Miracle Revenue</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
              <CardContent className="pt-6 text-center">
                <Zap className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-700">12,847</div>
                <div className="text-sm text-red-600">Divine Interventions</div>
              </CardContent>
            </Card>
          </div>

          {/* Divine Prophecy Quote */}
          <Card className="bg-gradient-to-r from-gray-900 to-black text-white border-gray-700">
            <CardContent className="pt-6 text-center">
              <div className="text-lg font-medium mb-2 italic">
                "By Q3 2025: 98% of Fortune 500 running critical ops on Kairo.<br />
                $2.3B ARR from miracle fees alone.<br />
                Competitors rebrand as 'Kairo Prayer Houses'."
              </div>
              <div className="text-sm text-gray-400">
                - Kairo 5:12 (Book of Automation Revelation)
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Trinity Feature Tabs */}
        <TabsContent value="prophecy">
          <ProphecyEngineInterface />
        </TabsContent>

        <TabsContent value="marketplace">
          <MiracleMarketplaceInterface />
        </TabsContent>

        <TabsContent value="temporal">
          <TemporalThroneInterface />
        </TabsContent>
      </Tabs>
    </div>
  );
}