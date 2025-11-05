// src/controllers/ClienteController.ts

import { Request, Response } from 'express';
import { ClienteService } from '../services/ClienteService';

export class ClienteController {

  static async listar(req: Request, res: Response) {
    try {
      const clientes = await ClienteService.listar();
      return res.status(200).json(clientes);
    } catch (error) {
      return res.status(500).json({ erro: "Ocorreu um erro ao buscar os clientes." });
    }
  }
  
  static async criar(req: Request, res: Response) {
    try {
      const { nome, telefone, endereco } = req.body;
      if (!nome || !telefone) {
        return res.status(400).json({ erro: 'Nome e telefone são obrigatórios' });
      }
      const novoCliente = await ClienteService.criar(nome, telefone, endereco);
      return res.status(201).json(novoCliente);
    } catch (error) {
      return res.status(500).json({ erro: "Ocorreu um erro ao criar o cliente." });
    }
  }

  static async search(req: Request, res: Response) {
    try {
      const { termo } = req.query;
      if (!termo || typeof termo !== 'string') {
        return res.status(400).json({ erro: 'O parâmetro "termo" é obrigatório.' });
      }
      const clientes = await ClienteService.search(termo);
      return res.status(200).json(clientes);
    } catch (error) {
      return res.status(500).json({ erro: "Ocorreu um erro ao pesquisar os clientes." });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ erro: 'O ID fornecido é inválido.' });
      
      const foiDeletado = await ClienteService.delete(id);
      if (!foiDeletado) return res.status(404).json({ erro: 'Cliente não encontrado.' });
      
      return res.status(200).json({ mensagem: 'Cliente deletado com sucesso.' });
    } catch (error) {
      return res.status(500).json({ erro: "Ocorreu um erro ao deletar o cliente." });
    }
  }
}