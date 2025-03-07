import { describe, it, expect } from 'vitest'
import { app } from './index.js'

describe('Hono App', () => {

  it('should return "Hello Hono!" for GET /', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Hello Hono!')
  })

  it('should return 404 for non-existent routes', async () => {
    const res = await app.request('/non-existent')
    expect(res.status).toBe(404)
  })
})