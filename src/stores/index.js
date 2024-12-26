// stores/index.js
import { createPinia } from 'pinia'
import { createValidatedStore } from './createValidatedStore'
import { schema as uiSchema, defaults as uiDefaults } from './ui'
import { schema as appSchema, defaults as appDefaults } from './app'
import { schema as userSchema, defaults as userDefaults } from './user'
import { schema as assetSchema, defaults as assetDefaults } from './asset'
import { api } from 'boot/axios'
import defaultMessages from 'src/i18n'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

// Create a single Ajv instance
const ajv = new Ajv()
addFormats(ajv, {
  mode: 'full',
  formats: ['date-time', 'email'],
})

// Store configuration map
const storeConfigs = {
  ui: { schema: uiSchema, defaults: uiDefaults },
  app: { schema: appSchema, defaults: appDefaults },
  user: { schema: userSchema, defaults: userDefaults },
  asset: { schema: assetSchema, defaults: assetDefaults },
}

// Export each store...
export const useUIStore = createValidatedStore('ui', storeConfigs.ui)
export const useAppStore = createValidatedStore('app', storeConfigs.app)
export const useUserStore = createValidatedStore('user', storeConfigs.user)
export const useAssetStore = createValidatedStore('asset', storeConfigs.asset)

// Export all stores...
export function useStores() {
  const ui = useUIStore()
  const app = useAppStore()
  const user = useUserStore()
  const asset = useAssetStore()

  return {
    ui,
    app,
    user,
    asset,
  }
}

// Create and configure Pinia instance
export const pinia = createPinia()

// Initialize all stores when pinia is created
pinia.use(({ store }) => {
  if (store.$id in storeConfigs) {
    // Add validator and schema to store instance
    store.validator = ajv.compile(storeConfigs[store.$id].schema)

    // Add a new initializeWithSettings method to each store
    store.initializeWithSettings = (serverSettings = {}) => {
      try {
        // Start with defaults
        const localSettings = JSON.parse(localStorage.getItem(`${store.$id}-settings`) || '{}')
        const mergedSettings = {
          ...store.$state, // Current defaults
          ...serverSettings, // Server overrides (if any)
          ...localSettings, // Local overrides
        }

        // Remove internal state properties
        delete mergedSettings.isLoaded
        delete mergedSettings.validationErrors

        // Validate merged settings
        const isValid = store.validator(mergedSettings)

        if (!isValid) {
          console.warn(
            `${store.$id} settings validation failed, using defaults:`,
            store.validator.errors,
          )
          // Don't update store, keep defaults
        } else {
          Object.assign(store.$state, mergedSettings)
          store.validationErrors = null
          // Save valid settings to localStorage
          localStorage.setItem(`${store.$id}-settings`, JSON.stringify(mergedSettings))
        }
      } catch (error) {
        console.warn(`Error processing ${store.$id} settings, using defaults:`, error)
        // Keep using defaults
      } finally {
        store.isLoaded = true
      }
    }
  }
})

// Add global initialization function
export async function initializeApplication(appId = null) {
  // Initialize stores with defaults first
  const stores = useStores()
  Object.values(stores).forEach((store) => store.initializeWithSettings())

  // If no appId provided, just return default messages
  if (!appId) {
    return defaultMessages
  }

  // Fetch server settings
  const { data } = await api.get(`/api/apps/${appId}`)
  const { settings = {}, i18n = {} } = data

  // Update each store with any server settings
  Object.entries(stores).forEach(([storeId, store]) => {
    store.initializeWithSettings(settings[storeId] || {})
  })

  // Merge i18n messages
  const mergedMessages = {}
  Object.entries(defaultMessages).forEach(([locale, messages]) => {
    mergedMessages[locale] = {
      ...messages,
      ...(i18n[locale] || {}),
    }
  })

  return mergedMessages
}

export default pinia
