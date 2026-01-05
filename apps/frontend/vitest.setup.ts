import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi, beforeAll } from 'vitest';

// Make vi globally available as jest for compatibility
global.jest = vi;

// Mock import.meta for tests
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: 'http://localhost:3000',
      },
    },
  },
  configurable: true,
  writable: true,
});

// Handle expected unhandled rejections in tests
beforeAll(() => {
  // Suppress unhandled rejection warnings for expected test errors
  const originalUnhandledRejection = process.listeners('unhandledRejection');
  process.removeAllListeners('unhandledRejection');

  process.on('unhandledRejection', reason => {
    const message = String(reason);
    // Only suppress expected test errors
    if (
      !message.includes('Invalid credentials') &&
      !message.includes('Email exists') &&
      !message.includes('Refresh failed')
    ) {
      // Re-throw unexpected errors
      originalUnhandledRejection.forEach(listener => {
        if (typeof listener === 'function') {
          listener(reason, Promise.reject(reason));
        }
      });
    }
  });
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});
