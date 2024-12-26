// stores/resource/schema.js
export const schema = {
  type: 'object',
  required: ['loading', 'error', 'data'],
  properties: {
    loading: {
      type: 'object',
      patternProperties: {
        '.*': { type: 'boolean' },
      },
    },
    error: {
      type: 'object',
      patternProperties: {
        '.*': {
          type: 'object',
          properties: {
            message: { type: 'string' },
            code: { type: 'string' },
          },
        },
      },
    },
    data: {
      type: 'object',
      patternProperties: {
        '.*': { type: 'array' },
      },
    },
  },
}
