import type { Config } from 'jest';
import nextJest from 'next/jest.js';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // Note the .ts extension here
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Automatically map your tsconfig paths
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
    // Handle CSS imports
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Mock image imports
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
  },
  transformIgnorePatterns: [
    // Ensure lucide-react (and other ES Module libraries if needed) are transformed
    '/node_modules/(?!lucide-react).+\\.(js|jsx|ts|tsx)$',
  ],
  // If you were to explicitly configure ts-jest for transformation (Next.js/SWC usually handles this well now)
  // transform: {
  //   '^.+\\.(ts|tsx)$': 'ts-jest',
  // },
};

// createJestConfig is exported in this way to ensure that next/jest can load the Next.js config which is async
// and also correctly merge with your custom config.
export default createJestConfig(customJestConfig);