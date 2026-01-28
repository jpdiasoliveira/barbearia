import jsonServer from 'json-server';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Serve arquivos estáticos da build do React
server.use(express.static(path.join(__dirname, 'dist')));

// Middlewares padrão (logger, static, cors e no-cache)
server.use(middlewares);

// Configuração para rewrite de rotas da API
server.use(jsonServer.rewriter({
    '/api/*': '/$1'
}));

// Monta a API do JSON Server
server.use(router);

// Rota catch-all para servir o index.html do React (SPA) para qualquer rota não-API
server.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


// Porta dinâmica (Railway) ou 3000 local
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`JSON Server + React rodando na porta ${port}`);
});
