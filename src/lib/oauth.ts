/**
 * OAuth Framework for One-Click Integration Authentication
 * Supports major platforms with standardized OAuth flows
 */

export interface OAuthProvider {
  id: string;
  name: string;
  type: 'oauth2' | 'oauth1';
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  redirectUri: string;
  clientIdEnv: string;
  clientSecretEnv: string;
  icon: string;
  color: string;
}

export interface OAuthCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scope?: string;
  tokenType?: string;
}

// OAuth Provider Configurations
export const OAUTH_PROVIDERS: Record<string, OAuthProvider> = {
  // CRM Providers
  salesforce: {
    id: 'salesforce',
    name: 'Salesforce',
    type: 'oauth2',
    authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
    tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
    scopes: ['api', 'refresh_token'],
    redirectUri: '/api/oauth/callback/salesforce',
    clientIdEnv: 'SALESFORCE_CLIENT_ID',
    clientSecretEnv: 'SALESFORCE_CLIENT_SECRET',
    icon: '🏢',
    color: '#00a1e0'
  },
  hubspot: {
    id: 'hubspot',
    name: 'HubSpot',
    type: 'oauth2',
    authUrl: 'https://app.hubspot.com/oauth/authorize',
    tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
    scopes: ['contacts', 'timeline', 'automation'],
    redirectUri: '/api/oauth/callback/hubspot',
    clientIdEnv: 'HUBSPOT_CLIENT_ID',
    clientSecretEnv: 'HUBSPOT_CLIENT_SECRET',
    icon: '🧡',
    color: '#ff7a59'
  },
  pipedrive: {
    id: 'pipedrive',
    name: 'Pipedrive',
    type: 'oauth2',
    authUrl: 'https://oauth.pipedrive.com/oauth/authorize',
    tokenUrl: 'https://oauth.pipedrive.com/oauth/token',
    scopes: ['deals:full', 'contacts:full', 'activities:full'],
    redirectUri: '/api/oauth/callback/pipedrive',
    clientIdEnv: 'PIPEDRIVE_CLIENT_ID',
    clientSecretEnv: 'PIPEDRIVE_CLIENT_SECRET',
    icon: '🔵',
    color: '#0d7377'
  },
  
  // Marketing Providers
  mailchimp: {
    id: 'mailchimp',
    name: 'Mailchimp',
    type: 'oauth2',
    authUrl: 'https://login.mailchimp.com/oauth2/authorize',
    tokenUrl: 'https://login.mailchimp.com/oauth2/token',
    scopes: ['lists:read', 'lists:write', 'campaigns:read'],
    redirectUri: '/api/oauth/callback/mailchimp',
    clientIdEnv: 'MAILCHIMP_CLIENT_ID',
    clientSecretEnv: 'MAILCHIMP_CLIENT_SECRET',
    icon: '🐵',
    color: '#ffe01b'
  },
  activecampaign: {
    id: 'activecampaign',
    name: 'ActiveCampaign',
    type: 'oauth2',
    authUrl: 'https://oauth.activecampaign.com/authorize',
    tokenUrl: 'https://oauth.activecampaign.com/token',
    scopes: ['contacts', 'campaigns', 'automations'],
    redirectUri: '/api/oauth/callback/activecampaign',
    clientIdEnv: 'ACTIVECAMPAIGN_CLIENT_ID',
    clientSecretEnv: 'ACTIVECAMPAIGN_CLIENT_SECRET',
    icon: '📧',
    color: '#356ae6'
  },

  // Productivity Providers  
  notion: {
    id: 'notion',
    name: 'Notion',
    type: 'oauth2',
    authUrl: 'https://api.notion.com/v1/oauth/authorize',
    tokenUrl: 'https://api.notion.com/v1/oauth/token',
    scopes: ['read', 'update', 'insert'],
    redirectUri: '/api/oauth/callback/notion',
    clientIdEnv: 'NOTION_CLIENT_ID',
    clientSecretEnv: 'NOTION_CLIENT_SECRET',
    icon: '📝',
    color: '#000000'
  },
  airtable: {
    id: 'airtable',
    name: 'Airtable',
    type: 'oauth2',
    authUrl: 'https://airtable.com/oauth2/v1/authorize',
    tokenUrl: 'https://airtable.com/oauth2/v1/token',
    scopes: ['data.records:read', 'data.records:write', 'schema.bases:read'],
    redirectUri: '/api/oauth/callback/airtable',
    clientIdEnv: 'AIRTABLE_CLIENT_ID',
    clientSecretEnv: 'AIRTABLE_CLIENT_SECRET',
    icon: '📊',
    color: '#18bfff'
  },
  googleworkspace: {
    id: 'googleworkspace',
    name: 'Google Workspace',
    type: 'oauth2',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/gmail.send'
    ],
    redirectUri: '/api/oauth/callback/google',
    clientIdEnv: 'GOOGLE_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
    icon: '📱',
    color: '#4285f4'
  },
  microsoft365: {
    id: 'microsoft365',
    name: 'Microsoft 365',
    type: 'oauth2',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scopes: [
      'https://graph.microsoft.com/Files.ReadWrite',
      'https://graph.microsoft.com/Calendars.ReadWrite',
      'https://graph.microsoft.com/Mail.Send'
    ],
    redirectUri: '/api/oauth/callback/microsoft',
    clientIdEnv: 'MICROSOFT_CLIENT_ID',
    clientSecretEnv: 'MICROSOFT_CLIENT_SECRET',
    icon: '🏢',
    color: '#0078d4'
  },

  // Communication Providers
  slack: {
    id: 'slack',
    name: 'Slack',
    type: 'oauth2',
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    scopes: ['chat:write', 'channels:read', 'users:read'],
    redirectUri: '/api/oauth/callback/slack',
    clientIdEnv: 'SLACK_CLIENT_ID',
    clientSecretEnv: 'SLACK_CLIENT_SECRET',
    icon: '💬',
    color: '#4a154b'
  },
  discord: {
    id: 'discord',
    name: 'Discord',
    type: 'oauth2',
    authUrl: 'https://discord.com/api/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    scopes: ['identify', 'guilds', 'messages.read'],
    redirectUri: '/api/oauth/callback/discord',
    clientIdEnv: 'DISCORD_CLIENT_ID',
    clientSecretEnv: 'DISCORD_CLIENT_SECRET',
    icon: '🎮',
    color: '#5865f2'
  },
  teams: {
    id: 'teams',
    name: 'Microsoft Teams',
    type: 'oauth2',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scopes: [
      'https://graph.microsoft.com/Chat.ReadWrite',
      'https://graph.microsoft.com/TeamMember.Read.All'
    ],
    redirectUri: '/api/oauth/callback/teams',
    clientIdEnv: 'TEAMS_CLIENT_ID',
    clientSecretEnv: 'TEAMS_CLIENT_SECRET',
    icon: '👥',
    color: '#464eb8'
  },

  // E-commerce Providers
  shopify: {
    id: 'shopify',
    name: 'Shopify',
    type: 'oauth2',
    authUrl: 'https://{shop}.myshopify.com/admin/oauth/authorize',
    tokenUrl: 'https://{shop}.myshopify.com/admin/oauth/access_token',
    scopes: ['read_orders', 'write_orders', 'read_products', 'write_products'],
    redirectUri: '/api/oauth/callback/shopify',
    clientIdEnv: 'SHOPIFY_CLIENT_ID',
    clientSecretEnv: 'SHOPIFY_CLIENT_SECRET',
    icon: '🛒',
    color: '#95bf47'
  },
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    type: 'oauth2',
    authUrl: 'https://connect.stripe.com/oauth/authorize',
    tokenUrl: 'https://connect.stripe.com/oauth/token',
    scopes: ['read_write'],
    redirectUri: '/api/oauth/callback/stripe',
    clientIdEnv: 'STRIPE_CLIENT_ID',
    clientSecretEnv: 'STRIPE_CLIENT_SECRET',
    icon: '💳',
    color: '#635bff'
  },

  // Social Media Providers
  twitter: {
    id: 'twitter',
    name: 'Twitter/X',
    type: 'oauth2',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scopes: ['tweet.read', 'tweet.write', 'users.read'],
    redirectUri: '/api/oauth/callback/twitter',
    clientIdEnv: 'TWITTER_CLIENT_ID',
    clientSecretEnv: 'TWITTER_CLIENT_SECRET',
    icon: '🐦',
    color: '#1da1f2'
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    type: 'oauth2',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social'],
    redirectUri: '/api/oauth/callback/linkedin',
    clientIdEnv: 'LINKEDIN_CLIENT_ID',
    clientSecretEnv: 'LINKEDIN_CLIENT_SECRET',
    icon: '💼',
    color: '#0077b5'
  }
};

