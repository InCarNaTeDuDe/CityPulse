import 'reflect-metadata';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeDatabase } from './db/index.js';
import apiRouter from './routes/index.js';

async function startServer() {
  // Initialize backend relational database source (PostgreSQL with local fallback)
  await initializeDatabase();

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mount our modular repository pattern API routes
  app.use('/api', apiRouter);

  // Serve static UI assets (Vite dev mode or compiled index fallback)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Full-stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start modular full-stack server:', error);
});
