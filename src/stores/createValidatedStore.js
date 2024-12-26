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
      updateSettings(path, value) {
        // Get current state without internal properties
        const currentState = { ...this.$state }
        delete currentState.isLoaded
        delete currentState.validationErrors

        // Update the value at the specified path
        const parts = path.split('.')
        let target = currentState
        for (let i = 0; i < parts.length - 1; i++) {
          if (!target[parts[i]]) target[parts[i]] = {}
          target = target[parts[i]]
        }
        target[parts[parts.length - 1]] = value

        // Validate the updated state
        const validate = ajv.compile(schema)
        const isValid = validate(currentState)

        if (isValid) {
          // Update state first
          Object.assign(this.$state, currentState)
          // Then save to localStorage
          localStorage.setItem(`${name}-settings`, JSON.stringify(currentState))
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
