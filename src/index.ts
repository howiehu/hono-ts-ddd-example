import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Start the server if this file is run directly
if (import.meta.url.endsWith('index.ts')) {
  serve({
    fetch: app.fetch,
    port: 3000
  }, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  })
}

// Export the app for testing
export { app }
