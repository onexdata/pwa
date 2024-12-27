# Application Feature Flag System

## Overview

The application implements a robust feature flag system that manages functionality through a hierarchical configuration structure. The system combines static feature definitions with runtime validation, providing both type safety and flexible feature management.

## Key Components

1. Feature Definition

   - JSON-based feature configuration (`features.json`)
   - Schema validation through Ajv
   - Hierarchical structure with nested features

2. Store Integration

   - Features stored in app store
   - Validation against JSON Schema
   - Merge capabilities for server-side overrides

3. Feature Usage
   - Vue composable for reactive feature checks
   - Direct function for non-reactive checks
   - Component integration through Vue composition API

## Detailed Architecture

### 1. Feature Definition (features.json)

Features are defined in a hierarchical JSON structure:

```json
{
  "core": {
    "pwa": {
      "enabled": true,
      "description": "Progressive Web App capabilities",
      "required": true,
      "components": ["ServiceWorker", "Manifest"],
      "expectedCoverage": 90
    }
  },
  "ui": {
    "layout": {
      "quickMenu": {
        "enabled": true,
        "description": "Quick menu implementation",
        "required": true,
        "expectedCoverage": 95
      }
    }
  }
}
```

### 2. Feature Schema (stores/app/schema.js)

The feature schema ensures type safety and validation:

```javascript
features: {
  type: 'object',
  patternProperties: {
    '^.*$': {
      oneOf: [
        {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            description: { type: 'string' },
            required: { type: 'boolean' },
            components: {
              type: 'array',
              items: { type: 'string' },
            },
            expectedCoverage: { type: 'number' },
            dependencies: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['enabled'],
        },
        {
          type: 'object',
          additionalProperties: {
            anyOf: [{ type: 'boolean' }, { type: 'object' }],
          },
        },
      ],
    },
  },
  additionalProperties: false,
}
```

### 3. Feature Integration (stores/index.js)

Features are integrated into the application store during initialization:

```javascript
// Initialize stores with features from features.json
if (storeId === 'app') {
  baseState.features = features
}

// Merge with server-side settings
const featuresWithDefaults = deepMerge({}, features, serverSettings.features || {})
const mergedAppSettings = deepMerge({}, config.defaults, serverSettings)
completeSettings[storeId] = {
  ...mergedAppSettings,
  features: featuresWithDefaults,
}
```

### 4. Feature Usage API (composables/useFeature.js)

The system provides two methods for checking feature status:

1. Reactive Composable:

```javascript
export function useFeature(featurePath) {
  const store = useAppStore()
  return computed(() => get(store.features, featurePath)?.enabled ?? false)
}
```

2. Direct Function:

```javascript
export function isFeatureEnabled(featurePath) {
  const store = useAppStore()
  const feature = get(store.features, featurePath)
  return feature?.enabled ?? false
}
```

### 5. Component Integration

Features can be checked in components:

```vue
<template>
  <div v-if="isFeatureEnabled('ui.layout.quickMenu')">Quick Menu Content</div>
</template>

<script setup>
import { useFeature } from '../composables/useFeature'

// Reactive usage
const quickMenuEnabled = useFeature('ui.layout.quickMenu')

// OR direct check
import { isFeatureEnabled } from '../composables/useFeature'
</script>
```

## Feature Analysis

The system includes a feature analysis tool (`analyze-features.js`) that provides detailed analysis of feature implementation and usage. Here's how it works:

### Feature Reference Detection

The analyzer detects feature usage through multiple methods:

1. Script Analysis

   ```javascript
   // Direct function calls
   isFeatureEnabled('ui.layout.quickMenu')
   useFeature('ui.layout.quickMenu')

   // Direct object references
   features.ui.layout.quickMenu.enabled
   ```

2. Template Analysis
   ```vue
   <!-- Vue template directive -->
   <div v-if="isFeatureEnabled('ui.layout.quickMenu')"></div>
   ```

The system uses @babel/parser to create an Abstract Syntax Tree (AST) and traverses it looking for:

- CallExpression nodes with names 'useFeature' or 'isFeatureEnabled'
- MemberExpression nodes referencing the 'features' object
- Template directives after converting them to analyzable JavaScript

### SLOC Calculation

Source Lines of Code (SLOC) are calculated differently based on file type:

1. Vue Components

   ```javascript
   // Example of feature usage scope in Vue file
   <template>
     <div v-if="isFeatureEnabled('ui.layout.quickMenu')">
       {' '}
       // Start of feature block
       <quick-menu-content /> // Counted in SLOC
       <quick-menu-actions /> // Counted in SLOC
     </div>{' '}
     // End of feature block
   </template>
   ```

   - Only counts lines within the relevant feature's scope
   - Uses indentation to determine scope boundaries
   - Excludes comments and empty lines
   - Tracks from feature check to next line with same or lower indentation

2. JavaScript Files
   ```javascript
   // Feature utility file example
   function implementQuickMenu() {
     // Counted in SLOC
     if (!isFeatureEnabled('ui.layout.quickMenu')) {
       // Counted in SLOC
       return null // Counted in SLOC
     }
     return QuickMenuComponent // Counted in SLOC
   }
   ```
   - Counts all non-comment lines in files dedicated to feature implementation
   - Excludes test files (marked by .spec.js or .test.js)

### Analysis Output

The tool generates a detailed JSON report with the following structure:

```javascript
{
  "timestamp": "2024-12-26T00:00:00.000Z",
  "summary": {
    "totalFeatures": 25,
    "implementedFeatures": 18,
    "testedFeatures": 15,
    "totalSloc": 1250
  },
  "features": {
    "ui.layout.quickMenu": {
      "enabled": true,
      "implemented": true,
      "sloc": 45,
      "testCount": 3,
      "componentCount": 2,
      "status": "IMPLEMENTED"
    }
  }
}
```

### Debug Information

The analysis tool provides detailed debug output to help troubleshoot issues:

1. Scanned Files List

   - Shows all files analyzed
   - Indicates which files were recognized as tests
   - Reports any files that couldn't be parsed

2. Feature References

   - Lists every feature reference found
   - Shows the file and location of each reference
   - Flags references to undefined features

3. Coverage Statistics
   - Number of files scanned
   - Number of features found
   - Implementation status distribution
   - Test coverage metrics

## Benefits

1. **Type Safety**: JSON Schema validation ensures feature configuration integrity
2. **Runtime Flexibility**: Features can be enabled/disabled without code changes
3. **Hierarchical Structure**: Logical grouping of related features
4. **Coverage Tracking**: Built-in analysis of feature implementation status
5. **Developer Experience**: Simple API for feature checks
6. **Server Integration**: Supports server-side feature configuration
7. **Testing Support**: Coverage tracking helps maintain quality

## Best Practices

1. **Feature Naming**

   - Use dot notation for feature paths (e.g., `ui.layout.quickMenu`)
   - Group related features under common namespaces
   - Keep paths consistent with component structure

2. **Feature Configuration**

   - Always include a description
   - Set expectedCoverage for quality tracking
   - List required components
   - Document dependencies

3. **Implementation**

   - Use reactive `useFeature` for template bindings
   - Use `isFeatureEnabled` for one-time checks
   - Include feature checks in unit tests
   - Update feature analysis regularly

4. **Maintenance**
   - Review unused features periodically
   - Monitor coverage metrics
   - Keep documentation updated
   - Clean up disabled features

The feature flag system provides a robust foundation for managing application functionality while maintaining code quality and developer productivity.
