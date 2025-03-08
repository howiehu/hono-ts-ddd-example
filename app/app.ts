import { serve } from "@hono/node-server";
import app from "./app.hono.js";

const PORT = Number(process.env.PORT) || 3000

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  info => {
    console.log('\x1b[32m%s\x1b[0m', `Server running on http://localhost:${info.port}`)
  }
)