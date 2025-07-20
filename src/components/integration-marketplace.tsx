'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Check, AlertCircle, ExternalLink, Zap, Settings, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { OAuthService, OAUTH_PROVIDERS } from '@/lib/oauth';
import { ConnectorBuilder, CONNECTOR_TEMPLATES } from '@/lib/connector-builder';
import { useToast } from '@/components/ui/use-toast';

interface IntegrationConnection {
  id: string;
  providerId: string;
  providerName: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
  credentialId?: string;
}

export default function IntegrationMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [showOAuthDialog, setShowOAuthDialog] = useState(false);
  const [showConnectorBuilder, setShowConnectorBuilder] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const oauthProviders = OAuthService.getProviders();
  const providersByCategory = OAuthService.getProvidersByCategory();
  const categories = ['All', ...Object.keys(providersByCategory)];

  // Filter providers based on search and category
  const filteredProviders = oauthProviders.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                           Object.entries(providersByCategory).some(([cat, providers]) => 
                             cat === selectedCategory && providers.some(p => p.id === provider.id));
    return matchesSearch && matchesCategory;
  });

  // Mock connections data
  useEffect(() => {
    setConnections([
      {
        id: '1',
        providerId: 'slack',
        providerName: 'Slack',
        status: 'connected',
        lastSync: new Date(),
        credentialId: 'cred_slack_1'
      },
      {
        id: '2',
        providerId: 'hubspot',
        providerName: 'HubSpot',
        status: 'connected',
        lastSync: new Date(Date.now() - 3600000),
        credentialId: 'cred_hubspot_1'
      }
    ]);
  }, []);

  const handleConnect = async (providerId: string) => {
    setIsConnecting(true);
    try {
      const response = await fetch(`/api/oauth/authorize/${providerId}`);
      const data = await response.json();
      
      if (data.success) {
        // Redirect to OAuth authorization URL
        window.location.href = data.authUrl;
      } else {
        toast({
          title: "Connection Failed",
          description: data.error || "Failed to initiate OAuth flow",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "An error occurred while connecting to the service",
        variant: "destructive",
      });
    }
    setIsConnecting(false);
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      // Call disconnect API
      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      toast({
        title: "Disconnected",
        description: "Integration has been disconnected successfully",
      });
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: "An error occurred while disconnecting",
        variant: "destructive",
      });
    }
  };

  const getConnectionStatus = (providerId: string) => {
    return connections.find(conn => conn.providerId === providerId);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Integration Marketplace</h1>
        <p className="text-muted-foreground">
          Connect your favorite apps and services to automate your workflows
        </p>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Integrations</TabsTrigger>
          <TabsTrigger value="connected">My Connections</TabsTrigger>
          <TabsTrigger value="custom">Custom Connectors</TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProviders.map(provider => {
              const connection = getConnectionStatus(provider.id);
              
              return (
                <Card key={provider.id} className="relative group hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold text-white"
                        style={{ backgroundColor: provider.color }}
                      >
                        {provider.icon}
                      </div>
                      {connection && (
                        <Badge variant={connection.status === 'connected' ? 'default' : 'destructive'}>
                          {connection.status === 'connected' ? (
                            <><Check className="w-3 h-3 mr-1" />Connected</>
                          ) : (
                            <><AlertCircle className="w-3 h-3 mr-1" />Error</>
                          )}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <CardDescription className="text-sm">
                      OAuth 2.0 • {provider.scopes.length} permissions
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">
                        Scopes: {provider.scopes.slice(0, 2).join(', ')}
                        {provider.scopes.length > 2 && ` +${provider.scopes.length - 2} more`}
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-4">
                    {connection ? (
                      <div className="w-full flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="w-4 h-4 mr-1" />
                          Settings
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDisconnect(connection.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => handleConnect(provider.id)}
                        disabled={isConnecting}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        {isConnecting ? 'Connecting...' : 'Connect'}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="connected">
          <div className="space-y-4">
            {connections.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No connections yet</h3>
                <p className="text-muted-foreground">
                  Connect your first integration to get started
                </p>
                <Button className="mt-4" onClick={() => setShowOAuthDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Connection
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connections.map(connection => {
                  const provider = oauthProviders.find(p => p.id === connection.providerId);
                  if (!provider) return null;

                  return (
                    <Card key={connection.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg text-white"
                              style={{ backgroundColor: provider.color }}
                            >
                              {provider.icon}
                            </div>
                            <div>
                              <h3 className="font-medium">{provider.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Last sync: {connection.lastSync?.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant={connection.status === 'connected' ? 'default' : 'destructive'}>
                            {connection.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardFooter>
                        <div className="w-full flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Settings className="w-4 h-4 mr-1" />
                            Configure
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Test
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDisconnect(connection.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="custom">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Custom Connectors</h2>
                <p className="text-muted-foreground">
                  Build custom integrations for any REST API
                </p>
              </div>
              <Button onClick={() => setShowConnectorBuilder(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Connector
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CONNECTOR_TEMPLATES.map(template => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-2">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg text-white"
                        style={{ backgroundColor: template.color }}
                      >
                        {template.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-medium">Actions:</span> {template.actions.length}
                      </div>
                      <div>
                        <span className="font-medium">Triggers:</span> {template.triggers.length}
                      </div>
                      <div>
                        <span className="font-medium">Auth:</span> {template.authType}
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* OAuth Connection Dialog */}
      <Dialog open={showOAuthDialog} onOpenChange={setShowOAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Integration</DialogTitle>
            <DialogDescription>
              Choose an integration to connect to your workflow
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {oauthProviders.slice(0, 6).map(provider => (
              <Button
                key={provider.id}
                variant="outline"
                className="h-16 flex flex-col items-center space-y-1"
                onClick={() => {
                  setSelectedProvider(provider.id);
                  handleConnect(provider.id);
                }}
              >
                <div 
                  className="w-6 h-6 rounded flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: provider.color }}
                >
                  {provider.icon}
                </div>
                <span className="text-xs">{provider.name}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Connector Builder Dialog */}
      <Dialog open={showConnectorBuilder} onOpenChange={setShowConnectorBuilder}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create Custom Connector</DialogTitle>
            <DialogDescription>
              Build a custom connector for any REST API
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="connector-name">Connector Name</Label>
                <Input id="connector-name" placeholder="My API Connector" />
              </div>
              <div>
                <Label htmlFor="base-url">Base URL</Label>
                <Input id="base-url" placeholder="https://api.example.com" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe what this connector does..." />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="auth-type">Authentication Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select auth type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apiKey">API Key</SelectItem>
                    <SelectItem value="bearerToken">Bearer Token</SelectItem>
                    <SelectItem value="basicAuth">Basic Auth</SelectItem>
                    <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crm">CRM</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="productivity">Productivity</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectorBuilder(false)}>
              Cancel
            </Button>
            <Button>
              Create Connector
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}