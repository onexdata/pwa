// stores/createValidatedStore.js
import { defineStore } from 'pinia'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

// Create a single properly configured Ajv instance
const ajv = new Ajv()
// Add all formats with full validation
addFormats(ajv, {
  mode: 'full', // Ensure strict format validation
  formats: ['date-time', 'email'], // Explicitly list formats we're using
})

export function createValidatedStore(name, options) {
  const { defaults, schema, ...storeOptions } = options

  return defineStore(name, {
    state: () => ({
      ...defaults,
      isLoaded: false,
      validationErrors: null,
    }),

    actions: {
      async initializeSettings() {
        try {
          const localSettings = JSON.parse(localStorage.getItem(`${name}-settings`) || '{}')

          // Fetch server settings if needed
          const serverSettings = await fetch(`/api/${name}/settings`)
            .then((r) => r.json())
            .catch(() => ({}))

          const mergedSettings = {
            ...defaults,
            ...serverSettings,
            ...localSettings,
          }

          const validate = ajv.compile(schema)
          const isValid = validate(mergedSettings)

          if (!isValid) {
            console.error(`${name} settings validation failed:`, validate.errors)
            this.validationErrors = validate.errors
            Object.assign(this.$state, defaults)
          } else {
            Object.assign(this.$state, mergedSettings)
            this.validationErrors = null
            // Save valid settings to localStorage
            localStorage.setItem(`${name}-settings`, JSON.stringify(mergedSettings))
          }
        } catch (error) {
          console.error(`Error initializing ${name} settings:`, error)
          Object.assign(this.$state, defaults)
        } finally {
          this.isLoaded = true
        }
      },

      updateSettings(path, value) {
        const parts = path.split('.')
        let current = this
        for (let i = 0; i < parts.length - 1; i++) {
          current = current[parts[i]]
        }
        current[parts[parts.length - 1]] = value

        // Create a clean state object without internal properties
        const stateToStore = { ...this.$state }
        delete stateToStore.isLoaded
        delete stateToStore.validationErrors

        const validate = ajv.compile(schema)
        const isValid = validate(stateToStore)

        if (isValid) {
          localStorage.setItem(`${name}-settings`, JSON.stringify(stateToStore))
        } else {
          console.error(`Invalid ${name} settings update:`, validate.errors)
        }
      },

      ...storeOptions.actions,
    },

    getters: {
      isValid: (state) => !state.validationErrors,
      ...(storeOptions.getters || {}),
    },
  })
}
