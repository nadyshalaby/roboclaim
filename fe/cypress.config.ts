import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      apiUrl: 'http://localhost:3000',  // API URL
      webUrl: 'http://localhost:3001',   // Frontend URL
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    retries: {
      runMode: 2,
      openMode: 0
    }
  },
  video: false,
  screenshotOnRunFailure: true,
  defaultCommandTimeout: 10000,
})
