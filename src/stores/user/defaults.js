// stores/user/defaults.js
export const defaults = {
  profile: {
    id: 'default',
    email: 'guest@example.com',
    name: 'Guest User',
    avatar: '',
    timezone: 'UTC',
  },
  preferences: {
    language: 'en-US',
    notifications: {
      email: true,
      push: true,
    },
  },
  permissions: [],
}
