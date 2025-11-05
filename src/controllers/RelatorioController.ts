// src/controllers/RelatorioController.ts

import { Request, Response } from 'express';
import { RelatorioService } from '../services/RelatorioService';

export class RelatorioController {
  // Método antigo, para relatórios por ano/mês
  static async gerar(req: Request, res: Response) {
    try {
      const ano = req.query.ano ? parseInt(req.query.ano as string, 10) : undefined;
      const mes = req.query.mes ? parseInt(req.query.mes as string, 10) : undefined;
      
      if (!ano) {
          return res.status(400).json({ erro: "O parâmetro de query 'ano' é obrigatório." });
      }

      const relatorio = await RelatorioService.gerarRelatorioVendas(ano, mes);
      return res.status(200).json(relatorio);
    } catch (error) {
      return res.status(500).json({ erro: "Não foi possível gerar o relatório." });
    }
  }
  
  // NOVO MÉTODO para relatórios por período (data de início e fim)
  static async gerarPorPeriodo(req: Request, res: Response) {
    const { dataInicio, dataFim } = req.query;

    if (!dataInicio || !dataFim) {
        return res.status(400).json({ erro: 'Os parâmetros de query "dataInicio" e "dataFim" são obrigatórios.' });
    }

    try {
        const relatorio = await RelatorioService.gerarRelatorioPorPeriodo(dataInicio as string, dataFim as string);
        res.status(200).json(relatorio);
    } catch (error) {
        console.error("Erro ao gerar relatório por período:", error);
        res.status(500).json({ erro: 'Erro interno ao gerar relatório por período.' });
    }
  }
}