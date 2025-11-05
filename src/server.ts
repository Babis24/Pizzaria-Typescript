// src/server.ts

import express from 'express';
import cors from 'cors';
import path from 'path'; // path já deve estar importado
import apiRoutes from './routes/api';
import pool from './database/config/database';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota virtual para as imagens (isso pode continuar)
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'public', 'uploads')));


// --- CONFIGURAÇÃO PRINCIPAL DO FRONTEND ---
// Esta linha diz ao Express: "Sirva os arquivos da pasta 'public' como se fossem a raiz do site"
// O path.resolve garante que o caminho até a pasta 'public' seja encontrado corretamente.
app.use(express.static(path.resolve(__dirname, '..', 'public')));


// --- ROTAS DA API ---
// Suas rotas da API continuam funcionando normalmente, com o prefixo /api
app.use('/api', apiRoutes);


// ... (resto do seu arquivo com a função startServer)
async function startServer() {
  try {
    const client = await pool.connect();
    console.log('✅ Base de dados conectada com sucesso!');
    client.release();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Falha ao conectar com o banco de dados:', error);
    process.exit(1);
  }
}

startServer();