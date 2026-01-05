import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoginPage } from '../pages/LoginPage';

export const Route = createFileRoute('/login')({
  component: LoginPage,
  beforeLoad: async ({ context }) => {
    // @ts-ignore - context will be properly typed through router setup
    const { isAuthenticated, isLoading } = context.auth;

    // If already authenticated, redirect to home
    if (!isLoading && isAuthenticated) {
      throw redirect({
        to: '/',
      });
    }
  },
});
