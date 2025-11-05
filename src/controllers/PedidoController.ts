// src/controllers/PedidoController.ts

import { Request, Response } from 'express';
import { PedidoService } from '../services/PedidoService';

export class PedidoController {

  // ====================================================================
  // ESTA É A FUNÇÃO QUE ESTAVA FALTANDO E CAUSANDO O ERRO
  static async listar(req: Request, res: Response) {
    try {
      // NOTA: A lógica para listar pedidos no service ainda precisa ser feita.
      // Esta função é um placeholder para corrigir o erro e permitir que o servidor inicie.
      // const pedidos = await PedidoService.listar();
      // return res.json(pedidos);
      return res.status(501).json({ message: 'Função de listar pedidos ainda não implementada.' });
    } catch (error) {
       console.error("Erro no controller ao listar pedidos:", error);
       return res.status(500).json({ erro: "Ocorreu um erro ao buscar os pedidos." });
    }
  }
  // ====================================================================

  static async criar(req: Request, res: Response) {
    try {
      const { clienteId, formaPagamento, itens } = req.body;

      if (!clienteId || !formaPagamento || !itens) {
        return res.status(400).json({ erro: 'Dados do pedido incompletos' });
      }

      const pedidoCriado = await PedidoService.criar(clienteId, itens, formaPagamento);
      
      return res.status(201).json(pedidoCriado);

    } catch (error: any) {
      console.error("Erro no controller ao criar pedido:", error);
      return res.status(400).json({ erro: error.message });
    }
  }
}