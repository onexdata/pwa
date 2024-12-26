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
        console.log(`Updating ${name} store:`, { path, value })
        
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

        console.log('Updated state:', currentState)

        // Validate the updated state
        const validate = ajv.compile(schema)
        const isValid = validate(currentState)

        if (isValid) {
          try {
            // Update each property individually to maintain reactivity
            Object.keys(currentState).forEach(key => {
              if (key !== 'isLoaded' && key !== 'validationErrors') {
                this.$state[key] = currentState[key]
              }
            })
            
            // Save to localStorage
            const saveData = JSON.stringify(currentState)
            localStorage.setItem(`${name}-settings`, saveData)
            console.log(`Saved to localStorage:`, saveData)
          } catch (error) {
            console.error(`Error saving ${name} settings:`, error)
          }
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
