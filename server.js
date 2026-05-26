//Importamamos el mod nativo 'http' de node.js -> Es como decirle "Necesito las herramientas para crear un servidor"
const http = require('node:http');

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

//Creamos el servidor
//El callback se ejecuta cada vez que llega una peticion HTTP
const server = http.createServer((req, res) => {
    //req -> la peticion que llego (que tura, que metodo, que datos)
    //res-> respuesta que vamos a mandar

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

    //Si no matcheo ninguna ruta, respondemos 404
    sendJSON(res, 404, { error: 'Ruta no encontrada'});
});

//Le decimos al SERVIDOR que empiece a escuchar en el puerto 3000
server.listen(PORT, () => {
    //Este msj solo apararece cuando el serv arranca
    console.log(`Servidor corriendo en http://localhost:${PORT}`);

});

