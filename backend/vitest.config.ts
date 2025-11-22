/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/tests/**/*.test.ts'],
    setupFiles: ['./src/tests/setup.ts'], // Add setup file for tests
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
