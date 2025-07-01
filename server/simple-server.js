import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../client')));

// Rota de teste
app.get('/test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bovinet - Teste</title>
      <style>
        body {
          background-color: #1E2A38;
          color: white;
          font-family: Arial, sans-serif;
          padding: 20px;
          margin: 0;
        }
        .status {
          background: #4CAF50;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
          font-size: 18px;
        }
        h1 {
          color: #4CAF50;
          font-size: 36px;
        }
      </style>
    </head>
    <body>
      <h1>🟢 BOVINET - SERVIDOR FUNCIONANDO!</h1>
      <div class="status">✓ Servidor Express respondendo na porta ${port}</div>
      <div class="status">✓ Rota /test funcionando perfeitamente</div>
      <div class="status">✓ Timestamp: ${new Date().toLocaleString('pt-BR')}</div>
      <div class="status">✓ URL: ${req.url}</div>
      <div class="status">✓ Host: ${req.headers.host}</div>
      
      <h2 style="color: #4CAF50; margin-top: 40px;">Sistema Simplificado Funcionando</h2>
      <p style="font-size: 18px;">
        Se você vê esta página, o servidor básico está funcionando corretamente.
        O problema anterior era com as dependências complexas do banco de dados.
      </p>
    </body>
    </html>
  `);
});

// Rota padrão
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bovinet</title>
      <style>
        body {
          background-color: #1E2A38;
          color: white;
          font-family: Arial, sans-serif;
          padding: 20px;
          margin: 0;
          text-align: center;
        }
        .logo {
          color: #4CAF50;
          font-size: 48px;
          font-weight: bold;
          margin: 50px 0;
        }
        .btn {
          background: #4CAF50;
          color: white;
          padding: 15px 30px;
          border: none;
          border-radius: 8px;
          font-size: 18px;
          margin: 10px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }
        .btn:hover {
          background: #45a049;
        }
      </style>
    </head>
    <body>
      <div class="logo">BOVINET</div>
      <h2>Plataforma de Negociação de Gado</h2>
      <p style="font-size: 18px; margin: 40px 0;">
        Conectamos produtores, compradores e prestadores de serviços no agronegócio brasileiro
      </p>
      
      <a href="/test" class="btn">🔧 Página de Teste</a>
      
      <div style="margin-top: 60px;">
        <h3>Funcionalidades:</h3>
        <p>• Marketplace de Gado</p>
        <p>• Sistema de Frete Inteligente</p>
        <p>• Emissão de GTA</p>
        <p>• Verificação de Identidade</p>
      </div>
    </body>
    </html>
  `);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🟢 Bovinet servidor funcionando na porta ${port}`);
  console.log(`Acesse: http://localhost:${port}`);
  console.log(`Teste: http://localhost:${port}/test`);
});