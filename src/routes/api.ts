// src/routes/api.ts

import { Router } from 'express';
import multer from 'multer';
import { multerConfig } from '../database/config/multerConfig';

import { ClienteController } from '../controllers/ClienteController';
import { ProdutoController } from '../controllers/ProdutoController';
import { PedidoController } from '../controllers/PedidoController';
import { RelatorioController } from '../controllers/RelatorioController';

const router = Router();
const upload = multer(multerConfig);

// --- Rotas de Clientes ---
router.get('/clientes', ClienteController.listar);
router.post('/clientes', ClienteController.criar);
router.get('/clientes/search', ClienteController.search);
router.delete('/clientes/:id', ClienteController.delete);

// --- Rotas de Produtos (Cardápio / Itens) ---
router.get('/produtos', ProdutoController.listar);
router.get('/produtos/search', ProdutoController.search);
router.get('/produtos/:id', ProdutoController.buscarPorId);
router.post('/produtos', ProdutoController.criar);
router.put('/produtos/:id', ProdutoController.editar);
router.delete('/produtos/:id', ProdutoController.excluir);
router.patch('/produtos/:id/promocao', ProdutoController.atualizarPromocao);
router.patch('/produtos/:id/imagem', upload.single('imagem'), ProdutoController.uploadImagem);

// --- Rotas de Pedidos ---
router.get('/pedidos', PedidoController.listar);
router.post('/pedidos', PedidoController.criar);

// --- Rotas de Relatórios ---
router.get('/relatorios/vendas', RelatorioController.gerar); // Rota antiga mantida

// NOVA ROTA para relatórios com período customizado
router.get('/relatorios/periodo', RelatorioController.gerarPorPeriodo);

export default router;