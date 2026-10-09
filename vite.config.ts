import { defineConfig } from 'vitest/config';

export default defineConfig({
  // En GitHub Pages el sitio vive en /fulbo/; en local, en la raíz.
  base: process.env.GITHUB_ACTIONS ? '/fulbo/' : '/',
  server: { port: 5173 },
  test: {
    globals: true,
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
