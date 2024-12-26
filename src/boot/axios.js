// src/boot/axios.js
import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  withCredentials: true,
})

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
