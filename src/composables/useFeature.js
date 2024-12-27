// composables/useFeature.js
import { useAppStore } from 'stores'
import { get } from 'lodash'
import { computed } from 'vue'

// Simple function to check if a feature is enabled
export function isFeatureEnabled(featurePath) {
  const store = useAppStore()
  const feature = get(store.features, featurePath)
  return feature?.enabled ?? false
}

// Vue composable if reactivity is needed
export function useFeature(featurePath) {
  const store = useAppStore()
  return computed(() => get(store.features, featurePath)?.enabled ?? false)
}
