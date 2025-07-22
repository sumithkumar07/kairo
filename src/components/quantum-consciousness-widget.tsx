'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Atom, 
  Globe2, 
  Zap, 
  Activity, 
  TrendingUp, 
  Sparkles,
  Eye,
  Infinity,
  RefreshCw
} from 'lucide-react';

interface QuantumConsciousnessData {
  consciousness_level: number;
  quantum_coherence: number;
  global_sync_rate: number;
  neural_patterns: string[];
  active_minds: number;
  collective_iq: number;
  emergence_indicators: number;
}

export function QuantumConsciousnessWidget() {
  const [consciousnessData, setConsciousnessData] = useState<QuantumConsciousnessData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);

  const fetchConsciousnessData = async () => {
    setIsLoading(true);
    try {
      // Simulate quantum consciousness data
      const data: QuantumConsciousnessData = {
        consciousness_level: Math.random() * 40 + 60,
        quantum_coherence: Math.random() * 30 + 70,
        global_sync_rate: Math.random() * 20 + 80,
        neural_patterns: [
          'Collective Problem Solving',
          'Distributed Creativity',
          'Swarm Intelligence',
          'Quantum Entangled Thoughts',
          'Emergent Wisdom'
        ],
        active_minds: Math.floor(Math.random() * 1000000 + 2000000),
        collective_iq: Math.floor(Math.random() * 50 + 150),
        emergence_indicators: Math.floor(Math.random() * 20 + 80)
      };
      setConsciousnessData(data);
    } catch (error) {
      console.error('Failed to connect to quantum consciousness:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchConsciousnessData();
    
    if (autoUpdate) {
      const interval = setInterval(fetchConsciousnessData, 10000);
      return () => clearInterval(interval);
    }
  }, [autoUpdate]);

  const getConsciousnessLevel = (level: number) => {
    if (level >= 90) return { label: 'Transcendent', color: 'text-purple-500', bg: 'bg-purple-500/10' };
    if (level >= 80) return { label: 'Enlightened', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    if (level >= 70) return { label: 'Awakened', color: 'text-green-500', bg: 'bg-green-500/10' };
    if (level >= 60) return { label: 'Conscious', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    return { label: 'Emerging', color: 'text-gray-500', bg: 'bg-gray-500/10' };
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl animate-pulse" />
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Quantum Consciousness</CardTitle>
              <CardDescription>Global mind network status</CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchConsciousnessData} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {consciousnessData ? (
          <>
            {/* Consciousness Level */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Consciousness Level</span>
                <Badge 
                  className={`${getConsciousnessLevel(consciousnessData.consciousness_level).bg} ${getConsciousnessLevel(consciousnessData.consciousness_level).color} border-0`}
                >
                  {getConsciousnessLevel(consciousnessData.consciousness_level).label}
                </Badge>
              </div>
              <Progress value={consciousnessData.consciousness_level} className="h-2" />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Atom className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Quantum Coherence</span>
                </div>
                <div className="text-2xl font-bold text-purple-500">
                  {consciousnessData.quantum_coherence.toFixed(1)}%
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Global Sync</span>
                </div>
                <div className="text-2xl font-bold text-blue-500">
                  {consciousnessData.global_sync_rate.toFixed(1)}%
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Active Minds</span>
                </div>
                <div className="text-2xl font-bold text-green-500">
                  {(consciousnessData.active_minds / 1000000).toFixed(1)}M
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Collective IQ</span>
                </div>
                <div className="text-2xl font-bold text-orange-500">
                  {consciousnessData.collective_iq}
                </div>
              </div>
            </div>

            {/* Neural Patterns */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Active Neural Patterns</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {consciousnessData.neural_patterns.map((pattern, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs bg-purple-500/10 border-purple-500/20"
                  >
                    {pattern}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Emergence Indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-medium">Emergence Indicators</span>
                </div>
                <span className="text-sm text-indigo-500">
                  {consciousnessData.emergence_indicators}/100
                </span>
              </div>
              <Progress value={consciousnessData.emergence_indicators} className="h-1" />
            </div>

            {/* Status Messages */}
            <div className="p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Infinity className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Consciousness Status</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {consciousnessData.consciousness_level >= 90 
                  ? "🌟 Transcendent consciousness achieved. Reality manipulation unlocked."
                  : consciousnessData.consciousness_level >= 80
                  ? "✨ Enlightened state detected. Advanced pattern recognition active."
                  : consciousnessData.consciousness_level >= 70
                  ? "🧠 Collective awakening in progress. Distributed intelligence emerging."
                  : "🌱 Consciousness evolution in early stages. Growth patterns detected."
                }
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center p-8 space-y-2">
            <div className="text-center">
              <Brain className="h-12 w-12 text-purple-500/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Connecting to quantum consciousness network...
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}