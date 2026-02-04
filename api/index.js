import jsonServer from 'json-server';
import fs from 'fs';
import path from 'path';

const server = jsonServer.create();
const middlewares = jsonServer.defaults();

// Allow CORS
server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');
    next();
});

// Load DB from file to memory
// We use path.join(process.cwd(), 'db.json') because Vercel often puts root files in process.cwd()
const dbPath = path.join(process.cwd(), 'db.json');
const dbContent = fs.readFileSync(dbPath, 'utf-8');
const db = JSON.parse(dbContent);

const router = jsonServer.router(db);

server.use(middlewares);

// Rewriter for Vercel paths
server.use(jsonServer.rewriter({
    '/api/*': '/$1'
}));

server.use(router);

export default server;
