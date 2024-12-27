import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { Quasar } from 'quasar'
import * as components from '@quasar/extras'

// Mock window.localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn(),
}

// Mock window.fs for file operations
const fsMock = {
  readFile: vi.fn(),
}

global.localStorage = localStorageMock
global.window = {
  ...global.window,
  localStorage: localStorageMock,
  fs: fsMock,
}

// Configure Vue Test Utils
config.global.plugins = [[Quasar, { components }]]

// Reset all mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})
