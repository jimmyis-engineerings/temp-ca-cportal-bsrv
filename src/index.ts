import { Hono } from 'hono'
import { api } from './routes'
import { initializeDatabase } from './db/init'

(async () => {
  try {
    console.log('Initializing database...');
    console.log(process.env);
    
    await initializeDatabase();
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization failed:', error);
    // Continue running the app even if database fails to initialize
  }
})();


const app = new Hono()
  .get('/', async (c) => {
    return c.json({ status: "ok" })
  })
  .route('/api', api)

export default {
  port: 3001,
  fetch(req: any, server: any) {
    return app.fetch(req, { ip: server.requestIP(req) })
  },
  maxRequestBodySize: (1024 * 1024) * 2000, // Extend the limit to 2000MB
}
