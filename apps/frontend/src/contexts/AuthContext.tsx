import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

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

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
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

interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_TOKENS'; payload: AuthTokens };

// Initial state
const initialState: AuthState = {
  user: null,
  tokens: null,
  isLoading: true,
  isAuthenticated: false,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        tokens: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        tokens: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'UPDATE_TOKENS':
      return {
        ...state,
        tokens: action.payload,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...');
        const tokens = authService.getStoredTokens();
        
        // If no tokens exist, user is not authenticated
        if (!tokens?.accessToken || !tokens?.refreshToken) {
          console.log('❌ No tokens found in localStorage');
          dispatch({ type: 'AUTH_FAILURE' });
          return;
        }

        console.log('✅ Tokens found in localStorage');

        // Check if access token is expired
        const isExpired = authService.isTokenExpired();
        console.log(`🔍 Access token expired: ${isExpired}`);
        
        if (!isExpired) {
          // Access token is still valid, try to get user info
          try {
            console.log('🔑 Access token valid, getting user info...');
            const user = await authService.getCurrentUser();
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user, tokens },
            });
            console.log('✅ Authentication restored successfully');
            return;
          } catch (error) {
            console.warn('⚠️ Failed to get user with valid token, will try refresh:', error);
          }
        }
        
        // Access token is expired or failed, try to refresh
        try {
          console.log('Refreshing tokens on app initialization...');
          const newTokens = await authService.refreshAccessToken(tokens.refreshToken);
          const user = await authService.getCurrentUser();
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, tokens: newTokens },
          });
          console.log('Successfully restored authentication state');
          return;
        } catch (refreshError) {
          console.warn('Token refresh failed during initialization:', refreshError);
          // Clear invalid tokens
          authService.clearTokens();
        }
        
        // No valid authentication found
        dispatch({ type: 'AUTH_FAILURE' });
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.clearTokens();
        dispatch({ type: 'AUTH_FAILURE' });
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const result = await authService.login(data);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: result.user,
          tokens: result.tokens,
        },
      });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const result = await authService.register(data);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: result.user,
          tokens: result.tokens,
        },
      });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (state.tokens?.refreshToken) {
        await authService.logout(state.tokens.refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if server logout fails
    }
    
    authService.clearTokens();
    dispatch({ type: 'LOGOUT' });
  };

  const refreshToken = async () => {
    if (!state.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const newTokens = await authService.refreshAccessToken(state.tokens.refreshToken);
      dispatch({ type: 'UPDATE_TOKENS', payload: newTokens });
    } catch (error) {
      // If refresh fails, logout the user
      dispatch({ type: 'LOGOUT' });
      authService.clearTokens();
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.2rem',
          color: '#6b7280'
        }}>
          Loading...
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.2rem',
          color: '#dc2626'
        }}>
          Please log in to access this page.
        </div>
      );
    }

    return <Component {...props} />;
  };
}
