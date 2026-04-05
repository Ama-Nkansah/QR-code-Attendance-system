/**
 * Jest configuration for Next.js.
 *
 * LEARNING NOTE — Why use next/jest?
 * Next.js ships its own Jest transformer that handles:
 *   - TypeScript compilation
 *   - The @/* path alias (maps to src/*)
 *   - CSS/image imports that would otherwise crash Jest
 * Without it you would have to configure all of that yourself.
 */
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Points to your Next.js app root so next/jest can read next.config.ts
  // and .env files during tests.
  dir: './',
});

const config: Config = {
  // LEARNING NOTE — testEnvironment
  // 'jsdom' gives every test a fake browser environment (window, document,
  // navigator.geolocation, etc.). Without this you would be running in plain
  // Node which has none of those browser globals.
  testEnvironment: 'jsdom',

  // LEARNING NOTE — setupFilesAfterEnv
  // This file runs once after Jest sets up the test environment but before
  // your tests run. We use it to import @testing-library/jest-dom which adds
  // custom matchers like toBeInTheDocument() and toHaveValue().
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // LEARNING NOTE — moduleNameMapper
  // Jest does not know about Next.js's @/* alias. This regex tells it:
  // "whenever you see @/foo, look in src/foo instead."
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default createJestConfig(config);
