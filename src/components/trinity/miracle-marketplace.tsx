'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Store, 
  Star,
  Bitcoin,
  DollarSign,
  Zap,
  Crown,
  ShoppingCart,
  TrendingUp,
  Users,
  Award,
  Sparkles,
  Filter,
  Search,
  Heart,
  Download,
  Eye
} from 'lucide-react';
import type { Miracle } from '@/types/trinity';

interface MiracleMarketplaceProps {
  className?: string;
}

export function MiracleMarketplaceInterface({ className }: MiracleMarketplaceProps) {
  const [miracles, setMiracles] = useState<Miracle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('karma_score');
  const [showFeatured, setShowFeatured] = useState(false);
  const [showDivine, setShowDivine] = useState(false);

  useEffect(() => {
    fetchMiracles();
  }, [selectedCategory, sortBy, showFeatured, showDivine]);

  const fetchMiracles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (showFeatured) {
        params.append('featured', 'true');
      }
      if (showDivine) {
        params.append('divine', 'true');
      }
      params.append('sortBy', sortBy);
      params.append('limit', '20');

      const response = await fetch(`/api/trinity/miracles?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setMiracles(data.miracles || []);
      }
    } catch (error) {
      console.error('[MIRACLE MARKETPLACE] Failed to fetch miracles:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseMiracle = async (miracleId: string, miracle: Miracle) => {
    try {
      const paymentMethod = miracle.price_btc ? 'btc' : 'usd';
      
      const response = await fetch('/api/trinity/miracles/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          miracle_id: miracleId,
          payment_method: paymentMethod
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`🌟 ${data.divine_message}\n\n${data.deployment_instructions}\n\nKarma Reward: ${data.karma_blessing}`);
        fetchMiracles(); // Refresh the list
      } else {
        alert(`❌ Purchase failed: ${data.error}`);
      }
    } catch (error) {
      console.error('[MIRACLE MARKETPLACE] Purchase failed:', error);
      alert('❌ Divine transaction failed. Please try again.');
    }
  };

  const getMiracleTypeIcon = (type: string) => {
    switch (type) {
      case 'workflow': return Zap;
      case 'template': return Star;
      case 'integration': return ShoppingCart;
      case 'emergency_fix': return Crown;
      default: return Sparkles;
    }
  };

  const getMiracleTypeColor = (type: string) => {
    switch (type) {
      case 'workflow': return 'text-blue-600 bg-blue-100';
      case 'template': return 'text-purple-600 bg-purple-100';
      case 'integration': return 'text-green-600 bg-green-100';
      case 'emergency_fix': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  const categories = [
    'all', 'compliance', 'sales', 'logistics', 'finance', 'marketing',
    'hr', 'customer-service', 'data-processing', 'security', 'emergency-response'
  ];

  const filteredMiracles = miracles.filter(miracle =>
    miracle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    miracle.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Miracle Marketplace Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
            <Store className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Miracle Marketplace
            </h1>
            <p className="text-muted-foreground">Where Mortals Trade in Divine Automation</p>
          </div>
        </div>
        
        <Badge variant="secondary" className="mb-4 px-4 py-2">
          <Sparkles className="w-4 h-4 mr-2" />
          Marketplace Status: DIVINE_COMMERCE_ACTIVE
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search miracles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm capitalize"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.replace('-', ' ')}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="karma_score">Highest Karma</option>
              <option value="price_usd">Lowest Price</option>
              <option value="total_sales">Most Popular</option>
              <option value="created_at">Newest</option>
            </select>

            {/* Filter Toggles */}
            <div className="flex gap-2">
              <Button
                variant={showFeatured ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFeatured(!showFeatured)}
              >
                <Star className="h-4 w-4 mr-1" />
                Featured
              </Button>
              <Button
                variant={showDivine ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowDivine(!showDivine)}
              >
                <Crown className="h-4 w-4 mr-1" />
                Divine
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Miracles Grid */}
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
                <div className="h-8 bg-gray-300 rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredMiracles.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Miracles Found</h3>
            <p className="text-muted-foreground">
              The divine marketplace awaits your first miracle offering.
            </p>
          </div>
        ) : (
          filteredMiracles.map((miracle) => {
            const TypeIcon = getMiracleTypeIcon(miracle.miracle_type);
            const typeColor = getMiracleTypeColor(miracle.miracle_type);
            
            return (
              <Card 
                key={miracle.id} 
                className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                  miracle.is_divine ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200' :
                  miracle.is_featured ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200' :
                  'bg-gradient-to-br from-card via-card to-card/50'
                } backdrop-blur-sm border-border/50`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex gap-2">
                      {miracle.is_divine && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                          <Crown className="w-3 h-3 mr-1" />
                          DIVINE
                        </Badge>
                      )}
                      {miracle.is_featured && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <Badge variant="outline" className={`capitalize text-xs ${typeColor}`}>
                        <TypeIcon className="w-3 h-3 mr-1" />
                        {miracle.miracle_type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {miracle.title}
                  </CardTitle>
                  
                  <CardDescription className="text-sm">
                    {miracle.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Karma Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {renderStars(Math.floor(miracle.karma_score))}
                      </div>
                      <span className="text-sm font-medium">
                        {miracle.karma_score.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {miracle.total_sales} sales
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-lg font-bold">
                          ${miracle.price_usd.toLocaleString()}
                        </span>
                      </div>
                      {miracle.price_btc && (
                        <div className="flex items-center gap-1 text-sm text-orange-600">
                          <Bitcoin className="h-4 w-4" />
                          <span>{miracle.price_btc} BTC</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Creator earns: ${(miracle.price_usd * (1 - miracle.kairo_commission_rate)).toLocaleString()}
                      <span className="ml-2">
                        (Kairo: {(miracle.kairo_commission_rate * 100)}%)
                      </span>
                    </div>
                  </div>

                  {/* Category and Tags */}
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {miracle.category.replace('-', ' ')}
                    </Badge>
                    {miracle.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {miracle.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {miracle.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{miracle.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="default"
                      size="sm" 
                      className="flex-1 group-hover:scale-105 transition-transform"
                      onClick={() => purchaseMiracle(miracle.id, miracle)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Purchase
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-shrink-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-shrink-0"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Marketplace Stats */}
      {miracles.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Store className="h-5 w-5 text-green-500" />
              Divine Commerce Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {miracles.length}
                </div>
                <div className="text-sm text-muted-foreground">Active Miracles</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  ${miracles.reduce((sum, m) => sum + m.total_revenue, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {(miracles.reduce((sum, m) => sum + m.karma_score, 0) / miracles.length).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Karma Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {miracles.filter(m => m.is_divine).length}
                </div>
                <div className="text-sm text-muted-foreground">Divine Miracles</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {miracles.reduce((sum, m) => sum + m.total_sales, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Sales</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Miracle CTA */}
      <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white">
        <CardContent className="pt-6 text-center">
          <h3 className="text-xl font-bold mb-2">Ascend to Divine Creator Status</h3>
          <p className="mb-4 text-purple-100">
            Share your automation miracles with the world and earn divine rewards
          </p>
          <Button 
            variant="secondary" 
            size="lg"
            className="bg-white text-purple-600 hover:bg-purple-50"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Create Your First Miracle
          </Button>
        </CardContent>
      </Card>

      {/* Divine Footer */}
      <div className="text-center text-sm text-muted-foreground italic">
        "In the marketplace of miracles, every transaction is blessed" - Divine Commerce Codex 3:14
      </div>
    </div>
  );
}