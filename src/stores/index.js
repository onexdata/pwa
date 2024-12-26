// stores/index.js
import { createPinia } from 'pinia'
import { createValidatedStore } from './createValidatedStore'
import { schema as uiSchema, defaults as uiDefaults } from './ui'
import { schema as appSchema, defaults as appDefaults } from './app'
import { schema as userSchema, defaults as userDefaults } from './user'
import { schema as assetSchema, defaults as assetDefaults } from './asset'

// Export each store...
export const useUIStore = createValidatedStore('ui', { schema: uiSchema, defaults: uiDefaults })
export const useAppStore = createValidatedStore('app', { schema: appSchema, defaults: appDefaults })
export const useUserStore = createValidatedStore('user', {
  schema: userSchema,
  defaults: userDefaults,
})
export const useAssetStore = createValidatedStore('asset', {
  schema: assetSchema,
  defaults: assetDefaults,
})

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
  if (['ui', 'app', 'user', 'asset'].includes(store.$id)) {
    store.initializeSettings().catch((error) => {
      console.error(`Failed to initialize ${store.$id} store:`, error)
    })
  }
})

export default pinia
