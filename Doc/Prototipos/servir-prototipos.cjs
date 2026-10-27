/* Prévia local dos documentos visuais. Executar com Node.js, sem dependências. */
const http = require('node:http');
const fs = require('node:fs');
const caminho = require('node:path');

const pastaDocumentos = caminho.resolve(__dirname, '..');
const porta = Number(process.argv[2] || 8769);
const tipos = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

const servidor = http.createServer((requisicao, resposta) => {
  let arquivo;
  try {
    const endereco = new URL(requisicao.url, 'http://127.0.0.1');
    const relativo = decodeURIComponent(endereco.pathname);
    arquivo = caminho.resolve(pastaDocumentos, '.' + relativo);
    if (arquivo !== pastaDocumentos && !arquivo.startsWith(pastaDocumentos + caminho.sep)) {
      resposta.writeHead(403).end('Acesso não permitido.');
      return;
    }
  } catch {
    resposta.writeHead(400).end('Endereço inválido.');
    return;
  }
  fs.stat(arquivo, (erro, dados) => {
    if (erro) {
      resposta.writeHead(404).end('Arquivo não encontrado.');
      return;
    }
    if (dados.isDirectory()) arquivo = caminho.join(arquivo, 'index.html');
    fs.readFile(arquivo, (falha, conteudo) => {
      if (falha) {
        resposta.writeHead(404).end('Arquivo não encontrado.');
        return;
      }
      resposta.writeHead(200, {
        'Content-Type': tipos[caminho.extname(arquivo)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      resposta.end(conteudo);
    });
  });
});

servidor.on('error', erro => {
  console.error('Não foi possível iniciar a prévia:', erro.message);
  process.exitCode = 1;
});
servidor.listen(porta, '127.0.0.1', () => {
  console.log(`Decifra: http://127.0.0.1:${porta}/Prototipos/`);
});
