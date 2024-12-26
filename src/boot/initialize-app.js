// src/boot/initialize-app.js
import { defineBoot } from '#q-app/wrappers'
import { initializeApplication } from 'src/stores'
import { i18n } from './i18n'
import messages from 'src/i18n'

export default defineBoot(async () => {
  try {
    // Get cached data
    const savedSettings = JSON.parse(localStorage.getItem('settings') || '{}')
    const savedMessages = JSON.parse(localStorage.getItem('i18n-messages') || '{}')

    // Apply cached messages if they exist
    if (Object.keys(savedMessages).length > 0) {
      Object.entries(savedMessages).forEach(([locale, translations]) => {
        i18n.global.setLocaleMessage(locale, translations)
      })
    } else {
      // If no cached messages, use defaults
      Object.entries(messages).forEach(([locale, translations]) => {
        i18n.global.setLocaleMessage(locale, translations)
      })
    }

    // Initialize with saved settings and get new messages from server
    const serverMessages = await initializeApplication(
      process.env.VITE_APP_ID || 'default',
      savedSettings?.user?.preferences?.language || 'en-US',
      savedSettings,
    )

    // Update messages if we got new ones from server
    if (serverMessages && Object.keys(serverMessages).length > 0) {
      Object.entries(serverMessages).forEach(([locale, translations]) => {
        i18n.global.setLocaleMessage(locale, translations)
      })
    }

    // Set language from user preferences (using complete merged settings)
    const userLanguage = savedSettings?.user?.preferences?.language || 'en-US'
    i18n.global.locale.value = userLanguage
  } catch {
    // App continues with defaults
  }
})
