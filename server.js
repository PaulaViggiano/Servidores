//Importamamos el modulo nativo 'http' de node.js -> Es como decirle "Necesito las herramientas para crear un servidor"
const http = require('node:http');
const fs = require('node:fs'); //leer archivos del disco
const path = require('node:path'); //Para construir rutas de carpetas


//Definimos el puerto donde va a escuchar el servidor
const PORT = 3000;

//Array en memoria, los personajes viven mientras el servidor este corriendo
//Cuando reiniciamos el servidor, estos datos se reinician tambien
const characters = [
    { id: 1, name: 'Aragorn', race: 'Human', role: 'Ranger', level: 87, universe: 'LOTR'},
    { id: 2, name: 'Gandalf', race: 'Maia', role: 'Wizard', level: 99, universe: 'LOTR' },
    { id: 3, name: 'Geralt', race: 'Witcher', role: 'Hunter', level: 75, universe: 'The Witcher'},
];

//Fn Envia una respuesta JSON
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-type': 'application/json'});
    res.end(JSON.stringify(data));
}

// Mapa de extensiones → Content-Type
// Le dice al navegador qué tipo de archivo está recibiendo
// Sin esto, el navegador no sabe si es HTML, CSS, JS, etc.
const MIME_TYPES = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
};

//Fn que sirve un archivo estatico desde la carpeta public/
function serveStaticFile(res, filePath) {
    //Obtenemos la ectension del archivos -> ".html, .css, etc"
    const ext = path.extname(filePath);

    //Buscamos el Content-Type correspondiente
    //Si no conocemos la extension, usamos uno generico
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    //Leemos el archivo del disco de forma asincrona Node.js no se bloquea esperando - sigue atendiendo otras request
    fs.readFile(filePath, (err, data) => {
        if (err) {
            //El archivo no existe u ocurrio un error de lectura
            sendJSON(res, 404, { error: 'Archivo no encontrado' });
        }

        //Todo bien -> enviamos el archivo con su Content-Type correcto
        res.writeHead(200, { 'Content-Type': contentType});
        res.end(data);
    });
}

//Creamos el servidor
//El callback se ejecuta cada vez que llega una peticion HTTP
const server = http.createServer((req, res) => {
    //req -> la peticion que llego (que tura, que metodo, que datos)
    //res-> respuesta que vamos a mandar
    /*------------ RUTAS DE API -------------- */
    //Ruta de prueba: GET/ping -> responde "pong"
    if (req.method === 'GET' && req.url === '/ping') {
        res.writeHead(200, { 'content-type': 'text/plain'});
        res.end('pong');
        return;
    }

    //Ruta principal: GET /api/characters -> devuelve todos los personajes
    if (req.method === 'GET' && req.url === '/api/characters') {
        sendJSON(res, 200, characters);
        return;
    }

    /* ------------ Archivos estaticos ----------- */
    //Solo servimos archivos estaticos en peticiones GET
    if (req.method === 'GET') {
        //Si piden la raiz "/", redirigimos a index.html
        const urlPath = req.url === '/' ? 'index.html' : req.url;

        //Contruimos la ruta absoluta en disco
        //__dirname = carpeta donde esta server.js
        //Ejemplo: /home/usuario/mi-proyecto/public/index.html
        const filePeth = path.join(__dirname, 'public', urlPath);

        //Seguridad: verificamos que la ruta resultante esta dentro de public
        //evita ataques tipo: GET/../../etc/passwd
        const publicDir = path.join(__dirname, 'public');
        if (!filePath.startwith(publicDir)) {
            sendJSON(res, 403, { error: 'Acceso denegado' });
            return;
        }

        serveStaticFile(res, filePath);
        return;
    }

    //Si no matcheo ninguna ruta, respondemos 404
    sendJSON(res, 404, { error: 'Ruta no encontrada'});
});

//Le decimos al SERVIDOR que empiece a escuchar en el puerto 3000
server.listen(PORT, () => {
    //Este msj solo apararece cuando el serv arranca
    console.log(`Servidor corriendo en http://localhost:${PORT}`);

});

