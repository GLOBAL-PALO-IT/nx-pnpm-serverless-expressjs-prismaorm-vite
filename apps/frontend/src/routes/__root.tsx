import { createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { App } from '../app/app';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <App />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
