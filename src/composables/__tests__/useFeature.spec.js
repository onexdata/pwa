import { describe, it, expect, beforeEach } from 'vitest'
import { isFeatureEnabled, useFeature } from '../useFeature'
import { createMockFeatures, nextTick } from '../../../test/utils'
import { useAppStore } from 'stores'

describe('Feature Flag System', () => {
  let appStore

  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    appStore = useAppStore()

    // Initialize the store with mock features
    appStore.$state.features = createMockFeatures()
  })

  describe('isFeatureEnabled', () => {
    it('returns true for enabled features', () => {
      expect(isFeatureEnabled('core.pwa')).toBe(true)
      expect(isFeatureEnabled('ui.layout.quickMenu')).toBe(true)
    })

    it('returns false for disabled features', () => {
      appStore.$state.features.core.pwa.enabled = false
      expect(isFeatureEnabled('core.pwa')).toBe(false)
    })

    it('returns false for non-existent features', () => {
      expect(isFeatureEnabled('nonexistent.feature')).toBe(false)
    })

    it('handles nested feature paths correctly', () => {
      const features = createMockFeatures({
        deeply: {
          nested: {
            feature: {
              enabled: true,
              description: 'Deeply nested feature',
            },
          },
        },
      })
      appStore.$state.features = features
      expect(isFeatureEnabled('deeply.nested.feature')).toBe(true)
    })
  })

  describe('useFeature composable', () => {
    it('returns a computed ref with the feature state', () => {
      const quickMenu = useFeature('ui.layout.quickMenu')
      expect(quickMenu.value).toBe(true)
    })

    it('updates reactively when feature state changes', async () => {
      const quickMenu = useFeature('ui.layout.quickMenu')
      expect(quickMenu.value).toBe(true)

      // Update the feature state
      appStore.$state.features.ui.layout.quickMenu.enabled = false
      await nextTick()
      expect(quickMenu.value).toBe(false)
    })

    it('returns false for non-existent features', () => {
      const nonexistent = useFeature('nonexistent.feature')
      expect(nonexistent.value).toBe(false)
    })

    it('handles edge cases with malformed feature paths', () => {
      expect(useFeature('').value).toBe(false)
      expect(useFeature('.').value).toBe(false)
      expect(useFeature('core..pwa').value).toBe(false)
    })
  })

  describe('Feature dependencies', () => {
    beforeEach(() => {
      appStore.$state.features = createMockFeatures({
        parent: {
          feature: {
            enabled: true,
            description: 'Parent feature',
          },
          child: {
            enabled: true,
            description: 'Child feature',
            dependencies: ['parent.feature'],
          },
        },
      })
    })

    it('child feature is enabled when parent is enabled', () => {
      expect(isFeatureEnabled('parent.child')).toBe(true)
    })

    it('child feature is disabled when parent is disabled', () => {
      appStore.$state.features.parent.feature.enabled = false
      expect(isFeatureEnabled('parent.child')).toBe(false)
    })
  })

  describe('Required features', () => {
    it('cannot disable required features', () => {
      const features = createMockFeatures()
      features.core.pwa.enabled = false // Try to disable required feature
      appStore.initializeWithSettings({ features })

      // Required feature should still be enabled
      expect(isFeatureEnabled('core.pwa')).toBe(true)
    })
  })
})
