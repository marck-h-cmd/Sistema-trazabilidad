import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.spec.ts'],
  moduleNameMapper: {
    '@config/(.*)': '<rootDir>/src/config/$1',
    '@controllers/(.*)': '<rootDir>/src/controllers/$1',
    '@services/(.*)': '<rootDir>/src/services/$1',
    '@routes/(.*)': '<rootDir>/src/routes/$1',
    '@middleware/(.*)': '<rootDir>/src/middleware/$1',
    '@utils/(.*)': '<rootDir>/src/utils/$1',
    '@types/(.*)': '<rootDir>/src/types/$1',
    '@repositories/(.*)': '<rootDir>/src/repositories/$1',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/server.ts'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testTimeout: 30000,
  verbose: true,
};

export default config;