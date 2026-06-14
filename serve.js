#!/usr/bin/env node
// Static file server for the GameCraft website with COOP/COEP headers
// (required for Godot Web exports). Usage: node serve.js [port] [root]
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = parseInt(process.argv[2] || '8000', 10);
const root = path.resolve(process.argv[3] || '.');
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript',
  '.wasm': 'application/wasm', '.pck': 'application/octet-stream',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.css': 'text/css', '.json': 'application/json', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.mp4': 'video/mp4',
};

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const fp = path.join(root, p);
  if (!fp.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(fp, (e, data) => {
    if (e) { res.writeHead(404); return res.end('404: ' + p); }
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.writeHead(200, { 'Content-Type': mime[path.extname(fp)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(port, '0.0.0.0', () => {
  console.log(`Serving ${root} at http://0.0.0.0:${port}/`);
});
