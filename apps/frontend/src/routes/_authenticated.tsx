import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useAuth } from '../contexts/AuthContext';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
  beforeLoad: async ({ context, location }) => {
    // @ts-ignore - context will be properly typed through router setup
    const { isAuthenticated, isLoading } = context.auth;

    if (!isLoading && !isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
});

function AuthenticatedLayout() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2rem',
          color: '#6b7280',
        }}
      >
        Loading...
      </div>
    );
  }

  return <Outlet />;
}
