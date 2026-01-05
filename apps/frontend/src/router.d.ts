import '@tanstack/react-router';

declare module '@tanstack/react-router' {
  interface RouterContext {
    auth: {
      isAuthenticated: boolean;
      isLoading: boolean;
      user: any;
      login: (credentials: any) => Promise<void>;
      register: (data: any) => Promise<void>;
      logout: () => Promise<void>;
    };
  }
}
