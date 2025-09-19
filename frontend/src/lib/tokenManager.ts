import type { FormRespondent } from '../types';

export interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  tokenType: 'bearer' | 'msal';
  user?: FormRespondent;
}

export interface TokenManagerConfig {
  refreshThreshold: number; // Minutes before expiry to trigger refresh
  maxRetries: number;
  storageKey: string;
  msalFallback: () => Promise<string | null>;
}

class TokenManager {
  private tokenInfo: TokenInfo | null = null;
  private refreshPromise: Promise<string | null> | null = null;
  private config: TokenManagerConfig;
  private refreshQueue: Array<{
    resolve: (token: string | null) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(config: TokenManagerConfig) {
    this.config = config;
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as TokenInfo;
        if (this.isTokenValid(parsed)) {
          this.tokenInfo = parsed;
        } else {
          this.clearStoredToken();
        }
      }
    } catch (error) {
      console.error('Error loading token from storage:', error);
      this.clearStoredToken();
    }
  }

  private saveTokenToStorage(tokenInfo: TokenInfo): void {
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(tokenInfo));
      this.tokenInfo = tokenInfo;
    } catch (error) {
      console.error('Error saving token to storage:', error);
    }
  }

  private clearStoredToken(): void {
    localStorage.removeItem(this.config.storageKey);
    localStorage.removeItem('auth_token'); // Legacy token
    this.tokenInfo = null;
  }

  private isTokenValid(tokenInfo: TokenInfo): boolean {
    if (!tokenInfo || !tokenInfo.accessToken) return false;

    const now = Date.now();
    const expiresAt = tokenInfo.expiresAt;

    // Check if token is expired
    return expiresAt > now;
  }

  private shouldRefreshToken(tokenInfo: TokenInfo): boolean {
    if (!this.isTokenValid(tokenInfo)) return true;

    const now = Date.now();
    const expiresAt = tokenInfo.expiresAt;
    const refreshThreshold = this.config.refreshThreshold * 60 * 1000; // Convert to ms

    // Check if token expires within the threshold
    return (expiresAt - now) <= refreshThreshold;
  }

  public setToken(
    accessToken: string,
    options: {
      refreshToken?: string;
      expiresIn?: number; // seconds
      tokenType?: 'bearer' | 'msal';
      user?: FormRespondent;
    } = {}
  ): void {
    const {
      refreshToken,
      expiresIn = 3600, // Default 1 hour
      tokenType = 'bearer',
      user
    } = options;

    const expiresAt = Date.now() + (expiresIn * 1000);

    const tokenInfo: TokenInfo = {
      accessToken,
      refreshToken,
      expiresAt,
      tokenType,
      user
    };

    this.saveTokenToStorage(tokenInfo);

    // Also save to legacy storage for backward compatibility
    localStorage.setItem('auth_token', accessToken);
    if (user) {
      localStorage.setItem('rpa_user', JSON.stringify(user));
    }
  }

  public async getValidToken(): Promise<string | null> {
    // If no token, return null
    if (!this.tokenInfo) {
      return null;
    }

    // If token is valid and doesn't need refresh, return it
    if (this.isTokenValid(this.tokenInfo) && !this.shouldRefreshToken(this.tokenInfo)) {
      return this.tokenInfo.accessToken;
    }

    // If refresh is already in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Start refresh process
    return this.refreshToken();
  }

  public async refreshToken(): Promise<string | null> {
    // If refresh is already in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Create refresh promise
    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      this.refreshPromise = null;

      // Resolve any queued requests
      this.resolveRefreshQueue(result);

      return result;
    } catch (error) {
      this.refreshPromise = null;

      // Reject any queued requests
      this.rejectRefreshQueue(error);

      throw error;
    }
  }

  private async performTokenRefresh(): Promise<string | null> {
    if (!this.tokenInfo) {
      throw new Error('No token to refresh');
    }

    try {
      // Try backend refresh first if we have a refresh token
      if (this.tokenInfo.refreshToken && this.tokenInfo.tokenType === 'bearer') {
        const newToken = await this.refreshFromBackend();
        if (newToken) {
          return newToken;
        }
      }

      // Fallback to MSAL
      const msalToken = await this.config.msalFallback();
      if (msalToken) {
        this.setToken(msalToken, {
          tokenType: 'msal',
          user: this.tokenInfo.user
        });
        return msalToken;
      }

      // If all methods fail, clear token
      this.clearStoredToken();
      throw new Error('Token refresh failed');

    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearStoredToken();
      throw error;
    }
  }

  private async refreshFromBackend(): Promise<string | null> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/v1/api/'}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.tokenInfo?.refreshToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          this.setToken(data.token, {
            refreshToken: data.refreshToken || this.tokenInfo?.refreshToken,
            tokenType: 'bearer',
            user: this.tokenInfo?.user
          });
          return data.token;
        }
      }

      return null;
    } catch (error) {
      console.error('Backend token refresh failed:', error);
      return null;
    }
  }

  private resolveRefreshQueue(token: string | null): void {
    const queue = [...this.refreshQueue];
    this.refreshQueue = [];

    queue.forEach(({ resolve }) => resolve(token));
  }

  private rejectRefreshQueue(error: any): void {
    const queue = [...this.refreshQueue];
    this.refreshQueue = [];

    queue.forEach(({ reject }) => reject(error));
  }

  public queueRefreshRequest(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.refreshQueue.push({ resolve, reject });
    });
  }

  public getCurrentToken(): string | null {
    return this.tokenInfo?.accessToken || null;
  }

  public getTokenInfo(): TokenInfo | null {
    return this.tokenInfo;
  }

  public isAuthenticated(): boolean {
    return this.tokenInfo !== null && this.isTokenValid(this.tokenInfo);
  }

  public clearToken(): void {
    this.clearStoredToken();
    this.refreshPromise = null;
    this.refreshQueue = [];
  }

  public isRefreshing(): boolean {
    return this.refreshPromise !== null;
  }
}

// Singleton instance
let tokenManagerInstance: TokenManager | null = null;

export const initializeTokenManager = (config: TokenManagerConfig): TokenManager => {
  if (!tokenManagerInstance) {
    tokenManagerInstance = new TokenManager(config);
  }
  return tokenManagerInstance;
};

export const getTokenManager = (): TokenManager => {
  if (!tokenManagerInstance) {
    throw new Error('TokenManager not initialized. Call initializeTokenManager first.');
  }
  return tokenManagerInstance;
};

export default TokenManager;