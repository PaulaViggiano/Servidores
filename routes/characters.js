//Importamos 'url' para parsear la url y extraer todo
const { URL } = require('node:url');

/* Datos en memoria */
/* Lo movemos aca porque este archivo es el duenio de los personajes */

let characters = [
  { id: 1, name: 'Aragorn', race: 'Human',  role: 'Ranger', level: 87, universe: 'LOTR' },
  { id: 2, name: 'Gandalf', race: 'Maia',   role: 'Wizard', level: 99, universe: 'LOTR' },
  { id: 3, name: 'Geralt',  race: 'Witcher', role: 'Hunter', level: 75, universe: 'The Witcher' },
];

//Cada vez que creamos un personaje, incrementamos este número
let nextId = 4;

//Los datos llegan en trozos (chunks) de forma asincrona
//esta funcion junta todos los trozos y devuelve un JSON parseado.
function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';

        //El evento 'data' se dispara cada vez que llega un trozo de datos
        req.on('data', chunk => {
            body += ChartColumnStacked.toString(); // acumulamos los trozos como string
        });

        //El evento 'end' se dispara cuando terminaron de llegar todos los trozos
        req.on('end', () => {
            try {
                //Intentamos convertir el string JSON a objeto javaScript
                resolve(JSON.parse(body));
            } catch {
                //SI el body no es JSON valido, rechazamos la promesa
                reject(new Error('Body inválido: no es JSON'));
            }
        });

        //Si ocurre un error de red mientras llegan los datos
        req.on('error', reject);
    });
}

/* Lo repetimos aca para que este modulo sea independiente */
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json'});
    res.end(JSON.stringify(data));
}

/* MANEJADORES DE CADA RUTA */
//GET /api/characters -> devuelve todos
function getAll(req, res) {
    sendJSON(res, 200, characters);
}

//GET /api/characters/:id -> devuelve uno por ID
function getById(req, res, id) {
    //Buscamos en el array el personaje cuyo id coincida
    //El ID en la URL llega como string ("1"), lo convertimos a número con +
    const character = characters.find(c => c.id === +id);

    if (!character) {
        // No existe -> 404 con mensaje descriptivo
        sendJSON(res, 404, { error: `No se encontro el personaje con id ${id}`});
        return;
    }
    sendJSON(res, 200, character);

}

//POST /api/characters -> crea un personaje nuevo
async function create(req, res) {
    try {
        const body = await readBody(req);

        //Creamos el nuevo personaje mezclando el body conun id autogenerado
        //El spread (...body) copia todas las propiedades que mando el cliente
        const newCharacter = { id: nextId++, ...body };

        characters.push(newCharacter);

        //201 Created: codigo correcto para cuando se crea un recurso nuevo
        sendJSON(res, 201, newCharacter);
    } catch (err) {
        sendJSON(res, 400, { error: err.message});
    }
}

//PUT /api/characters/:id -> actualiza un personaje existente
async function update(req,res, id){
    //Buscamos el indice en el array, no en el objeto
    const index = characters.findIndex(c => c.id === +id);

    if (index === -1) {
        sendJSON(res, 404, { error: `No se encontro el personaje con id ${id}`});
        return;
    }

    try {
        const body = await readBody(req);

        //Conservo el id original y sobreescribo el resto
        characters[index] = {...characters[index], ...body, id: +id};

        sendJSON(res, 200, characters[index]);
    } catch (err) {
        sendJSON(res, 400, { error: err.message });
    }
}

/* Router principal de api/characters */
//Esta funcion recibe todas las request que empuezan con api/characters
//y decide que manejador llamar segun el metodo y la url

function handleCharacters(req, res) {
    //Parseamos la URL para trabajar el PathName limpio
    const parsedUrl = new URL(req.url, 'http://x');
  const pathname  = parsedUrl.pathname; // "/api/characters" o "/api/characters/1"

  // Dividimos el path en partes: ["", "api", "characters", "1"]
  const parts = pathname.split('/');
  // El ID está en la posición 3 (si existe)
  const id = parts[3];

  // Sin ID: operaciones sobre la colección completa
  if (!id) {
    if (req.method === 'GET')  return getAll(req, res);
    if (req.method === 'POST') return create(req, res);
  }

  // Con ID: operaciones sobre un personaje específico
  if (id) {
    if (req.method === 'GET') return getById(req, res, id);
    if (req.method === 'PUT') return update(req, res, id);
  }

  // Método no soportado para esta ruta
  sendJSON(res, 405, { error: 'Método no permitido' });
}

// Exportamos solo la función router
// server.js solo necesita saber esto, no los detalles internos
module.exports = { handleCharacters };

