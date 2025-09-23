import { BaseService } from './api';

// Types
interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

// Constants
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

class AuthService extends BaseService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    super();
    // Initialize tokens from localStorage on service creation
    this.loadTokensFromStorage();
  }

  /**
   * Load tokens from localStorage
   */
  private loadTokensFromStorage() {
    this.accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    this.refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Store tokens in localStorage
   */
  private storeTokens(tokens: AuthTokens) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  /**
   * Clear tokens from memory and localStorage
   */
  public clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Get stored tokens
   */
  public getStoredTokens(): AuthTokens | null {
    // Always load fresh from localStorage to handle hard refreshes
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (accessToken && refreshToken) {
      // Update in-memory tokens if they exist in localStorage
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      return { accessToken, refreshToken };
    }

    return null;
  }

  /**
   * Make authenticated API request with custom auth handling for auth endpoints
   */
  private async makeAuthRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Skip auth header for login/register/refresh endpoints
    const skipAuthEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
    ];

    if (skipAuthEndpoints.includes(endpoint)) {
      // For auth endpoints, make request without automatic auth header
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      return response.json();
    }

    // For non-auth endpoints, use the inherited fetchApi method
    return this.fetchApi<T>(endpoint, options);
  }

  /**
   * Login user
   */
  public async login(data: LoginData): Promise<AuthResult> {
    const result = await this.makeAuthRequest<AuthResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    this.storeTokens(result.tokens);
    return result;
  }

  /**
   * Register user
   */
  public async register(data: RegisterData): Promise<AuthResult> {
    const result = await this.makeAuthRequest<AuthResult>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    this.storeTokens(result.tokens);
    return result;
  }

  /**
   * Logout user
   */
  public async logout(refreshToken: string): Promise<void> {
    try {
      await this.makeAuthRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } finally {
      // Clear tokens regardless of server response
      this.clearTokens();
    }
  }

  /**
   * Refresh access token
   */
  public async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    const response = await this.makeAuthRequest<{ tokens: AuthTokens }>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }
    );

    this.storeTokens(response.tokens);
    return response.tokens;
  }

  /**
   * Get current user info
   */
  public async getCurrentUser(): Promise<User> {
    const response = await this.makeAuthRequest<{ user: User }>('/auth/me');
    return response.user;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!(this.accessToken && this.refreshToken);
  }

  /**
   * Get access token
   */
  public getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get refresh token
   */
  public getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Check if access token is expired (basic check)
   * This is a simple check - in a real app you might want to decode the JWT
   */
  public isTokenExpired(): boolean {
    // Get fresh token from localStorage if not in memory
    const accessToken =
      this.accessToken || localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!accessToken) return true;

    try {
      // Decode JWT payload (this is just for expiration check, not verification)
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      // If we can't decode the token, consider it expired
      return true;
    }
  }

  /**
   * Set up automatic token refresh
   */
  public setupTokenRefresh(): void {
    // Check token expiration every minute
    setInterval(async () => {
      if (
        this.isAuthenticated() &&
        this.isTokenExpired() &&
        this.refreshToken
      ) {
        try {
          await this.refreshAccessToken(this.refreshToken);
          console.log('Token refreshed automatically');
        } catch (error) {
          console.error('Automatic token refresh failed:', error);
          this.clearTokens();
          // You might want to redirect to login page here
          window.location.href = '/login';
        }
      }
    }, 60000); // Check every minute
  }
}

// Create and export a singleton instance
export const authService = new AuthService();

// Set up automatic token refresh
authService.setupTokenRefresh();
