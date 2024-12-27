import { createPinia } from 'pinia'
import { createApp } from 'vue'

/**
 * Creates a fresh Pinia instance for testing
 * @returns {import('pinia').Pinia} A new Pinia instance
 */
export function createTestPinia() {
  const app = createApp({})
  const pinia = createPinia()
  app.use(pinia)
  return pinia
}

/**
 * Creates a mock feature configuration for testing
 * @param {Object} overrides - Feature overrides to merge with defaults
 * @returns {Object} Mock feature configuration
 */
export function createMockFeatures(overrides = {}) {
  return {
    core: {
      pwa: {
        enabled: true,
        description: 'PWA Support',
        required: true,
      },
    },
    ui: {
      layout: {
        quickMenu: {
          enabled: true,
          description: 'Quick Menu',
          required: true,
        },
      },
    },
    ...overrides,
  }
}

/**
 * Helper to wait for Vue's next tick
 */
export async function nextTick() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

/**
 * Creates mock store settings
 * @param {Object} overrides - Settings to override defaults
 * @returns {Object} Mock settings object
 */
export function createMockSettings(overrides = {}) {
  return {
    ui: {
      theme: {
        dark: false,
        primary: '#1976D2',
      },
    },
    app: {
      features: createMockFeatures(),
    },
    user: {
      preferences: {
        language: 'en-US',
      },
    },
    ...overrides,
  }
}
