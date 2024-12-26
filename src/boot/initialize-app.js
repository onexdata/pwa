// src/boot/initialize-app.js
import { defineBoot } from '#q-app/wrappers'
import { initializeApplication } from 'src/stores'

export default defineBoot(async ({ app }) => {
  const APP_ID = process.env.APP_ID || 'default'

  try {
    // Initialize with defaults and try to get server updates
    const messages = await initializeApplication(APP_ID)

    // Update i18n with merged messages
    const i18n = app.config.globalProperties.$i18n
    Object.entries(messages).forEach(([locale, translations]) => {
      i18n.global.setLocaleMessage(locale, translations)
    })
  } catch (error) {
    // Just log a warning - app will continue with default settings
    console.warn('Could not reach server for settings updates:', error.message)
  }
})
