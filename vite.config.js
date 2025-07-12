import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Nymph/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
        dashboard: 'dashboard.html',
        bugs: 'bug-reports.html',
        features: 'feature-requests.html'
      }
    }
  }
})