/**
 * OAuth Service Class
 */
export class OAuthService {
  /**
   * Generate OAuth authorization URL
   */
  static generateAuthUrl(providerId: string, state?: string): string {
    const provider = OAUTH_PROVIDERS[providerId];
    if (!provider) {
      throw new Error(`OAuth provider ${providerId} not found`);
    }

    const clientId = process.env[provider.clientIdEnv];
    if (!clientId) {
      throw new Error(`Client ID not configured for ${provider.name}`);
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}${provider.redirectUri}`,
      scope: provider.scopes.join(' '),
      response_type: 'code',
      state: state || crypto.randomUUID()
    });

    return `${provider.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(
    providerId: string, 
    code: string, 
    state?: string
  ): Promise<OAuthCredentials> {
    const provider = OAUTH_PROVIDERS[providerId];
    if (!provider) {
      throw new Error(`OAuth provider ${providerId} not found`);
    }

    const clientId = process.env[provider.clientIdEnv];
    const clientSecret = process.env[provider.clientSecretEnv];
    
    if (!clientId || !clientSecret) {
      throw new Error(`OAuth credentials not configured for ${provider.name}`);
    }

    const tokenRequestBody = {
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}${provider.redirectUri}`,
    };

    try {
      const response = await fetch(provider.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams(tokenRequestBody).toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
      }

      const tokenData = await response.json();
      
      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_in ? 
          Date.now() + (tokenData.expires_in * 1000) : undefined,
        scope: tokenData.scope,
        tokenType: tokenData.token_type || 'Bearer'
      };
    } catch (error) {
      console.error(`OAuth token exchange error for ${provider.name}:`, error);
      throw new Error(`Failed to exchange code for token: ${error.message}`);
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(
    providerId: string, 
    refreshToken: string
  ): Promise<OAuthCredentials> {
    const provider = OAUTH_PROVIDERS[providerId];
    if (!provider) {
      throw new Error(`OAuth provider ${providerId} not found`);
    }

    const clientId = process.env[provider.clientIdEnv];
    const clientSecret = process.env[provider.clientSecretEnv];

    const refreshRequestBody = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    };

    try {
      const response = await fetch(provider.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams(refreshRequestBody).toString(),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const tokenData = await response.json();

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || refreshToken,
        expiresAt: tokenData.expires_in ? 
          Date.now() + (tokenData.expires_in * 1000) : undefined,
        scope: tokenData.scope,
        tokenType: tokenData.token_type || 'Bearer'
      };
    } catch (error) {
      console.error(`OAuth token refresh error for ${provider.name}:`, error);
      throw error;
    }
  }

  /**
   * Check if token needs refresh
   */
  static isTokenExpired(credentials: OAuthCredentials): boolean {
    if (!credentials.expiresAt) return false;
    
    // Refresh if token expires within next 5 minutes
    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
    return credentials.expiresAt < fiveMinutesFromNow;
  }

  /**
   * Get all available OAuth providers
   */
  static getProviders(): OAuthProvider[] {
    return Object.values(OAUTH_PROVIDERS);
  }

  /**
   * Get provider by ID
   */
  static getProvider(providerId: string): OAuthProvider | null {
    return OAUTH_PROVIDERS[providerId] || null;
  }

  /**
   * Get providers by category
   */
  static getProvidersByCategory(): Record<string, OAuthProvider[]> {
    const categories = {
      'CRM': ['salesforce', 'hubspot', 'pipedrive'],
      'Marketing': ['mailchimp', 'activecampaign'],
      'Productivity': ['notion', 'airtable', 'googleworkspace', 'microsoft365'],
      'Communication': ['slack', 'discord', 'teams'],
      'E-commerce': ['shopify', 'stripe'],
      'Social Media': ['twitter', 'linkedin']
    };

    const result: Record<string, OAuthProvider[]> = {};
    
    Object.entries(categories).forEach(([category, providerIds]) => {
      result[category] = providerIds
        .map(id => OAUTH_PROVIDERS[id])
        .filter(Boolean);
    });

    return result;
  }
}

/**
 * Database integration for OAuth credentials
 */
export interface StoredOAuthCredential {
  id: string;
  userId: string;
  providerId: string;
  providerName: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scope?: string;
  tokenType: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * OAuth Credential Manager
 */
export class OAuthCredentialManager {
  /**
   * Store OAuth credentials in database
   */
  static async storeCredentials(
    userId: string,
    providerId: string,
    credentials: OAuthCredentials
  ): Promise<string> {
    const provider = OAUTH_PROVIDERS[providerId];
    if (!provider) {
      throw new Error(`OAuth provider ${providerId} not found`);
    }

    // Here you would store in your database
    // For now, returning a mock credential ID
    const credentialId = `oauth_${providerId}_${Date.now()}`;
    
    // Store encrypted credentials in database
    // Implementation depends on your database choice
    
    return credentialId;
  }

  /**
   * Retrieve OAuth credentials from database
   */
  static async getCredentials(
    userId: string,
    providerId: string
  ): Promise<OAuthCredentials | null> {
    // Implementation depends on your database
    // Return stored credentials if found
    return null;
  }

  /**
   * Update OAuth credentials in database
   */
  static async updateCredentials(
    credentialId: string,
    credentials: OAuthCredentials
  ): Promise<void> {
    // Implementation depends on your database
    // Update existing credentials
  }

  /**
   * Delete OAuth credentials from database
   */
  static async deleteCredentials(
    userId: string,
    providerId: string
  ): Promise<void> {
    // Implementation depends on your database
    // Delete stored credentials
  }

  /**
   * List all OAuth connections for a user
   */
  static async listConnections(userId: string): Promise<StoredOAuthCredential[]> {
    // Implementation depends on your database
    // Return all OAuth connections for user
    return [];
  }
}