const { URL } = require('node:url');

let characters = [
  { id: 1, name: 'Aragorn', race: 'Human',   role: 'Ranger', level: 87, universe: 'LOTR' },
  { id: 2, name: 'Gandalf', race: 'Maia',    role: 'Wizard', level: 99, universe: 'LOTR' },
  { id: 3, name: 'Geralt',  race: 'Witcher', role: 'Hunter', level: 75, universe: 'The Witcher' },
];

// Math.max busca el ID más alto y le suma 1.
// Si el array está vacío, Math.max(...[]) da -Infinity, por eso el 0 como fallback.
function getNextId() {
  return characters.length === 0
    ? 1
    : Math.max(...characters.map(c => c.id)) + 1;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Body inválido: no es JSON'));
      }
    });

    req.on('error', reject);
  });
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function getAll(req, res) {
  sendJSON(res, 200, characters);
}

function getById(req, res, id) {
  const character = characters.find(c => c.id === +id);
  if (!character) {
    sendJSON(res, 404, { error: `No se encontró el personaje con id ${id}` });
    return;
  }
  sendJSON(res, 200, character);
}

async function create(req, res) {
  try {
    const body = await readBody(req);
    const newCharacter = { id: getNextId(), ...body };
    characters.push(newCharacter);
    sendJSON(res, 201, newCharacter);
  } catch (err) {
    sendJSON(res, 400, { error: err.message });
  }
}

async function update(req, res, id) {
  const index = characters.findIndex(c => c.id === +id);
  if (index === -1) {
    sendJSON(res, 404, { error: `No se encontró el personaje con id ${id}` });
    return;
  }
  try {
    const body = await readBody(req);
    characters[index] = { ...characters[index], ...body, id: +id };
    sendJSON(res, 200, characters[index]);
  } catch (err) {
    sendJSON(res, 400, { error: err.message });
  }
}

function handleCharacters(req, res) {
  const parsedUrl = new URL(req.url, 'http://x');
  const parts = parsedUrl.pathname.split('/');
  const id = parts[3];

  if (!id) {
    if (req.method === 'GET')  return getAll(req, res);
    if (req.method === 'POST') return create(req, res);
  }

  if (id) {
    if (req.method === 'GET') return getById(req, res, id);
    if (req.method === 'PUT') return update(req, res, id);
  }

  sendJSON(res, 405, { error: 'Método no permitido' });
}

module.exports = { handleCharacters };