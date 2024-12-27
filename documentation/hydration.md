# Application Hydration Process

## Overview

The application implements a sophisticated hydration process that ensures proper initialization of the application state, internationalization (i18n) settings, and user preferences. The process combines local storage caching with server-side configuration, providing both offline capabilities and synchronized settings.

## Key Components

1. Store Management

   - Uses Pinia for state management
   - Implements validated stores with JSON Schema validation
   - Handles UI, App, User, and Asset stores

2. Settings Management

   - Combines default settings with server configurations
   - Validates all settings against predefined schemas
   - Caches settings in localStorage

3. Internationalization (i18n)
   - Supports multiple languages
   - Merges default translations with server-provided ones
   - Caches translations in localStorage

## Detailed Process Flow

### 1. Initial Bootstrap (initialize-app.js)

The process begins in `initialize-app.js` when the application boots:

```javascript
export default defineBoot(async () => {
  // Boot process starts here
})
```

### 2. Local Cache Recovery

First, the system attempts to recover any previously cached data:

1. Retrieves cached settings:

   ```javascript
   const savedSettings = JSON.parse(localStorage.getItem('settings') || '{}')
   ```

2. Retrieves cached translations:
   ```javascript
   const savedMessages = JSON.parse(localStorage.getItem('i18n-messages') || '{}')
   ```

### 3. Initial i18n Setup

The system initializes i18n with either cached or default translations:

1. If cached translations exist:

   ```javascript
   if (Object.keys(savedMessages).length > 0) {
     Object.entries(savedMessages).forEach(([locale, translations]) => {
       i18n.global.setLocaleMessage(locale, translations)
     })
   }
   ```

2. If no cache, uses defaults:
   ```javascript
   Object.entries(messages).forEach(([locale, translations]) => {
     i18n.global.setLocaleMessage(locale, translations)
   })
   ```

### 4. Store Initialization (stores/index.js)

The application then initializes its stores through `initializeApplication()`:

1. Creates store instances with validation:

   ```javascript
   const stores = useStores()
   ```

2. Applies saved settings to each store:
   ```javascript
   Object.entries(stores).forEach(([storeId, store]) => {
     const baseState = { ...storeConfigs[storeId].defaults }
     const mergedSettings = deepMerge({}, baseState, savedSettings[storeId] || {})
     store.initializeWithSettings(mergedSettings)
   })
   ```

### 5. Server Synchronization

If an application ID is provided, the system synchronizes with the server:

1. Fetches application data:

   ```javascript
   const { data } = await api.get(`/items/apps`, {
     params: {
       fields: 'date_updated,version,settings,translations.messages',
       'deep[translations][_filter][languages_code][_eq]': language,
     },
   })
   ```

2. Updates metadata:
   ```javascript
   settings.app = {
     ...settings.app,
     meta: {
       version,
       lastUpdate: date_updated,
       lastSync: new Date().toISOString(),
     },
   }
   ```

### 6. Settings Merge and Validation

The system then creates complete settings by merging defaults with server data:

1. Merges settings:

   ```javascript
   Object.entries(storeConfigs).forEach(([storeId, config]) => {
     completeSettings[storeId] = deepMerge({}, config.defaults, settings[storeId] || {})
   })
   ```

2. Updates stores with complete settings:
   ```javascript
   Object.entries(stores).forEach(([storeId, store]) => {
     store.initializeWithSettings(completeSettings[storeId])
   })
   ```

### 7. Cache Update

Finally, the system updates the local cache:

1. Caches complete settings:

   ```javascript
   localStorage.setItem('settings', JSON.stringify(completeSettings))
   ```

2. Caches complete messages:
   ```javascript
   localStorage.setItem('i18n-messages', JSON.stringify(completeMessages))
   ```

## Validation Process

Throughout the hydration process, all settings are validated using JSON Schema:

1. Each store has a defined schema:

   ```javascript
   store.validator = ajv.compile(storeConfigs[store.$id].schema)
   ```

2. Validation occurs during initialization:
   ```javascript
   if (!store.validator(mergedSettings)) {
     return
   }
   ```

## Error Handling

The process includes robust error handling:

1. Continues with defaults if server sync fails
2. Validates all incoming data before application
3. Maintains application functionality even when offline

## Architecture Benefits

This hydration process provides several key benefits:

1. **Offline First**: Application can function without server connection
2. **Data Integrity**: All settings are validated against schemas
3. **Performance**: Uses local cache to minimize server requests
4. **Flexibility**: Supports multiple languages and configurations
5. **Maintainability**: Clear separation of concerns and modular design

The process ensures a robust, reliable application initialization while maintaining user preferences and settings across sessions.
