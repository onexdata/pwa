// src/boot/initialize-app.js
import { defineBoot } from '#q-app/wrappers'
import { initializeApplication } from 'src/stores'
import { i18n } from './i18n'

export default defineBoot(async () => {
  try {
    // Get user's preferred language or default to en-US
    const userLanguage = localStorage.getItem('user-language') || 'en-US'

    // First load saved messages from localStorage
    const savedMessages = JSON.parse(localStorage.getItem('i18n-messages') || '{}')

    // Apply saved messages first if they exist
    if (Object.keys(savedMessages).length > 0) {
      Object.entries(savedMessages).forEach(([locale, translations]) => {
        i18n.global.setLocaleMessage(locale, translations)
      })
    }

    try {
      // Try to get fresh settings and messages from server
      const messages = await initializeApplication(
        process.env.VITE_APP_ID || 'default',
        userLanguage,
      )

      // If we got new messages from server, update them
      if (messages && Object.keys(messages).length > 0) {
        // Apply new messages
        Object.entries(messages).forEach(([locale, translations]) => {
          i18n.global.setLocaleMessage(locale, translations)
        })

        // Store the new messages in localStorage for offline use
        localStorage.setItem('i18n-messages', JSON.stringify(messages))
      }
    } catch {
      // Don't log anything here since stores/index.js will handle the warning
      // App continues with saved messages or defaults
    }

    // Set the current language
    i18n.global.locale.value = userLanguage
  } catch (error) {
    console.error('Critical initialization error:', error.message)
    // App continues with defaults
  }
})
