import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Load environment variables into process.env for local API serverless handlers
function loadEnvToProcessEnv() {
  for (const envFile of ['.env', '.env.local']) {
    const fullPath = path.resolve(__dirname, envFile);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}
loadEnvToProcessEnv();

function vercelDevServerPlugin(): Plugin {
  return {
    name: 'vercel-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req: any, res: any, next) => {
        if (!req.url?.startsWith('/api')) {
          return next();
        }

        const urlObj = new URL(req.url, 'http://localhost:5173');
        const pathname = urlObj.pathname;

        // Mock upload endpoint for local testing without Cloudflare credentials
        if (pathname === '/api/storage/local-upload-mock') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'ok', message: 'Local upload simulated successfully' }));
          return;
        }

        // Strip /api/ and map to api/*.ts
        const apiRelativePath = pathname.replace(/^\/api\/?/, '');
        if (!apiRelativePath) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ detail: 'Not found' }));
          return;
        }

        // 1. Try exact match or with .ts
        let filePath = path.resolve(__dirname, 'api', apiRelativePath + '.ts');
        let matchedAction: string | undefined;

        if (!fs.existsSync(filePath)) {
          // 2. Try index file
          const indexFilePath = path.resolve(__dirname, 'api', apiRelativePath, 'index.ts');
          if (fs.existsSync(indexFilePath)) {
            filePath = indexFilePath;
          } else {
            // 3. Dynamic route matching (e.g. /api/admin/login -> api/admin/[action].ts)
            const segments = apiRelativePath.split('/').filter(Boolean);
            if (segments.length === 2) {
              const folder = segments[0];
              const action = segments[1];
              const dynamicPath = path.resolve(__dirname, 'api', folder, '[action].ts');
              if (fs.existsSync(dynamicPath)) {
                filePath = dynamicPath;
                matchedAction = action;
              }
            }
          }
        }

        if (!fs.existsSync(filePath)) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ detail: `API endpoint /api/${apiRelativePath} not found` }));
          return;
        }

        try {
          // Parse query
          const query: Record<string, any> = {};
          urlObj.searchParams.forEach((val, key) => {
            query[key] = val;
          });
          if (matchedAction && !query.action) {
            query.action = matchedAction;
          }
          req.query = query;

          // Parse body if request contains payload
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')) {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            const rawBody = Buffer.concat(chunks).toString('utf-8');
            const contentType = req.headers['content-type'] || '';
            if (contentType.includes('application/json') && rawBody.trim()) {
              try {
                req.body = JSON.parse(rawBody);
              } catch {
                req.body = rawBody;
              }
            } else {
              req.body = rawBody;
            }
          } else {
            req.body = {};
          }

          // Enhance res with status, json, send
          res.status = (code: number) => {
            res.statusCode = code;
            return res;
          };
          res.json = (data: any) => {
            if (!res.headersSent) {
              res.setHeader('Content-Type', 'application/json');
            }
            res.end(JSON.stringify(data));
            return res;
          };
          res.send = (body: any) => {
            res.end(body);
            return res;
          };

          const module = await server.ssrLoadModule(filePath);
          const handler = module.default || module;
          if (typeof handler === 'function') {
            await handler(req, res);
          } else {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ detail: `Endpoint ${apiRelativePath} has no default export` }));
          }
        } catch (err: any) {
          console.error(`[API Error] ${req.url}:`, err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ detail: err.message || 'Internal Server Error' }));
          }
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), vercelDevServerPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none',
  },
  build: {
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          vendor: ['react', 'react-dom', 'lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
})
