// src/config/database.ts

import { Pool } from 'pg';

const pool = new Pool({
  user: 'Pizzaria',
  host: 'localhost',
  database: 'db_pizzaria',
  password: 'Pizzaria@2025',
  port: 5432,
});

// Apenas testa a conexão na inicialização, sem executar uma query extra aqui.
pool.connect((err, client, release) => {
    if (err) {
        return console.error('ERRO: Não foi possível conectar ao banco de dados.', err.stack);
    }
    // Apenas precisamos saber que o 'client' (garçom) foi obtido com sucesso.
    console.log('✅ Base de dados conectada com sucesso!');
    // Libera o 'client' (garçom) de volta para o pool.
    release();
});

export default pool;