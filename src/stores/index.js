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
        // Get local settings
        const localSettings = JSON.parse(localStorage.getItem(`${store.$id}-settings`) || '{}')
        // Start with defaults from the store's current state
        const baseState = { ...store.$state }
        delete baseState.isLoaded
        delete baseState.validationErrors

        // Apply server settings first, then local settings
        const mergedSettings = {
          ...baseState,
          ...serverSettings,
          ...localSettings
        }

        // Validate the merged settings
        const isValid = store.validator(mergedSettings)

        if (!isValid) {
          console.error(`${store.$id} settings validation failed:`, store.validator.errors)
          return
        }

        // Update the store state
        Object.assign(store.$state, mergedSettings)
        store.validationErrors = null

        // Save to localStorage
        localStorage.setItem(`${store.$id}-settings`, JSON.stringify(mergedSettings))
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
export async function initializeApplication(appId = null, language = 'en-US') {
  // Initialize stores with defaults first
  const stores = useStores()
  Object.values(stores).forEach((store) => store.initializeWithSettings())

  // If no appId provided, just return default messages
  if (!appId) {
    return defaultMessages
  }

  try {
    // Fetch server settings with language filter
    const { data } = await api.get(`http://localhost:8055/items/apps`, {
      params: {
        fields: 'date_updated,version,settings,translations.messages',
        'deep[translations][_filter][languages_code][_eq]': language,
      },
    })

    if (!data?.data?.[0]) {
      console.warn('No app configuration found')
      return defaultMessages
    }

    const appData = data.data[0]
    const { settings = {}, translations = [], date_updated, version } = appData

    // Store app metadata
    localStorage.setItem(
      'app-metadata',
      JSON.stringify({
        date_updated,
        version,
        lastSync: new Date().toISOString(),
      }),
    )

    // Update each store with any server settings
    Object.entries(stores).forEach(([storeId, store]) => {
      store.initializeWithSettings(settings[storeId] || {})
    })

    // Get messages from the first translation that matches our language
    const translation = translations[0]
    const i18nMessages = translation?.messages || {}

    // Merge i18n messages for the requested language
    const mergedMessages = {
      [language]: {
        ...defaultMessages[language],
        ...i18nMessages,
      },
    }

    return mergedMessages
  } catch {
    // Don't log the full error object, just note that hydration failed
    console.warn('Warning: The hydration call failed. Reverting to localStorage / defaults')
    return defaultMessages
  }
}

export default pinia
