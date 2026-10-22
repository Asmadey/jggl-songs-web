const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, 'dist');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.png': 'image/png', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };
http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  try {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (!pathname.endsWith('/') && !path.extname(pathname)) { res.writeHead(308, { Location: pathname + '/' }); res.end(); return; } // same as Vercel trailingSlash
    if (pathname.endsWith('/')) pathname += 'index.html';
    const target = fs.realpathSync(path.resolve(root, '.' + pathname));
    if (!target.startsWith(root + path.sep) || !fs.statSync(target).isFile()) throw new Error('Not found');
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') res.end(); else fs.createReadStream(target).pipe(res);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(4174, '127.0.0.1', () => console.log('JGGL Songs: http://127.0.0.1:4174/'));
