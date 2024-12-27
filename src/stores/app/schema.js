// stores/app/schema.js
export const schema = {
  type: 'object',
  required: ['meta', 'state', 'config', 'features'],
  properties: {
    meta: {
      type: 'object',
      required: ['version', 'buildNumber'],
      properties: {
        version: { type: 'string' },
        buildNumber: { type: 'string' },
        lastUpdate: { type: 'string', format: 'date-time' },
      },
    },
    state: {
      type: 'object',
      required: ['initialized', 'online'],
      properties: {
        initialized: { type: 'boolean' },
        online: { type: 'boolean' },
        lastError: {
          type: ['object', 'null'],
          properties: {
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    config: {
      type: 'object',
      required: ['api'],
      properties: {
        api: {
          type: 'object',
          required: ['baseUrl', 'timeout'],
          properties: {
            baseUrl: { type: 'string' },
            timeout: { type: 'number' },
          },
        },
      },
    },
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
    },
  },
}
