// stores/createValidatedStore.js
import { defineStore } from 'pinia'

export function createValidatedStore(name, options) {
  const { defaults, ...storeOptions } = options

  return defineStore(name, {
    state: () => ({
      ...defaults,
      isLoaded: false,
      validationErrors: null,
    }),

    actions: {
      updateSettings(path, value) {
        const currentState = { ...this.$state }
        delete currentState.isLoaded
        delete currentState.validationErrors

        const parts = path.split('.')
        let target = currentState
        for (let i = 0; i < parts.length - 1; i++) {
          if (!target[parts[i]]) target[parts[i]] = {}
          target = target[parts[i]]
        }
        target[parts[parts.length - 1]] = value

        this.$store.initializeWithSettings(currentState)
      },

      ...storeOptions.actions,
    },

    getters: {
      isValid: (state) => !state.validationErrors,
      ...(storeOptions.getters || {}),
    },
  })
}
