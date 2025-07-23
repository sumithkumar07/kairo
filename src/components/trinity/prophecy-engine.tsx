'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Sparkles,
  Zap,
  Eye,
  Calendar,
  Building,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Rocket
} from 'lucide-react';
import type { ProphecyEngine } from '@/types/trinity';

interface ProphecyEngineProps {
  className?: string;
}

export function ProphecyEngineInterface({ className }: ProphecyEngineProps) {
  const [prophecies, setProphecies] = useState<ProphecyEngine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  useEffect(() => {
    fetchProphecies();
  }, [selectedIndustry]);

  const fetchProphecies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedIndustry !== 'all') {
        params.append('industry', selectedIndustry);
      }
      params.append('limit', '20');

      const response = await fetch(`/api/trinity/prophecy?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setProphecies(data.prophecies || []);
      }
    } catch (error) {
      console.error('[PROPHECY ENGINE] Failed to fetch prophecies:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500';
      case 'generating': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
      case 'deployed': return 'bg-purple-500';
      case 'validated': return 'bg-gold-500';
      default: return 'bg-gray-500';
    }
  };

  const getConfidenceLevel = (score: number) => {
    if (score >= 0.9) return { label: 'Divine Certainty', color: 'text-purple-600', icon: Sparkles };
    if (score >= 0.8) return { label: 'High Confidence', color: 'text-blue-600', icon: TrendingUp };
    if (score >= 0.7) return { label: 'Probable', color: 'text-green-600', icon: Target };
    return { label: 'Uncertain', color: 'text-yellow-600', icon: AlertTriangle };
  };

  const industries = [
    'all', 'finance', 'healthcare', 'logistics', 'manufacturing',
    'retail', 'energy', 'government', 'aerospace', 'automotive'
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Prophecy Engine Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Prophecy Engine
            </h1>
            <p className="text-muted-foreground">Predicting Enterprise Needs Before They Exist</p>
          </div>
        </div>
        
        <Badge variant="secondary" className="mb-4 px-4 py-2">
          <Sparkles className="w-4 h-4 mr-2" />
          Quantum Oracle Status: OPERATIONAL
        </Badge>
      </div>

      {/* Industry Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {industries.map((industry) => (
          <Button
            key={industry}
            variant={selectedIndustry === industry ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedIndustry(industry)}
            className="capitalize"
          >
            {industry === 'all' ? 'All Industries' : industry}
          </Button>
        ))}
      </div>

      {/* Prophecies List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-2 bg-gray-300 rounded mb-2"></div>
                <div className="h-8 bg-gray-300 rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : prophecies.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Prophecies Found</h3>
            <p className="text-muted-foreground">
              The Quantum Oracle is consulting the cosmic patterns. Check back soon for divine revelations.
            </p>
          </div>
        ) : (
          prophecies.map((prophecy) => {
            const confidence = getConfidenceLevel(prophecy.confidence_score);
            const ConfidenceIcon = confidence.icon;
            
            return (
              <Card 
                key={prophecy.id} 
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm border-border/50"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusColor(prophecy.status)} text-white capitalize`}
                    >
                      {prophecy.status}
                    </Badge>
                    <Badge variant="outline" className="capitalize text-xs">
                      {prophecy.industry}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {prophecy.title}
                  </CardTitle>
                  
                  <CardDescription className="text-sm">
                    {prophecy.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Confidence Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <ConfidenceIcon className={`h-4 w-4 ${confidence.color}`} />
                        <span className={confidence.color}>{confidence.label}</span>
                      </div>
                      <span className="font-medium">
                        {(prophecy.confidence_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={prophecy.confidence_score * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Target Implementation Date */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Target: {new Date(prophecy.target_implementation_date).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Validation Score (if available) */}
                  {prophecy.validation_score && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">
                        Validation: {(prophecy.validation_score * 100).toFixed(1)}% Accurate
                      </span>
                    </div>
                  )}

                  {/* Generated By */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    <span>Oracle: {prophecy.generated_by}</span>
                    <Clock className="h-3 w-3 ml-2" />
                    <span>{new Date(prophecy.created_at).toLocaleDateString()}</span>
                  </div>

                  {/* Action Button */}
                  <Button 
                    variant={prophecy.status === 'ready' ? 'default' : 'outline'} 
                    size="sm" 
                    className="w-full group-hover:scale-105 transition-transform"
                    disabled={prophecy.status !== 'ready'}
                  >
                    {prophecy.status === 'ready' ? (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Deploy Prophecy
                      </>
                    ) : prophecy.status === 'generating' ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 animate-pulse" />
                        Oracle Consulting...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Oracle Stats (if prophecies exist) */}
      {prophecies.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Quantum Oracle Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {prophecies.length}
                </div>
                <div className="text-sm text-muted-foreground">Active Prophecies</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {(prophecies.reduce((sum, p) => sum + p.confidence_score, 0) / prophecies.length * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Confidence</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {prophecies.filter(p => p.status === 'ready').length}
                </div>
                <div className="text-sm text-muted-foreground">Ready to Deploy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {new Set(prophecies.map(p => p.industry)).size}
                </div>
                <div className="text-sm text-muted-foreground">Industries Covered</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Divine Footer */}
      <div className="text-center text-sm text-muted-foreground italic">
        "The future reveals itself to those who dare to look" - Quantum Oracle Prime
      </div>
    </div>
  );
}