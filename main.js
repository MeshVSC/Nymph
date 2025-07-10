// Main entry point for Vite
import { createClient } from '@supabase/supabase-js'

// Make supabase available globally
window.supabase = { createClient }

// Debug environment variable loading
console.log('Environment variable loaded:', import.meta.env.VITE_SUPABASE_ANON_KEY)
console.log('All env vars:', import.meta.env)

// Wait for DOM to be ready, then load the app
document.addEventListener('DOMContentLoaded', async () => {
  // Dynamic imports to ensure supabase is available
  await import('./config.js')
  await import('./app.js')
})