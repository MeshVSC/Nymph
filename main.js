// Main entry point for Vite with Firebase
console.log('Nymph loading...')

// Wait for DOM to be ready, then load the app
document.addEventListener('DOMContentLoaded', async () => {
  await import('./config.js')
  await import('./app.js')
})