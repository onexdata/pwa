// src/boot/initialize-app.js
import { defineBoot } from '#q-app/wrappers'
import { initializeApplication } from 'src/stores'
import { i18n } from './i18n'

export default defineBoot(async () => {
  try {
    // First load saved overrides from localStorage
    const savedOverrides = JSON.parse(localStorage.getItem('i18n-overrides') || '{}')

    // Apply saved overrides first
    if (Object.keys(savedOverrides).length > 0) {
      Object.entries(savedOverrides).forEach(([locale, translations]) => {
        const existingMessages = i18n.global.messages.value[locale] || {}
        const mergedMessages = {
          ...existingMessages,
          ...translations,
          app: {
            ...existingMessages.app,
            ...translations.app,
          },
        }
        i18n.global.setLocaleMessage(locale, mergedMessages)
      })
    }

    // Try to get fresh settings and i18n from server
    const messages = await initializeApplication(process.env.VITE_APP_ID || 'default')

    // If we got new messages from server, merge and store them
    if (messages && Object.keys(messages).length > 0) {
      // Apply new messages
      Object.entries(messages).forEach(([locale, translations]) => {
        const existingMessages = i18n.global.messages.value[locale] || {}
        const mergedMessages = {
          ...existingMessages,
          ...translations,
          app: {
            ...existingMessages.app,
            ...translations.app,
          },
        }
        i18n.global.setLocaleMessage(locale, mergedMessages)
      })

      // Store the new overrides in localStorage
      localStorage.setItem('i18n-overrides', JSON.stringify(messages))
    }
  } catch (error) {
    console.warn('Could not reach server for settings updates:', error.message)
    // App continues with saved overrides or defaults
  }
})
