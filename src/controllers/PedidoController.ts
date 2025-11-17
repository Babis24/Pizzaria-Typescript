// src/controllers/PedidoController.ts

import { Request, Response } from 'express';
import { PedidoService } from '../services/PedidoService';
import { pool } from '../database/database'; // Importamos o pool para as novas funções

const pedidoService = new PedidoService();

// ROTA PROTEGIDA: Apenas para usuários logados
export const createPedido = async (req: Request, res: Response) => {
    try {
        const clienteId = req.usuario?.id;
        if (!clienteId) {
            return res.status(401).json({ erro: "Cliente não autenticado." });
        }
        
        const { formaPagamento, itens } = req.body;
        const pedidoData = { clienteId, formaPagamento, itens };
        const novoPedido = await pedidoService.create(pedidoData);
        
        res.status(201).json(novoPedido);
    } catch (error: any) {
        res.status(400).json({ erro: error.message });
    }
};

// ROTA DE ADMIN: Para listar todos os pedidos
export const getAllPedidos = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT p.id, p.data_pedido, p.total, p.status_pedido, c.nome as cliente_nome 
            FROM pedidos p 
            JOIN clientes c ON p.cliente_id = c.id 
            ORDER BY p.data_pedido DESC
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ erro: 'Falha ao buscar pedidos.' });
    }
};

// ROTA DE ADMIN: Para deletar um pedido específico
export const deletePedido = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM pedidos WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ erro: 'Pedido não encontrado.' });
        }
        res.status(200).json({ mensagem: 'Pedido excluído com sucesso.' });
    } catch (error) {
        res.status(500).json({ erro: 'Falha ao excluir pedido.' });
    }
};