

//Modules
const http = require('http');
const fs = require('fs');
const path = require('path');


//Chemin absolu vers le dossier public
const publicDir = path.join(__dirname, 'public');

//Indique au navigateur comment interpréter ces fichiers
const mimeTypes = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.svg':  'image/svg+xml'
};


//Créer un serveur http
http.createServer((req, res) => {
  
  //Si l'url est / on sert login.html
  let filePath = req.url === '/' ? '/html/login.html' : req.url;

  
  filePath = path.join(publicDir, filePath);

  //on extrait l'extension du fichier en minuscule
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  //on lit le contenu du fichier
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Fichier non trouvé');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}).listen(8000, () => {
  console.log('Serveur démarré sur http://localhost:8000');
});