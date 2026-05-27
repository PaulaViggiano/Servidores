const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const { handleCharacters } = require('./routes/characters');

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
};

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function serveStaticFile(res, filePath) {
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendJSON(res, 404, { error: 'Archivo no encontrado' });
      return; 
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {

  if (req.method === 'GET' && req.url === '/ping') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('pong');
    return;
  }

  if (req.url.startsWith('/api/characters')) {
    handleCharacters(req, res);
    return;
  }

  if (req.method === 'GET') {
    const urlPath = req.url === '/' ? '/index.html' : req.url;
    const filePath = path.join(__dirname, 'public', urlPath);
    const publicDir = path.join(__dirname, 'public');

    
    if (!filePath.startsWith(publicDir)) {
      sendJSON(res, 403, { error: 'Acceso denegado' });
      return;
    }

    serveStaticFile(res, filePath);
    return;
  }

  sendJSON(res, 404, { error: 'Ruta no encontrada' });
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});