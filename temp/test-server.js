// test-server.js
import express from 'express'
import cors from 'cors'

const app = express()
const port = 3000

// Enable CORS for development
app.use(
  cors({
    origin: 'http://localhost:9001', // Quasar dev server
    credentials: true,
  }),
)

// Settings endpoint
app.get('/api/apps/:appId', (req, res) => {
  res.json({
    settings: {
      ui: {
        theme: {
          dark: true,
          primary: '#FF0000',
          secondary: '#00FF00',
        },
      },
      app: {
        meta: {
          version: '2.0.0',
        },
      },
    },
    i18n: {
      'en-US': {
        app: {
          name: 'Test Override App Name',
        },
      },
    },
  })
})

app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`)
})
