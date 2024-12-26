// stores/index.js
import { createPinia } from 'pinia'
import { createValidatedStore } from './createValidatedStore'
import { schema as uiSchema, defaults as uiDefaults } from './ui'
import { schema as appSchema, defaults as appDefaults } from './app'
import { schema as userSchema, defaults as userDefaults } from './user'
import { schema as assetSchema, defaults as assetDefaults } from './asset'
import { api } from 'boot/axios'
import messages from 'src/i18n'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const ajv = new Ajv()
addFormats(ajv, { mode: 'full', formats: ['date-time', 'email'] })

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item)
}

function deepMerge(target, ...sources) {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }
  return deepMerge(target, ...sources)
}

const storeConfigs = {
  ui: { schema: uiSchema, defaults: uiDefaults },
  app: { schema: appSchema, defaults: appDefaults },
  user: { schema: userSchema, defaults: userDefaults },
  asset: { schema: assetSchema, defaults: assetDefaults },
}

export const useUIStore = createValidatedStore('ui', storeConfigs.ui)
export const useAppStore = createValidatedStore('app', storeConfigs.app)
export const useUserStore = createValidatedStore('user', storeConfigs.user)
export const useAssetStore = createValidatedStore('asset', storeConfigs.asset)

export function useStores() {
  return {
    ui: useUIStore(),
    app: useAppStore(),
    user: useUserStore(),
    asset: useAssetStore(),
  }
}

export const pinia = createPinia()

pinia.use(({ store }) => {
  if (store.$id in storeConfigs) {
    store.validator = ajv.compile(storeConfigs[store.$id].schema)

    store.initializeWithSettings = (serverSettings = {}) => {
      try {
        const baseState = { ...store.$state }
        delete baseState.isLoaded
        delete baseState.validationErrors

        const mergedSettings = deepMerge({}, baseState, serverSettings)

        if (!store.validator(mergedSettings)) {
          return
        }

        Object.keys(mergedSettings).forEach((key) => {
          if (key !== 'isLoaded' && key !== 'validationErrors') {
            if (isObject(mergedSettings[key])) {
              if (!store.$state[key]) store.$state[key] = {}
              deepMerge(store.$state[key], mergedSettings[key])
            } else {
              store.$state[key] = mergedSettings[key]
            }
          }
        })
        store.validationErrors = null
      } finally {
        store.isLoaded = true
      }
    }
  }
})

// stores/index.js
export async function initializeApplication(appId = null, language = 'en-US', savedSettings = {}) {
  const stores = useStores()

  // Initialize stores with saved settings first
  Object.entries(stores).forEach(([storeId, store]) => {
    const baseState = { ...storeConfigs[storeId].defaults }
    const mergedSettings = deepMerge({}, baseState, savedSettings[storeId] || {})
    store.initializeWithSettings(mergedSettings)
  })

  if (!appId) return messages

  try {
    const { data } = await api.get(`/items/apps`, {
      params: {
        fields: 'date_updated,version,settings,translations.messages',
        'deep[translations][_filter][languages_code][_eq]': language,
      },
    })

    if (!data?.data?.[0]) return messages

    const { settings = {}, translations = [], date_updated, version } = data.data[0]

    // Add metadata to app settings
    settings.app = {
      ...settings.app,
      meta: {
        version,
        lastUpdate: date_updated,
        lastSync: new Date().toISOString(),
      },
    }

    // Create complete settings object by merging defaults with server settings
    const completeSettings = {}
    Object.entries(storeConfigs).forEach(([storeId, config]) => {
      completeSettings[storeId] = deepMerge({}, config.defaults, settings[storeId] || {})
    })

    // Update all stores with complete settings
    Object.entries(stores).forEach(([storeId, store]) => {
      store.initializeWithSettings(completeSettings[storeId])
    })

    // Cache complete settings object
    localStorage.setItem('settings', JSON.stringify(completeSettings))

    // Create complete messages object
    const translation = translations[0]
    const completeMessages = {
      [language]: {
        ...messages[language],
        ...translation?.messages,
      },
    }

    // Cache complete messages
    localStorage.setItem('i18n-messages', JSON.stringify(completeMessages))

    return completeMessages
  } catch {
    return messages
  }
}
export default pinia
