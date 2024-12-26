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
        const localSettings = JSON.parse(localStorage.getItem(`${store.$id}-settings`) || '{}')
        const baseState = { ...store.$state }
        delete baseState.isLoaded
        delete baseState.validationErrors

        const mergedSettings = deepMerge({}, baseState, localSettings, serverSettings)

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
        localStorage.setItem(`${store.$id}-settings`, JSON.stringify(mergedSettings))
      } catch {
        /* continue with defaults */
      } finally {
        store.isLoaded = true
      }
    }
  }
})

export async function initializeApplication(appId = null, language = 'en-US') {
  const stores = useStores()
  Object.values(stores).forEach((store) => store.initializeWithSettings())

  if (!appId) return defaultMessages

  try {
    const { data } = await api.get(`/items/apps`, {
      params: {
        fields: 'date_updated,version,settings,translations.messages',
        'deep[translations][_filter][languages_code][_eq]': language,
      },
    })

    if (!data?.data?.[0]) return defaultMessages

    const { settings = {}, translations = [], date_updated, version } = data.data[0]

    const appSettings = {
      ...settings.app,
      meta: {
        version,
        lastUpdate: date_updated,
        lastSync: new Date().toISOString(),
      },
    }

    Object.entries(stores).forEach(([storeId, store]) => {
      const storeSettings = storeId === 'app' ? appSettings : settings[storeId] || {}
      store.initializeWithSettings(storeSettings)
    })

    const translation = translations[0]
    return {
      [language]: {
        ...defaultMessages[language],
        ...translation?.messages,
      },
    }
  } catch {
    return defaultMessages
  }
}

export default pinia
