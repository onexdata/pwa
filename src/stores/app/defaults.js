// stores/app/defaults.js
export const defaults = {
  meta: {
    version: '1.0.0',
    buildNumber: '1',
    lastUpdate: new Date().toISOString(),
  },
  state: {
    initialized: false,
    online: true,
    lastError: null,
  },
  config: {
    api: {
      baseUrl: 'https://api.example.com',
      timeout: 5000,
    },
  },
}
