// src/services/PedidoService.ts

import pool from '../database/config/database';
import { ClienteService } from './ClienteService';
import { ProdutoService } from './ProdutoService';

// Interface para os itens que vêm da requisição do frontend
interface ItemCarrinho {
  produtoId: number;
  quantidade: number;
}

export class PedidoService {
  
  static async criar(clienteId: number, itensCarrinho: ItemCarrinho[], formaPagamento: string): Promise<any> {
    // 1. Validações iniciais: Buscamos o cliente e os produtos no banco.
    //    Isso só funciona porque agora ClienteService e ProdutoService são 'async'.
    const cliente = await ClienteService.buscarPorId(clienteId);
    if (!cliente) {
      throw new Error(`Cliente com ID ${clienteId} não encontrado.`);
    }

    if (!itensCarrinho || itensCarrinho.length === 0) {
        throw new Error("O pedido deve ter pelo menos um item.");
    }

    let totalPedido = 0;
    const itensVerificados = [];

    for (const item of itensCarrinho) {
      const produto = await ProdutoService.buscarPorId(item.produtoId);
      if (!produto) {
        throw new Error(`Produto com ID ${item.produtoId} não encontrado.`);
      }
      // O preço vem do banco de dados, não do frontend, por segurança.
      totalPedido += produto.preco * item.quantidade;
      itensVerificados.push({ ...produto, quantidade: item.quantidade });
    }
    
    // 2. Conecta ao banco para iniciar a transação
    const client = await pool.connect();
    
    try {
      // Começa a transação. A partir daqui, ou tudo funciona, ou tudo é desfeito.
      await client.query('BEGIN');

      // 3. Insere o registro principal na tabela 'pedidos'
      const sqlPedido = 'INSERT INTO pedidos (cliente_id, total, forma_pagamento, data_pedido) VALUES ($1, $2, $3, NOW()) RETURNING id';
      const valuesPedido = [clienteId, totalPedido, formaPagamento];
      const resPedido = await client.query(sqlPedido, valuesPedido);
      const novoPedidoId = resPedido.rows[0].id;

      // 4. Itera sobre os itens do pedido e insere cada um na tabela 'pedido_itens'
      for (const item of itensVerificados) {
        const sqlItem = 'INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco_unitario) VALUES ($1, $2, $3, $4)';
        const valuesItem = [novoPedidoId, item.id, item.quantidade, item.preco];
        await client.query(sqlItem, valuesItem);
      }
      
      // 5. Se todos os comandos acima funcionaram, confirma a transação
      await client.query('COMMIT');
      
      // 6. Retorna um objeto com os detalhes do pedido criado para o controller
      return { id: novoPedidoId, total: totalPedido, cliente, itens: itensVerificados };

    } catch (error) {
      // 7. Se qualquer um dos comandos falhou, desfaz todas as operações
      await client.query('ROLLBACK');
      console.error('Erro na transação do pedido, rollback executado:', error);
      // Lança o erro para o controller poder capturá-lo
      throw new Error('Não foi possível criar o pedido devido a um erro no banco de dados.');
    } finally {
      // 8. Independentemente de sucesso ou falha, libera a conexão de volta para o pool
      client.release();
    }
  }

  // A função de listar pedidos também precisaria ser refatorada com SQL
  // static async listar(): Promise<any[]> { ... }
}