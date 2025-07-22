/**
 * Enterprise SSO Configuration Component
 * Supports SAML, OIDC, and Active Directory integration
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Users, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Key,
  Globe,
  Building2,
  Lock,
  FileText,
  Download,
  Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oidc' | 'ldap';
  status: 'active' | 'inactive' | 'configured';
  users: number;
  lastSync?: string;
}

interface SSOConfiguration {
  saml: {
    entityId: string;
    ssoUrl: string;
    x509Certificate: string;
    nameIdFormat: string;
    signRequests: boolean;
    attributeMapping: Record<string, string>;
  };
  oidc: {
    clientId: string;
    clientSecret: string;
    discoveryUrl: string;
    scopes: string[];
    redirectUri: string;
  };
  ldap: {
    serverUrl: string;
    baseDn: string;
    bindDn: string;
    bindPassword: string;
    userFilter: string;
    groupFilter: string;
  };
}

const defaultConfig: SSOConfiguration = {
  saml: {
    entityId: 'kairo-ai',
    ssoUrl: '',
    x509Certificate: '',
    nameIdFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress',
    signRequests: true,
    attributeMapping: {
      email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
      firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
      lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'
    }
  },
  oidc: {
    clientId: '',
    clientSecret: '',
    discoveryUrl: '',
    scopes: ['openid', 'email', 'profile'],
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/oidc/callback`
  },
  ldap: {
    serverUrl: '',
    baseDn: '',
    bindDn: '',
    bindPassword: '',
    userFilter: '(objectClass=person)',
    groupFilter: '(objectClass=group)'
  }
};

export default function SSOConfiguration() {
  const [config, setConfig] = useState<SSOConfiguration>(defaultConfig);
  const [providers, setProviders] = useState<SSOProvider[]>([
    {
      id: '1',
      name: 'Microsoft Active Directory',
      type: 'saml',
      status: 'configured',
      users: 150,
      lastSync: '2024-01-20T10:30:00Z'
    },
    {
      id: '2',
      name: 'Google Workspace',
      type: 'oidc',
      status: 'active',
      users: 89,
      lastSync: '2024-01-20T09:15:00Z'
    },
    {
      id: '3',
      name: 'Auth0',
      type: 'oidc',
      status: 'inactive',
      users: 0
    }
  ]);
  
  const [selectedProvider, setSelectedProvider] = useState<string>('saml');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveConfiguration = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Configuration Saved",
        description: "SSO configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save SSO configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async (providerId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Connection Test Successful",
        description: "SSO provider connection is working correctly.",
      });
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: "Unable to connect to SSO provider.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard.",
    });
  };

  const getStatusBadge = (status: SSOProvider['status']) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      configured: 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge className={variants[status]}>
        {status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
        {status === 'inactive' && <AlertCircle className="w-3 h-3 mr-1" />}
        {status === 'configured' && <Settings className="w-3 h-3 mr-1" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise SSO</h1>
          <p className="text-muted-foreground">
            Configure Single Sign-On for your organization using SAML, OIDC, or LDAP
          </p>
        </div>
        <Button onClick={handleSaveConfiguration} disabled={isLoading}>
          <Shield className="w-4 h-4 mr-2" />
          Save Configuration
        </Button>
      </div>

      {/* SSO Providers Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            SSO Providers
          </CardTitle>
          <CardDescription>
            Manage your organization's SSO providers and user access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {providers.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-muted">
                    {provider.type === 'saml' && <FileText className="w-5 h-5" />}
                    {provider.type === 'oidc' && <Globe className="w-5 h-5" />}
                    {provider.type === 'ldap' && <Building2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-medium">{provider.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {provider.type.toUpperCase()} • {provider.users} users
                      {provider.lastSync && (
                        <> • Last sync: {new Date(provider.lastSync).toLocaleString()}</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(provider.status)}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleTestConnection(provider.id)}
                    disabled={isLoading}
                  >
                    Test Connection
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      <Tabs value={selectedProvider} onValueChange={setSelectedProvider}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="saml" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            SAML 2.0
          </TabsTrigger>
          <TabsTrigger value="oidc" className="flex items-center">
            <Globe className="w-4 h-4 mr-2" />
            OpenID Connect
          </TabsTrigger>
          <TabsTrigger value="ldap" className="flex items-center">
            <Building2 className="w-4 h-4 mr-2" />
            LDAP/AD
          </TabsTrigger>
        </TabsList>

        {/* SAML Configuration */}
        <TabsContent value="saml" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SAML 2.0 Configuration</CardTitle>
              <CardDescription>
                Configure SAML Single Sign-On with your identity provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Provide these details to your identity provider:
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">ACS URL:</span>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs">{process.env.NEXT_PUBLIC_APP_URL}/auth/saml/acs</code>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => copyToClipboard(`${process.env.NEXT_PUBLIC_APP_URL}/auth/saml/acs`)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">Entity ID:</span>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs">kairo-ai</code>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => copyToClipboard('kairo-ai')}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entityId">Entity ID</Label>
                  <Input
                    id="entityId"
                    value={config.saml.entityId}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      saml: { ...prev.saml, entityId: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ssoUrl">SSO URL</Label>
                  <Input
                    id="ssoUrl"
                    placeholder="https://your-idp.com/saml/sso"
                    value={config.saml.ssoUrl}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      saml: { ...prev.saml, ssoUrl: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificate">X.509 Certificate</Label>
                <textarea
                  id="certificate"
                  className="w-full h-32 px-3 py-2 text-sm border rounded-md resize-none"
                  placeholder="-----BEGIN CERTIFICATE-----
MIICXjCCAcegAwIBAgIJAK..."
                  value={config.saml.x509Certificate}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    saml: { ...prev.saml, x509Certificate: e.target.value }
                  }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="signRequests"
                  checked={config.saml.signRequests}
                  onCheckedChange={(checked) => setConfig(prev => ({
                    ...prev,
                    saml: { ...prev.saml, signRequests: checked }
                  }))}
                />
                <Label htmlFor="signRequests">Sign SAML requests</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OIDC Configuration */}
        <TabsContent value="oidc" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>OpenID Connect Configuration</CardTitle>
              <CardDescription>
                Configure OpenID Connect with your identity provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    value={config.oidc.clientId}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      oidc: { ...prev.oidc, clientId: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientSecret">Client Secret</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    value={config.oidc.clientSecret}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      oidc: { ...prev.oidc, clientSecret: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discoveryUrl">Discovery URL</Label>
                <Input
                  id="discoveryUrl"
                  placeholder="https://your-provider.com/.well-known/openid_configuration"
                  value={config.oidc.discoveryUrl}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    oidc: { ...prev.oidc, discoveryUrl: e.target.value }
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LDAP Configuration */}
        <TabsContent value="ldap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>LDAP / Active Directory Configuration</CardTitle>
              <CardDescription>
                Configure LDAP authentication with your directory service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serverUrl">Server URL</Label>
                  <Input
                    id="serverUrl"
                    placeholder="ldap://your-dc.company.com:389"
                    value={config.ldap.serverUrl}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      ldap: { ...prev.ldap, serverUrl: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baseDn">Base DN</Label>
                  <Input
                    id="baseDn"
                    placeholder="dc=company,dc=com"
                    value={config.ldap.baseDn}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      ldap: { ...prev.ldap, baseDn: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}