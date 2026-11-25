import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Runs the files in /api inside the Vite dev server, so `npm run dev` behaves
// like production: the Gemini key stays on the server and never reaches the
// browser. On Vercel the same files deploy as serverless functions.
function devApi() {
  return {
    name: 'acuity-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/coach', async (req, res) => {
        // Vercel parses JSON bodies and adds res.status / res.json; mirror that.
        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        res.json = (body) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
          return res;
        };
        try {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const raw = Buffer.concat(chunks).toString('utf8');
          req.body = raw ? JSON.parse(raw) : {};
        } catch {
          res.status(400).json({ error: 'Invalid JSON.' });
          return;
        }
        const { default: handler } = await server.ssrLoadModule('/api/coach.js');
        await handler(req, res);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Hand server-only values from .env to the dev API. They have no VITE_
  // prefix, so Vite never exposes them to client code.
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ['GEMINI_API_KEY', 'VITE_GEMINI_API_KEY', 'COACH_MODEL']) {
    if (env[key] && !process.env[key]) process.env[key] = env[key];
  }

  return {
    plugins: [react(), devApi()],
    build: {
      rollupOptions: {
        // Two pages: the site and the app at /try/.
        input: {
          main: resolve(process.cwd(), 'index.html'),
          try: resolve(process.cwd(), 'try/index.html'),
        },
      },
    },
  };
});
