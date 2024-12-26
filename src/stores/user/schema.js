// stores/user/schema.js
export const schema = {
  type: 'object',
  required: ['profile', 'preferences', 'permissions'],
  properties: {
    profile: {
      type: 'object',
      required: ['id', 'email', 'name'],
      properties: {
        id: { type: 'string' },
        email: { type: 'string', format: 'email' },
        name: { type: 'string' },
        avatar: { type: 'string' },
        timezone: { type: 'string' },
      },
    },
    preferences: {
      type: 'object',
      required: ['language', 'notifications'],
      properties: {
        language: { type: 'string' },
        notifications: {
          type: 'object',
          properties: {
            email: { type: 'boolean' },
            push: { type: 'boolean' },
          },
        },
      },
    },
    permissions: {
      type: 'array',
      items: { type: 'string' },
    },
  },
}
