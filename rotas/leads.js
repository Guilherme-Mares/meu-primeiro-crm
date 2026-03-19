import { Router } from 'express';
import { verificarSessao } from '../middlewares/verificarSessao.js';
import {
    listarLeads,
    buscarLeadPorNome,
    cadastrarNovoLead,
    editarLead,
    atualizarStatusLead,
    excluirLead
} from '../funcoes/leads.js';

const router = Router();

// Todas as rotas de leads exigem autenticação
router.use(verificarSessao);

/**
 * GET /api/leads
 * Retorna todos os leads. Aceita ?busca=nome para filtrar.
 */
router.get('/', async (req, res) => {
    const { busca } = req.query;

    if (busca) {
        const resultados = await buscarLeadPorNome(busca);
        return res.json(resultados);
    }

    const leads = await listarLeads();
    res.json(leads);
});

/**
 * POST /api/leads
 * Cria um novo lead. Usa o id_usuario do token JWT.
 * Body: { nome, email, telefone }
 */
router.post('/', async (req, res) => {
    try {
        const { nome, email, telefone } = req.body;
        const { id_usuario } = req.usuario;

        const novoLead = await cadastrarNovoLead(nome, email, telefone, id_usuario);

        if (!novoLead) {
            return res.status(400).json({ erro: 'Dados inválidos. Verifique nome, email e telefone.' });
        }

        res.status(201).json(novoLead);
    } catch (erro) {
        console.error('❌ ERRO CRÍTICO no POST /api/leads:', erro);
        res.status(500).json({ erro: 'Erro interno do servidor ao cadastrar lead.' });
    }
});

/**
 * PUT /api/leads/:id
 * Edita um lead existente.
 * Body: { nome?, email?, telefone?, status? }
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const novosDados = req.body;

    // Se só veio o campo status, usa a função específica do funil
    if (Object.keys(novosDados).length === 1 && novosDados.status) {
        const atualizado = await atualizarStatusLead(id, novosDados.status);
        if (!atualizado) {
            return res.status(400).json({ erro: 'Status inválido ou lead não encontrado.' });
        }
        return res.json(atualizado);
    }

    const atualizado = await editarLead(id, novosDados);

    if (!atualizado) {
        return res.status(400).json({ erro: 'Lead não encontrado ou dados inválidos.' });
    }

    res.json(atualizado);
});

/**
 * DELETE /api/leads/:id
 * Exclui um lead pelo ID.
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const deletado = await excluirLead(id);

    if (!deletado) {
        return res.status(404).json({ erro: `Lead com ID ${id} não encontrado.` });
    }

    res.json({ mensagem: `Lead com ID ${id} removido com sucesso.` });
});

export default router;
