// src/controllers/ProdutoController.ts

import { Request, Response } from 'express';
import { ProdutoService } from '../services/ProdutoService';

export class ProdutoController {

  static async listar(req: Request, res: Response) {
    try {
      const produtos = await ProdutoService.listar();
      return res.status(200).json(produtos);
    } catch (error) {
      return res.status(500).json({ erro: "Ocorreu um erro ao buscar os produtos." });
    }
  }

  static async buscarPorId(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ erro: 'ID do produto inválido.' });
      
      const produto = await ProdutoService.buscarPorId(id);
      if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });
      
      return res.status(200).json(produto);
    } catch (error) {
      return res.status(500).json({ erro: "Ocorreu um erro ao buscar o produto." });
    }
  }

  static async criar(req: Request, res: Response) {
    try {
      const { id, nome, descricao, preco, categoria } = req.body;
      if (!id || !nome || !preco || !categoria) {
        return res.status(400).json({ erro: 'ID, Nome, Preço e Categoria são obrigatórios.' });
      }
      const novoProduto = await ProdutoService.criar({ id, nome, descricao, preco, categoria });
      return res.status(201).json(novoProduto);
    } catch (error) {
      return res.status(500).json({ erro: "Ocorreu um erro ao criar o produto." });
    }
  }
  
  static async editar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ erro: 'ID do produto inválido.' });
      
      const produtoAtualizado = await ProdutoService.editar(id, req.body);
      return res.status(200).json(produtoAtualizado);
    } catch (error) {
      return res.status(500).json({ erro: "Ocorreu um erro ao editar o produto." });
    }
  }

  static async excluir(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ erro: 'ID do produto inválido.' });

      const foiExcluido = await ProdutoService.excluir(id);
      if (!foiExcluido) return res.status(404).json({ erro: 'Produto não encontrado.' });
      
      return res.status(200).json({ mensagem: 'Produto excluído com sucesso.' });
    } catch (error) {
      return res.status(500).json({ erro: "Ocorreu um erro ao excluir o produto." });
    }
  }

  static async search(req: Request, res: Response) {
    try {
      const { termo } = req.query;
      if (!termo || typeof termo !== 'string') {
        return res.status(400).json({ erro: 'O parâmetro "termo" é obrigatório.' });
      }
      const produtos = await ProdutoService.search(termo);
      return res.status(200).json(produtos);
    } catch (error) {
      return res.status(500).json({ erro: "Ocorreu um erro ao pesquisar os produtos." });
    }
  }

  static async atualizarPromocao(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const { em_promocao, preco_promocional } = req.body;

      if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido.' });
      if (typeof em_promocao !== 'boolean') {
        return res.status(400).json({ erro: 'O campo "em_promocao" é obrigatório e deve ser booleano.' });
      }

      const produto = await ProdutoService.atualizarPromocao(id, em_promocao, preco_promocional);
      return res.status(200).json(produto);
    } catch (error) {
      return res.status(500).json({ erro: "Ocorreu um erro ao atualizar a promoção." });
    }
  }

  static async uploadImagem(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ erro: 'ID do produto é inválido.' });
      if (!req.file) return res.status(400).json({ erro: 'Nenhum arquivo de imagem foi enviado.' });

      const url = `/uploads/${req.file.filename}`;
      const produto = await ProdutoService.atualizarUrlImagem(id, url);
      return res.status(200).json(produto);
    } catch (error) {
      return res.status(500).json({ erro: "Ocorreu um erro no upload da imagem." });
    }
  }
}